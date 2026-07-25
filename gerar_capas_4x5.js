const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'f:\\VORTEX10\\render\\01\\áudio legendado';

console.log('🔍 Buscando arquivos MP4 em:', targetDir);

if (!fs.existsSync(targetDir)) {
    console.error('❌ Diretório não encontrado:', targetDir);
    process.exit(1);
}

const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.mp4'));

console.log(`📁 Encontrados ${files.length} arquivos MP4 para extração de capas 4x5:`);

files.forEach((file, index) => {
    const mp4Path = path.join(targetDir, file);
    const baseName = path.basename(file, '.mp4');
    
    // Output paths
    const out1x1 = path.join(targetDir, `${baseName}_CAPA_1x1.png`);
    const out4x5 = path.join(targetDir, `${baseName}_CAPA_4x5.png`);

    console.log(`\n----------------------------------------`);
    console.log(`[${index + 1}/${files.length}] Processando: ${file}`);

    try {
        // 1. Extrair capa original 1:1 (PNG)
        console.log(`  📸 Extraindo capa original 1:1...`);
        const cmd1x1 = `ffmpeg -y -ss 00:00:00.5 -i "${mp4Path}" -vframes 1 "${out1x1}"`;
        execSync(cmd1x1, { stdio: 'ignore' });
        console.log(`  ✅ Capa 1x1 salva em: ${path.basename(out1x1)}`);

        // 2. Renderizar composição 4:5 (1080x1350) com fundo desfocado elegante
        console.log(`  🎨 Renderizando capa no formato 4x5 (1080x1350 Instagram)...`);
        const cmd4x5 = `ffmpeg -y -ss 00:00:00.5 -i "${mp4Path}" -vframes 1 -filter_complex "[0:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,gblur=sigma=40[bg]; [0:v]scale=1080:1080[fg]; [bg][fg]overlay=0:135" "${out4x5}"`;
        execSync(cmd4x5, { stdio: 'ignore' });
        console.log(`  ✅ Capa 4x5 salva em: ${path.basename(out4x5)}`);

    } catch (err) {
        console.error(`  ❌ Erro ao processar ${file}:`, err.message);
    }
});

console.log(`\n========================================`);
console.log(`✨ CONCLUÍDO! Todas as capas 4x5 para Instagram foram geradas com sucesso!`);
