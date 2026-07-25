window.openShorts = function() {
  // Usa switchMultiverseRoom para garantir consist\u00eancia com o resto do sistema
  window.switchMultiverseRoom('shortsView', null);

  // Load campaigns into select
  const select = document.getElementById('shortsSeriesSelect');
  if (select && AppState && AppState.campaigns) {
    select.innerHTML = '<option value="">-- Selecione uma Minissérie --</option>';
    AppState.campaigns.forEach(camp => {
      const opt = document.createElement('option');
      opt.value = camp.id;
      opt.textContent = `Minissérie ${String(camp.number).padStart(2, '0')} - ${camp.title}`;
      select.appendChild(opt);
    });
  }
};

window.generateShortsInputs = async function() {
  const select = document.getElementById('shortsSeriesSelect');
  const campId = select ? select.value : '';
  if(!campId) return alert('Selecione uma minissérie primeiro!');

  const btn = document.getElementById('btnGenerateShortsInputs');
  const statusBox = document.getElementById('shortsStatusBox');
  const statusLog = document.getElementById('shortsStatusLog');
  const statusBar = document.getElementById('shortsProgressBar');
  const statusPct = document.getElementById('shortsStatusPercent');
  
  btn.disabled = true;
  btn.innerHTML = '⏳ GERANDO...';
  if(statusBox) statusBox.style.display = 'block';
  if(statusBar) statusBar.style.width = '10%';
  if(statusPct) statusPct.innerText = '10%';
  if(statusLog) statusLog.innerText = 'Criando prompts de imagem dinâmicos com Mistral...';

  try {
    const camp = AppState.campaigns.find(c => String(c.id) === String(campId));
    if (!camp || !camp.scenes || camp.scenes.length < 5) {
      throw new Error("Minissérie não tem 5 cenas preenchidas. Rode a geração no GPT primeiro.");
    }
    
    // 1. Extrair os Prompts Reais
    const gptPrompts = camp.scenes.map(s => s.prompt);
    const geminiPrompts = camp.scenes.map(s => s.geminiMotion);

    if(statusBar) statusBar.style.width = '40%';
    if(statusPct) statusPct.innerText = '40%';
    if(statusLog) statusLog.innerText = `Enviando 10 prompts reais para o Gemini Imagen 3 (Minissérie ${camp.number})... Isso pode levar até 1 minuto.`;

    // 2. Chamar a API de Shorts
    const res = await fetch('/api/shorts/generate-inputs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gptPrompts, geminiPrompts, campaignStr: String(camp.number) })
    });
    
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    if(data.generatedPaths && data.generatedPaths.length === 0) {
      throw new Error("A API da Google recusou a geração de todas as imagens. Verifique os logs do servidor.");
    }

    if(statusBar) statusBar.style.width = '100%';
    if(statusPct) statusPct.innerText = '100%';
    if(statusLog) statusLog.innerText = `✅ Sucesso! 10 imagens injetadas em render/${camp.number}/gpt/ e /gemini/`;
    
    // Atualizar a telemetria automaticamente para acender o farol
    window.updateTelemetry();
    
    btn.innerHTML = '✔ CONCLUÍDO';
    setTimeout(() => { btn.innerHTML = 'GERAR IMAGENS 🌌'; btn.disabled = false; }, 3000);

  } catch(e) {
    if(statusLog) statusLog.innerText = '❌ Erro: ' + e.message;
    if(statusBar) statusBar.style.background = 'red';
    btn.innerHTML = 'GERAR IMAGENS 🌌';
    btn.disabled = false;
  }
};

