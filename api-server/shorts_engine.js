const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function getFfmpegPath() {
  const dir = 'C:\\Users\\inkvo\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe';
  if (fs.existsSync(dir)) {
    try {
      for (const item of fs.readdirSync(dir)) {
        const p = path.join(dir, item, 'bin', 'ffmpeg.exe');
        if (fs.existsSync(p)) return `"${p}"`;
      }
    } catch(e) {}
  }
  return 'ffmpeg';
}

const FFMPEG_PATH = getFfmpegPath();

/**
 * Assemblador dinâmico de Shorts (50s)
 * @param {Object} params
 * @param {string} params.coverImagePath - 1s
 * @param {string} params.masterVideoPath - 10s
 * @param {string[]} params.contentImagePaths - 5 imagens x 4s = 20s
 * @param {string[]} params.ctaImagePaths - 3 imagens x 3s = 9s
 * @param {string} params.logoVideoPath - 10s
 * @param {string} params.soundtrackPath - Trilha de fundo
 * @param {string} params.voicePath - (Opcional) Locução
 * @param {string} params.outputPath - Arquivo de saída mp4
 */
function assembleShortsVideo(params) {
    return new Promise((resolve, reject) => {
        try {
            const inputs = [];
            const filterChains = [];
            let inputIdx = 0;

            // Constantes de resolução (Shorts 9:16)
            const W = 1080;
            const H = 1920;

            // MODO CANVA: Sem efeitos dinâmicos de Zoom para poupar CPU e renderizar ultra-rápido.
            const staticScale = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;

            let concatStreams = '';

            // 0. Capa (1s)
            inputs.push(`-loop 1 -t 1 -i "${params.coverImagePath}"`);
            filterChains.push(`[${inputIdx}:v]${staticScale},setsar=1[v${inputIdx}]`);
            filterChains.push(`anullsrc=r=44100:cl=stereo:d=1[a${inputIdx}]`);
            concatStreams += `[v${inputIdx}][a${inputIdx}]`;
            inputIdx++;

            // 1. Master Video (10s)
            inputs.push(`-t 10 -i "${params.masterVideoPath}"`);
            filterChains.push(`[${inputIdx}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=25[v${inputIdx}]`);
            filterChains.push(`[${inputIdx}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a${inputIdx}]`);
            concatStreams += `[v${inputIdx}][a${inputIdx}]`;
            inputIdx++;

            // 2. Imagens de Conteúdo (5x 4s = 20s)
            params.contentImagePaths.forEach((imgPath) => {
                inputs.push(`-loop 1 -t 4 -i "${imgPath}"`);
                filterChains.push(`[${inputIdx}:v]${staticScale},setsar=1[v${inputIdx}]`);
                filterChains.push(`anullsrc=r=44100:cl=stereo:d=4[a${inputIdx}]`);
                concatStreams += `[v${inputIdx}][a${inputIdx}]`;
                inputIdx++;
            });

            // 3. Imagens de CTA (3x 3s = 9s)
            params.ctaImagePaths.forEach((imgPath) => {
                inputs.push(`-loop 1 -t 3 -i "${imgPath}"`);
                filterChains.push(`[${inputIdx}:v]${staticScale},setsar=1[v${inputIdx}]`);
                filterChains.push(`anullsrc=r=44100:cl=stereo:d=3[a${inputIdx}]`);
                concatStreams += `[v${inputIdx}][a${inputIdx}]`;
                inputIdx++;
            });

            // 4. Logo Video/Image (10s)
            if (params.logoVideoPath.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/i)) {
                inputs.push(`-loop 1 -t 10 -i "${params.logoVideoPath}"`);
                filterChains.push(`[${inputIdx}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=25[v${inputIdx}]`);
                filterChains.push(`anullsrc=r=44100:cl=stereo:d=10[a${inputIdx}]`);
            } else {
                inputs.push(`-t 10 -i "${params.logoVideoPath}"`);
                filterChains.push(`[${inputIdx}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=25[v${inputIdx}]`);
                filterChains.push(`[${inputIdx}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a${inputIdx}]`);
            }
            concatStreams += `[v${inputIdx}][a${inputIdx}]`;
            inputIdx++;

            // Concat (Apenas Visual + Audio Original das cenas)
            filterChains.push(`${concatStreams}concat=n=${inputIdx}:v=1:a=1[outv][concat_a]`);
            const filterComplex = filterChains.join('; ');

            if (params.soundtrackPath || params.voicePath) {
                // PASS 1: Renderiza o vídeo base de 50s sem a trilha sonora
                const tempBaseFile = params.outputPath.replace('.mp4', '_temp_base.mp4');
                const cmdPass1 = `${FFMPEG_PATH} -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[outv]" -map "[concat_a]" -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart "${tempBaseFile}"`;
                
                console.log("Executando FFmpeg Pass 1 (Vídeo Base 50s)...");
                exec(cmdPass1, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("Erro no FFmpeg Pass 1:", stderr);
                        return reject(error);
                    }
                    console.log("Pass 1 Finalizado. Executando Pass 2 (Loop Infinito + Trilha)...");
                    
                    // PASS 2: Loop infinito do vídeo cruzado com o áudio
                    let bgInputs = '';
                    let mixFilter = '';
                    
                    if (params.voicePath && params.soundtrackPath) {
                        bgInputs = `-stream_loop -1 -i "${params.soundtrackPath}" -i "${params.voicePath}"`;
                        mixFilter = `[0:a]volume=1.0[base_a]; [1:a]volume=1.0[bg_a]; [2:a]volume=1.0[voice_a]; [base_a][bg_a][voice_a]amix=inputs=3:duration=first:dropout_transition=2:normalize=0[out_a]`;
                    } else if (params.soundtrackPath) {
                        bgInputs = `-stream_loop -1 -i "${params.soundtrackPath}"`;
                        mixFilter = `[0:a]volume=1.0[base_a]; [1:a]volume=1.0[bg_a]; [base_a][bg_a]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[out_a]`;
                    } else if (params.voicePath) {
                        bgInputs = `-i "${params.voicePath}"`;
                        mixFilter = `[0:a]volume=1.0[base_a]; [1:a]volume=1.0[voice_a]; [base_a][voice_a]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[out_a]`;
                    }
                    
                    // -stream_loop -1 faz o vídeo base repetir infinitamente.
                    // -shortest garante que o vídeo e o ffmpeg terminem assim que o áudio acabar.
                    // -c:v copy garante que o processamento seja instantâneo sem re-renderizar as imagens.
                    const cmdPass2 = `${FFMPEG_PATH} -y -stream_loop -1 -i "${tempBaseFile}" ${bgInputs} -filter_complex "${mixFilter}" -map 0:v -map "[out_a]" -c:v copy -c:a aac -shortest "${params.outputPath}"`;
                    
                    exec(cmdPass2, { maxBuffer: 1024 * 1024 * 10 }, (err, stdOut2, stdErr2) => {
                        // Limpa o arquivo temporário
                        if (fs.existsSync(tempBaseFile)) fs.unlinkSync(tempBaseFile);
                        
                        if (err) {
                            console.error("Erro no FFmpeg Pass 2:", stdErr2);
                            return reject(err);
                        }
                        console.log("✅ FFmpeg Loop Infinito finalizado com sucesso!");
                        resolve(params.outputPath);
                    });
                });
            } else {
                // Se não tem trilha, apenas renderiza os 50s direto
                const cmd = `${FFMPEG_PATH} -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[outv]" -map "[concat_a]" -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart "${params.outputPath}"`;
                console.log("Executando FFmpeg Shorts Engine (Sem Trilha)...");
                exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("Erro no FFmpeg Shorts:", stderr);
                        return reject(error);
                    }
                    console.log("✅ FFmpeg finalizou a renderização com sucesso!");
                    resolve(params.outputPath);
                });
            }
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Motor FFMPEG para queimar legendas dinâmicas (.ass) em cima de um videoclipe
 */
