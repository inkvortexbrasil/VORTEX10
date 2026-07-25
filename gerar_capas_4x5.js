const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sonoDir = 'f:\\VORTEX10\\render\\01\\sonoplastia';
const audioLegDir = 'f:\\VORTEX10\\render\\01\\áudio legendado';

console.log('🔍 Buscando vídeos MP4 crus em:', sonoDir);

if (!fs.existsSync(sonoDir)) {
    console.error('❌ Diretório não encontrado:', sonoDir);
    process.exit(1);
}

if (!fs.existsSync(audioLegDir)) {
    fs.mkdirSync(audioLegDir, { recursive: true });
}

const files = fs.readdirSync(sonoDir).filter(f => f.toLowerCase().endsWith('.mp4'));

console.log(`📁 Encontrados ${files.length} arquivos MP4 crus em sonoplastia:`);

files.forEach((file, index) => {
    const mp4Path = path.join(sonoDir, file);
    const baseName = path.basename(file, '.mp4').replace(/_?[Ll]egendado/gi, '').trim();
    const out4x5Path = path.join(audioLegDir, `01 - ${baseName}_CAPA_4x5.png`);

    console.log(`\n----------------------------------------`);
    console.log(`[${index + 1}/${files.length}] Processando: ${file}`);

    try {
        console.log(`  🎨 Renderizando capa 4x5 (1080x1350 Instagram) -> áudio legendado...`);
        const cmd4x5 = `ffmpeg -y -ss 00:00:00.5 -i "${mp4Path}" -vframes 1 -filter_complex "[0:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,gblur=sigma=40[bg]; [0:v]scale=1080:1080[fg]; [bg][fg]overlay=0:135" "${out4x5Path}"`;
        execSync(cmd4x5, { stdio: 'ignore' });
        console.log(`  ✅ Capa 4x5 salva em: ${path.basename(out4x5Path)}`);

    } catch (err) {
        console.error(`  ❌ Erro ao processar ${file}:`, err.message);
    }
});

// Limpeza da pasta sonoplastia: remover qualquer imagem PNG residual
const pngResiduals = fs.readdirSync(sonoDir).filter(f => f.toLowerCase().endsWith('.png'));
pngResiduals.forEach(png => {
    try {
        fs.unlinkSync(path.join(sonoDir, png));
        console.log(`  🧹 Removido residual: ${png}`);
    } catch(e) {}
});

console.log(`\n========================================`);
console.log(`✨ CONCLUÍDO! Sonoplastia mantida 100% limpa (apenas MP3/MP4) e capas 4x5 gravadas em 'áudio legendado'!`);
