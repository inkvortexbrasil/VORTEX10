const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

function getFfprobePath() {
  const dir = 'C:\\Users\\inkvo\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe';
  if (fs.existsSync(dir)) {
    try {
      for (const item of fs.readdirSync(dir)) {
        const p = path.join(dir, item, 'bin', 'ffprobe.exe');
        if (fs.existsSync(p)) return `"${p}"`;
      }
    } catch(e) {}
  }
  return 'ffprobe';
}

// 1. Concatena múltiplos arquivos MP3 de forma fluida em um único áudio contínuo
function concatAudioTracks(mp3List, outputPath) {
  return new Promise((resolve, reject) => {
    if (!mp3List || mp3List.length === 0) {
      return reject(new Error('Nenhuma trilha MP3 fornecida para concatenação.'));
    }

    const listPath = outputPath + '_list.txt';
    const listContent = mp3List.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    fs.writeFileSync(listPath, listContent, 'utf-8');

    const cmd = `${getFfmpegPath()} -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`;
    exec(cmd, (err) => {
      try { fs.unlinkSync(listPath); } catch(e) {}
      if (err) return reject(err);
      resolve(outputPath);
    });
  });
}

// 2. Mede a duração total em segundos do arquivo de áudio
function getAudioDuration(audioPath) {
  return new Promise((resolve) => {
    const cmd = `${getFfprobePath()} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    exec(cmd, (err, stdout) => {
      if (err || !stdout) {
        resolve(60); // fallback 60s
      } else {
        const dur = parseFloat(stdout.trim());
        resolve(isNaN(dur) ? 60 : dur);
      }
    });
  });
}

function formatDurationSec(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatStrophicText(text, maxWordsPerLine = 6) {
  const clean = text.replace(/[\r\n]+/g, ' ').replace(/'/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= maxWordsPerLine) return clean;

  const lines = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    lines.push(words.slice(i, i + maxWordsPerLine).join(' '));
  }
  return lines.join('\\N');
}

// 3. Gera o arquivo de Legendas ASS Fluídas em Estrofes Compactas no Centro da Tela (Alignment: 5)
function generateDocumentaryAssScript(sections, totalDuration) {
  // Configuração ASS 1920x1080 (Full HD Horizontal) com Legenda em Estrofe Centralizada (Alignment: 5)
  const header = `[Script Info]
Title: Multiverso Documentários 9.0 Legendas Estróficas Centralizadas
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: DocSubtitle,Montserrat,34,&H00FFFFFF,&H0000E6FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,5,300,300,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const cs = Math.floor((sec % 1) * 100);
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  }

  const numSections = sections.length;
  const sectionDuration = totalDuration / (numSections || 1);
  let events = '';

  sections.forEach((sec, sIdx) => {
    const secStartT = sIdx * sectionDuration;
    const lines = sec.lines || [];

    if (lines.length > 0) {
      const lineDuration = sectionDuration / lines.length;
      lines.forEach((lineText, lIdx) => {
        const lineStart = secStartT + (lIdx * lineDuration);
        const lineEnd = secStartT + ((lIdx + 1) * lineDuration);

        // Formata o texto em estrofes compactas de NO MÁXIMO 6 PALAVRAS POR LINHA
        const strophicText = formatStrophicText(lineText, 6);

        events += `Dialogue: 0,${formatTime(lineStart)},${formatTime(lineEnd)},DocSubtitle,,0,0,0,,${strophicText}\n`;
      });
    }
  });

  return header + events;
}

module.exports = {
  concatAudioTracks,
  getAudioDuration,
  formatDurationSec,
  generateDocumentaryAssScript
};