function burnSubtitlesToAudioVideo(params) {
    return new Promise((resolve, reject) => {
        try {
            // No Windows, o filtro ass do FFMPEG exige um path com barras normais (/) 
            // e dois pontos escapados (\:) caso tenha drive letter (C\:).
            let formattedAss = params.assFile.replace(/\\/g, '/');
            formattedAss = formattedAss.replace(/:/g, '\\:');
            
            // Corte Inteligente (Smart Trim): Injeta -ss antes do -i para corte rápido e preciso
            const ssParam = params.trimStartTime && params.trimStartTime > 0 ? `-ss ${params.trimStartTime}` : '';
            
            // Caminho absoluto para a pasta de fontes customizadas (Montserrat Black)
            let fontsDir = require('path').join(__dirname, 'fonts').replace(/\\/g, '/');
            fontsDir = fontsDir.replace(/:/g, '\\:'); // Escapar o 2 pontos do drive letter pro FFMPEG não achar que é outro parâmetro

            // Queima as legendas, copia o áudio original.
            // O parâmetro fontsdir instrui o FFMPEG a procurar a fonte Montserrat Black nesta pasta
            const cmd = `${FFMPEG_PATH} -y ${ssParam} -i "${params.inputVideo}" -vf "ass='${formattedAss}':fontsdir='${fontsDir}'" -c:v libx264 -pix_fmt yuv420p -c:a copy -movflags +faststart "${params.outputPath}"`;

            console.log("Executando FFmpeg Subtitles Engine (Queima de Legendas Dinâmicas)...");
            exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                if (error) {
                    console.error("Erro no FFmpeg Subtitles:", stderr);
                    return reject(error);
                }
                console.log("✅ FFmpeg Legendas Dinâmicas finalizado com sucesso!");
                resolve(params.outputPath);
            });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { assembleShortsVideo, burnSubtitlesToAudioVideo };