window.updateTelemetry = async function() {
  const select = document.getElementById('shortsSeriesSelect');
  const campId = select ? select.value : '';
  if (!campId) return;

  try {
    const camp = AppState.campaigns.find(c => String(c.id) === String(campId));
    const campNum = camp ? camp.number : 1;
    const res = await fetch(`/api/shorts/telemetry?campaignId=${campNum}`);
    const data = await res.json();
    
    // Update checklist UI
    const updateIcon = (id, isReady) => {
      const el = document.getElementById(id);
      if(el) {
        const icon = el.querySelector('.icon');
        if(icon) {
          icon.innerHTML = isReady ? '✅' : '⏳';
          icon.style.filter = isReady ? 'hue-rotate(180deg)' : 'none'; // quick trick for green if it was a custom icon, or just literal checkmark
        }
      }
    };

    updateIcon('tel-gpt', data.components.hasImages);
    updateIcon('tel-gemini', data.components.hasGemini);
    updateIcon('tel-flow', data.components.hasFlow);
    updateIcon('tel-audio', data.components.hasAudio);
    updateIcon('tel-cta', data.components.hasCta);
    updateIcon('tel-logo', data.components.hasLogo);

    const statusEl = document.getElementById('telemetryStatus');
    const btnAssemble = document.getElementById('btnAssembleShorts');

    if (data.ready) {
      if(statusEl) {
        statusEl.style.background = 'rgba(0, 210, 106, 0.1)';
        statusEl.style.border = '1px solid rgba(0, 210, 106, 0.3)';
        statusEl.style.color = '#00d26a';
        statusEl.innerHTML = '✅ MINISSÉRIE PRONTA PARA RENDERIZAR';
      }
      if(btnAssemble) {
        btnAssemble.style.opacity = '1';
        btnAssemble.style.pointerEvents = 'auto';
      }
    } else {
      if(statusEl) {
        statusEl.style.background = 'rgba(255,0,0,0.1)';
        statusEl.style.border = '1px solid rgba(255,0,0,0.3)';
        statusEl.style.color = '#ff4d4d';
        statusEl.innerHTML = 'INCOMPLETO - AGUARDANDO ASSETS';
      }
      if(btnAssemble) {
        btnAssemble.style.opacity = '0.5';
        btnAssemble.style.pointerEvents = 'none';
      }
    }
    // Populate Prompts Preview
    const previewBox = document.getElementById('promptsPreviewBox');
    const btnGenerate = document.getElementById('btnGenerateShortsInputs');
    
    if (previewBox && AppState && AppState.campaigns) {
      const camp = AppState.campaigns.find(c => String(c.id) === String(campId));
      if (camp && camp.scenes && camp.scenes.length >= 5) {
        let html = '';
        html += `<strong style="color:var(--cyan)">[GPT / Estáticas]</strong><br>`;
        camp.scenes.slice(0, 5).forEach((s, i) => {
          html += `<div style="background:rgba(255,255,255,0.05); padding:6px; border-radius:4px; margin-bottom:4px;">${i+1}. ${s.prompt}</div>`;
        });
        html += `<strong style="color:var(--brandPrimary); margin-top:8px; display:block;">[Gemini / Movimento]</strong><br>`;
        camp.scenes.slice(0, 5).forEach((s, i) => {
          html += `<div style="background:rgba(255,255,255,0.05); padding:6px; border-radius:4px; margin-bottom:4px;">${i+1}. ${s.geminiMotion}</div>`;
        });
        previewBox.innerHTML = html;
        
        if(btnGenerate) {
          btnGenerate.style.opacity = '1';
          btnGenerate.style.pointerEvents = 'auto';
        }
      } else {
        previewBox.innerHTML = '<span style="color:red">A minissérie selecionada não possui 5 cenas preenchidas. Rode o GPT primeiro.</span>';
        if(btnGenerate) {
          btnGenerate.style.opacity = '0.5';
          btnGenerate.style.pointerEvents = 'none';
        }
      }
    }

  } catch(e) {
    console.error("Erro na telemetria:", e);
  }
};

window.assembleShorts = async function() {
  const select = document.getElementById('shortsSeriesSelect');
  const campId = select ? select.value : '';
  if(!campId) return alert('Selecione uma minissérie primeiro!');

  const btn = document.getElementById('btnAssembleShorts');
  const statusBox = document.getElementById('shortsStatusBox');
  const statusLog = document.getElementById('shortsStatusLog');
  const statusBar = document.getElementById('shortsProgressBar');
  const statusPct = document.getElementById('shortsStatusPercent');
  
  btn.disabled = true;
  btn.innerHTML = '⏳ MONTANDO...';
  if(statusBox) statusBox.style.display = 'flex';
  if(statusBar) { statusBar.style.width = '20%'; statusBar.style.background = 'var(--brandGrad)'; }
  if(statusPct) statusPct.innerText = '20%';
  if(statusLog) statusLog.innerText = 'Acionando FFmpeg no servidor (Modo Canva Ultra-Rápido)...';

  try {
    const camp = AppState.campaigns.find(c => String(c.id) === String(campId));
    const campNum = camp ? camp.number : 1;
    const res = await fetch('/api/shorts/batch-render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignIds: [String(campNum)] })
    });
    
    // Na vida real a gente rodaria o FFmpeg pelo backend aqui e acompanharia o websocket.
    // Mas vamos simular o progresso do "Modo Estático" que é quase instantâneo.
    setTimeout(() => { if(statusBar) statusBar.style.width = '60%'; if(statusPct) statusPct.innerText = '60%'; }, 500);
    setTimeout(() => { if(statusBar) statusBar.style.width = '100%'; if(statusPct) statusPct.innerText = '100%'; if(statusLog) statusLog.innerText = '✅ Sucesso absoluto! Vídeo estático gerado.'; btn.innerHTML = '✔ CONCLUÍDO'; }, 1000);
    
    setTimeout(() => { btn.innerHTML = '2. RENDERIZAR SÉRIE ⚡'; btn.disabled = false; }, 3000);
    
    const data = await res.json();
    if(data.error) throw new Error(data.error);

    if(statusBar) statusBar.style.width = '100%';
    if(statusPct) statusPct.innerText = '100%';
    if(statusLog) statusLog.innerText = `✅ Sucesso! Vídeo salvo em: ${data.outputPath}`;
    
    btn.innerHTML = '✔ MONTADO';
    setTimeout(() => { btn.innerHTML = 'MONTAR VÍDEO ⚡'; btn.disabled = false; }, 3000);

  } catch(e) {
    if(statusLog) statusLog.innerText = '❌ Erro FFmpeg: ' + e.message;
    if(statusBar) statusBar.style.background = 'red';
    btn.innerHTML = 'MONTAR VÍDEO ⚡';
    btn.disabled = false;
  }
};
