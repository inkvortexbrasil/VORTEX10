let globalAudioLibrary = {};

window.openAudioRoom = function() {
  const campaign = AppState.getSelectedCampaign();
  if (!campaign) {
    alert('Por favor, volte na Biblioteca e selecione uma minissérie antes de entrar na Sala de Sonoplastia.');
    return;
  }
  
  const numDisplay = String(campaign.number).padStart(2, '0');
  const titleStr = `Multiverso Auditivo - Minissérie ${numDisplay}`;
  let topicText = 'Sem tema definido';
  if (typeof campaign.topic === 'string') {
    topicText = campaign.topic;
  } else if (campaign.topic && campaign.topic.title) {
    topicText = campaign.topic.title;
  } else if (campaign.topic && campaign.topic.description) {
    topicText = campaign.topic.description;
  } else if (campaign.title) {
    topicText = campaign.title;
  }

  window.updateTopbarTitle(titleStr, topicText);
  window.switchMultiverseRoom('audioRoomView', 'btnNavAudio');
  
  const contentDiv = document.getElementById('audioRoomContent');
  if (!contentDiv) return;

  contentDiv.innerHTML = '<div style="text-align: center; padding: 40px; width: 100%; color: var(--ivTextSecondary);">Preparando console de Sonoplastia... 🎧</div>';
  
  fetch(`/api/storyboard-media?campaign=${encodeURIComponent(campaign.number)}&scene=1`)
    .then(res => res.json())
    .then(data => {
      window.currentAudioVideoUrl = data.sonoplastiaVideo;
      window.currentAudioVideoTitle = data.sonoplastiaVideoTitle;
      window.currentAudioVideos = data.sonoplastiaVideos || [];
      renderAudioRoomLayout(data.sonoplastiaVideo, data.sonoplastiaVideoTitle, window.currentAudioVideos);
    }).catch(e => {
      window.currentAudioVideoUrl = null;
      window.currentAudioVideoTitle = null;
      window.currentAudioVideos = [];
      renderAudioRoomLayout(null, null, []);
    });
};

function renderAudioRoomLayout(videoUrl, videoTitle, videosList = []) {
  const campaign = AppState.getSelectedCampaign();
  const contentDiv = document.getElementById('audioRoomContent');
  if (!contentDiv) return;

  // Player HTML
  let playerHtml = '';
  if (window.isRenderingAudio) {
    playerHtml = `
      <style>
        @keyframes eqPulse {
          0%, 100% { height: 8px; opacity: 0.3; }
          50% { height: 48px; opacity: 1; filter: drop-shadow(0 0 8px var(--cyan)); }
        }
        @keyframes headphoneBeat {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.18) rotate(-4deg); filter: drop-shadow(0 0 25px var(--cyan)); }
          50% { transform: scale(0.92) rotate(4deg); filter: drop-shadow(0 0 35px var(--brand)); }
          75% { transform: scale(1.15) rotate(-2deg); filter: drop-shadow(0 0 25px var(--cyan)); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes soundwaveExpand {
          0% { transform: scale(0.5); opacity: 0.9; border-color: var(--cyan); }
          100% { transform: scale(2.2); opacity: 0; border-color: var(--brand); }
        }
      </style>

      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 350px; background: rgba(8, 12, 24, 0.85); border-radius: 20px; border: 1.5px solid rgba(0, 174, 239, 0.5); padding: 30px 16px; box-shadow: 0 0 60px rgba(0,174,239,0.35), inset 0 0 30px rgba(0,174,239,0.15); backdrop-filter: blur(16px); position: relative; overflow: hidden;">
        
        <!-- Fundo com Néon Pulsante -->
        <div style="position: absolute; inset: -20px; background: radial-gradient(circle at center, rgba(0,174,239,0.25) 0%, rgba(255,0,85,0.15) 50%, transparent 80%); filter: blur(30px); animation: pulseGlow 2s ease-in-out infinite alternate;"></div>

        <!-- CONJUNTO DE ÁUDIO & FONE DINÂMICO -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 28px; width: 100%; position: relative; z-index: 2;">
          
          <!-- Equalizador Esquerdo -->
          <div style="display: flex; gap: 4px; align-items: flex-end; height: 50px;">
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 0.8s ease-in-out infinite 0.1s;"></div>
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 1.2s ease-in-out infinite 0.4s;"></div>
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 0.6s ease-in-out infinite 0.2s;"></div>
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 1.0s ease-in-out infinite 0.5s;"></div>
          </div>

          <!-- Núcleo Central do Fone com Ondas Sonoras -->
          <div style="position: relative; width: 130px; height: 130px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--cyan); animation: soundwaveExpand 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;"></div>
            <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--brand); animation: soundwaveExpand 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.6s;"></div>
            
            <div style="position: absolute; inset: 6px; border-radius: 50%; border: 3px solid transparent; border-top-color: var(--cyan); border-bottom-color: var(--brand); animation: spinGlow 1.2s linear infinite;"></div>
            <div style="position: absolute; inset: -8px; border-radius: 50%; border: 2px dashed rgba(0,210,106,0.4); animation: spinGlow 5s linear reverse infinite;"></div>

            <div style="font-size: 3.8rem; animation: headphoneBeat 1.2s ease-in-out infinite; z-index: 5; text-shadow: 0 0 30px var(--cyan); cursor: default;">🎧</div>
          </div>

          <!-- Equalizador Direito -->
          <div style="display: flex; gap: 4px; align-items: flex-end; height: 50px;">
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 0.9s ease-in-out infinite 0.3s;"></div>
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 0.5s ease-in-out infinite 0.1s;"></div>
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 1.1s ease-in-out infinite 0.6s;"></div>
            <div style="width: 4px; background: var(--brandGrad); border-radius: 4px; animation: eqPulse 0.7s ease-in-out infinite 0.2s;"></div>
          </div>

        </div>

        <h3 style="font-family: var(--uiRounded); font-size: 1.15rem; color: #fff; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 25px rgba(0,174,239,0.9); text-align: center; position: relative; z-index: 2;">
          SÍNTESE SONORA EM ANDAMENTO
        </h3>
        
        <div style="background: rgba(0,0,0,0.7); border: 1px solid rgba(0,210,106,0.4); padding: 9px 18px; border-radius: 50px; display: flex; align-items: center; gap: 10px; position: relative; z-index: 2; box-shadow: 0 0 20px rgba(0,210,106,0.2);">
          <div style="width: 10px; height: 10px; background: #00d26a; border-radius: 50%; box-shadow: 0 0 12px #00d26a; animation: pulseGlow 0.8s infinite alternate;"></div>
          <span id="audioRenderStatusText" style="color: #00d26a; font-family: 'Courier New', monospace; font-size: 0.82rem; font-weight: bold; letter-spacing: 1px;">MOTOR FFMPEG + MISTRAL IA ATIVO...</span>
        </div>
      </div>
    `;
  } else if (videoUrl) {
    playerHtml = `<video id="audioRoomPlayer" src="${videoUrl}" controls loop style="width:100%;max-width:100%;height:auto;border-radius:10px;display:block;background:#000;box-shadow:0 6px 24px rgba(0,0,0,0.7);"></video>`;
    if (videosList && videosList.length > 1) {
      playerHtml += `<div style="display:flex;flex-direction:column;gap:6px;align-items:center;margin-top:14px;width:100%;">`;
      videosList.forEach((v, idx) => {
        const isSel = v.url === videoUrl;
        let name = v.title.replace('.mp4','').replace(/_?[Ll]egendado/g,'').replace(/^\d{2}\s*-\s*/,'').replace(/Voz\s+Voz/gi, 'Voz').trim();
        playerHtml += `<button onclick="window.selectAudioVariation(${idx})" class="actionBtn" style="padding:6px 14px;border-radius:20px;font-size:0.78rem;font-weight:bold;width:100%;max-width:240px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${isSel ? 'background:var(--brandGrad);border:none;color:#fff;box-shadow:0 4px 12px rgba(0,174,239,0.3);' : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);color:var(--ivTextSecondary);'}">${name}</button>`;
      });
      playerHtml += `</div>`;
    }
  } else {
    playerHtml = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px 12px;text-align:center;background:transparent;border:1px dashed rgba(255,255,255,0.18);border-radius:12px;width:100%;min-height:180px;">
        <span style="font-size:2.2rem;">🎧</span>
        <p style="color:rgba(255,255,255,0.6);margin:0;font-size:0.82rem;line-height:1.5;">
          Adicione o MP4 da música na pasta<br>
          <strong style="color:var(--cyan);">/render/${String(campaign.number).padStart(2,'0')}/sonoplastia</strong>
        </p>
        <button class="actionBtn" style="background:var(--brandGrad);color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:0.8rem;font-weight:bold;cursor:pointer;margin-top:4px;" onclick="window.startRenderizarAudio(this)">🎵 LEGENDAR MÚSICAS (FFMPEG)</button>
      </div>
    `;
  }

  const consoleHtml = `
    <div style="display:flex;gap:8px;">
      <div style="flex:1;position:relative;">
        <input type="hidden" id="audioCategorySelect" value="">
        <div id="audioCatDisplay" class="actionBtn" onclick="window.toggleAudioCat()" style="padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);color:#fff;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;gap:4px;">
          <span id="audioCatText" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Categoria...</span>
          <span style="opacity:.4;flex-shrink:0;font-size:0.65rem;">▼</span>
        </div>
        <div id="audioCatList" style="display:none;position:absolute;top:calc(100% + 5px);left:0;right:0;background:rgba(8,10,20,0.97);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.8);"></div>
      </div>
      <div style="flex:1;position:relative;">
        <input type="hidden" id="audioStyleSelect" value="">
        <div id="audioVarDisplay" class="actionBtn" onclick="window.toggleAudioVar()" style="padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);color:#fff;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;gap:4px;">
          <span id="audioVarText" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Variação...</span>
          <span style="opacity:.4;flex-shrink:0;font-size:0.65rem;">▼</span>
        </div>
        <div id="audioVarList" style="display:none;position:absolute;top:calc(100% + 5px);left:0;right:0;background:rgba(8,10,20,0.97);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.8);"></div>
      </div>
      <div style="flex:1;position:relative;">
        <input type="hidden" id="audioVocalSelect" value="">
        <div id="audioVocalDisplay" class="actionBtn" onclick="window.toggleAudioVocal()" style="padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);color:#fff;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;gap:4px;">
          <span id="audioVocalText" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Vocal...</span>
          <span style="opacity:.4;flex-shrink:0;font-size:0.65rem;">▼</span>
        </div>
        <div id="audioVocalList" style="display:none;position:absolute;top:calc(100% + 5px);left:0;right:0;background:rgba(8,10,20,0.97);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.8);">
          <div style="padding:9px 12px;color:#fff;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''" onclick="window.selectAudioVocal('Voz Masculina (PT-BR)')">Voz Masculina (PT-BR)</div>
          <div style="padding:9px 12px;color:#fff;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''" onclick="window.selectAudioVocal('Voz Feminina (PT-BR)')">Voz Feminina (PT-BR)</div>
          <div style="padding:9px 12px;color:#fff;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''" onclick="window.selectAudioVocal('Coral Épico (PT-BR)')">Coral Épico (PT-BR)</div>
        </div>
      </div>
    </div>
    
    <!-- PAINEL DE DEDICATÓRIA AO INSCRITO (CTA DE ENGAJAMENTO YOUTUBE) -->
    <div style="margin-top: 10px; background: rgba(0,174,239,0.06); border: 1px solid rgba(0,174,239,0.25); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; box-sizing: border-box;">
      <label style="display: flex; align-items: center; gap: 8px; color: var(--cyan); font-weight: bold; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">
        <input type="checkbox" id="chkAudioDedicated" onchange="window.toggleAudioDedicatedInput(this.checked)" style="accent-color: var(--cyan); width: 16px; height: 16px; cursor: pointer;">
        🎁 Dedicatória Especial ao Inscrito (CTA YouTube)
      </label>
      
      <div id="boxAudioSubscriber" style="display: none; flex: 1; align-items: center; gap: 8px;">
        <span style="color: rgba(255,255,255,0.6); font-size: 0.8rem; white-space: nowrap;">Nome do Inscrito:</span>
        <input type="text" id="txtAudioSubscriberName" placeholder="Ex: Marco Antônio (ou deixe vazio para [NOME DO INSCRITO])" style="flex: 1; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 6px; padding: 6px 12px; font-size: 0.82rem; outline: none;">
      </div>
    </div>`;

  // ── LAYOUT RECONSTRUÍDO: Réplica exata da arquitetura de viewport do Multiverso Audiovisual (Flow) ──
  contentDiv.innerHTML = `
    <style>
      @keyframes renderBtnPulse {
        0%,100% { opacity:.85; filter:drop-shadow(0 0 5px rgba(255,0,85,.3)); }
        50%      { opacity:1;   filter:drop-shadow(0 0 20px rgba(255,0,85,.8)); }
      }
    </style>
    <div id="audioRoomGrid" style="position: fixed; left: calc(354px + (100vw - 354px) / 2); transform: translateX(-50%); top: 148px; bottom: 25px; width: calc(100vw - 420px); max-width: 1200px; display: flex; gap: 24px; z-index: 60; pointer-events: auto;">
      
      <!-- ZONA ESQUERDA: Player / Sonoplastia (Largura 280px, sem sobrepor a barra lateral) -->
      <div style="width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px;">
        ${playerHtml}
      </div>

      <!-- ZONA DIREITA: Console Musical + Roteiro (Com Scroll Fluído) -->
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; height: 100%;">
        
        <!-- Console Musical (Fixo no topo da coluna) -->
        <div style="flex-shrink: 0; background: transparent; border: none; padding: 0 4px;">
          <p style="color:rgba(255,255,255,0.4);font-size:0.7rem;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 1px;">Console Musical</p>
          ${consoleHtml}
        </div>

        <!-- Área de Resultado e Texto (Rola livremente na área restante) -->
        <div id="audioPromptResult" style="flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto;"></div>

      </div>

    </div>
  `;

  loadAudioLibrary();

  let initialPrompt = campaign.audioPrompt || '';
  let selectedPillName = 'Padrão';

  if (videosList && videosList.length > 0) {
    const activeVideo = videosList.find(v => v.url === videoUrl) || videosList[0];
    if (activeVideo && activeVideo.prompt) {
      initialPrompt = activeVideo.prompt;
    }
    if (activeVideo && activeVideo.title) {
      selectedPillName = activeVideo.title.replace('.mp4', '').replace(/_?[Ll]egendado/g, '').replace(/^\d{2}\s*-\s*/, '').replace(/Voz\s+Voz/gi, 'Voz').trim();
    }
  } else if (videoTitle) {
    selectedPillName = videoTitle.replace('.mp4', '').replace(/_?[Ll]egendado/g, '').replace(/^\d{2}\s*-\s*/, '').replace(/Voz\s+Voz/gi, 'Voz').trim();
  } else if (campaign.audioStyle) {
    selectedPillName = campaign.audioStyle;
  }

  renderAudioPromptResult(selectedPillName, initialPrompt);
}


window.selectAudioVariation = function(index) {
    if (!window.currentAudioVideos || !window.currentAudioVideos[index]) return;
    const v = window.currentAudioVideos[index];
    const cleanTitle = v.title ? v.title.replace('.mp4', '').replace(/_?[Ll]egendado/g, '').replace(/^\d{2}\s*-\s*/, '').replace(/Voz\s+Voz/gi, 'Voz').trim() : 'Padrão';
    renderAudioRoomLayout(v.url, cleanTitle, window.currentAudioVideos);
};

function renderAudioPromptResult(style, prompt) {
  window.lastAudioStyle = style;
  window.lastAudioPrompt = prompt;
  
  const resultGrid = document.getElementById('audioPromptResult');
  if (!resultGrid) return;
  
  const isRendering = window.isRenderingAudio ? true : false;
  const isLegendaTab = window.currentAudioTab === 'legenda';

  const campaign = AppState.getSelectedCampaign();
  const versionStr = style ? style.replace(/^\d{2}\s*-\s*/, '') : 'Padrão';
  
  let fullText = "Legenda social não foi gerada para esta minissérie.";
  if (campaign && campaign.social && campaign.social.caption) {
      const lines = campaign.social.caption.split('\n');
      lines.splice(1, 0, `Versão: ${versionStr}`);
      fullText = lines.join('\n');
  }
  
  window.copyAudioCaption = function() {
      navigator.clipboard.writeText(fullText).then(() => {
          const btn = document.getElementById('btnCopyAudioCaption');
          if (btn) {
              btn.innerHTML = '✅ Copiado!';
              btn.style.background = '#00d26a';
              setTimeout(() => {
                 btn.innerHTML = '📋 Copiar Legenda';
                 btn.style.background = 'var(--brandGrad)';
              }, 2000);
          }
      });
  };

  let contentBody = '';
  
  if (isLegendaTab) {
      contentBody = `
        <div style="background: transparent; border: none; padding: 10px 0; flex: 1; overflow-y: auto; min-height: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 10px;">
             <h3 style="color: var(--cyan); font-family: var(--uiRounded); margin: 0; font-size: 1.05rem;">Legenda para Redes Sociais</h3>
             <button id="btnCopyAudioCaption" onclick="window.copyAudioCaption()" class="actionBtn" style="padding: 6px 14px; font-size: 0.8rem; background: var(--brandGrad); color: #fff; font-weight: bold; border: none; cursor: pointer; border-radius: 6px;">📋 Copiar Legenda</button>
          </div>
          <pre style="white-space: pre-wrap; font-family: var(--readingFont, 'Inter', sans-serif); color: #e0e0e0; font-size: var(--readingFontSize, 0.95rem); line-height: 1.6; margin: 0; padding-bottom: 30px;">${fullText}</pre>
        </div>
      `;
  } else {
      contentBody = `
        <div style="background: transparent; border: none; padding: 10px 0; flex: 1; overflow-y: auto; min-height: 0;">
          <div style="margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);">
            <h3 id="audioResultTitle" style="color: var(--cyan); font-family: var(--uiRounded); margin: 0; font-size: 1.05rem; word-break: break-word;">${style || 'Roteiro Musical'}</h3>
          </div>
          
          <pre style="white-space: pre-wrap; font-family: var(--readingFont, 'Inter', sans-serif); color: #e0e0e0; font-size: var(--readingFontSize, 0.95rem); line-height: 1.6; margin: 0; padding-bottom: 30px;">${prompt || 'Aguardando geração do roteiro sonoro...'}</pre>
        </div>
      `;
  }

  resultGrid.innerHTML = `
    <!-- Barra de Ações Única e Centralizada -->
    <div style="display:flex; gap:8px; align-items:center; justify-content:center; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); flex-wrap:wrap;">
      <button onclick="window.generateAudioPrompt()" class="actionBtn" style="background:var(--brandGrad);color:#fff;border:none;padding:7px 16px;font-weight:bold;font-size:0.82rem;border-radius:6px;cursor:pointer;white-space:nowrap;">✨ GERAR PROMPT (IA)</button>
      <button id="btnRenderCapa4x5" class="actionBtn" style="padding:7px 16px;font-weight:bold;font-size:0.82rem;border-radius:6px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;background:rgba(0,174,239,0.14);border:1px solid rgba(0,174,239,0.4);color:var(--cyan);" onclick="window.startRenderizarCapas4x5(this)">🖼️ RENDERIZAR CAPA (4x5)</button>
      <button id="btnRenderizarAudio" class="actionBtn" style="padding:7px 16px;font-weight:bold;font-size:0.82rem;border-radius:6px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;${isRendering ? 'background:linear-gradient(135deg,#FF0055,#B0003A);color:#fff;opacity:0.8;pointer-events:none;animation:renderBtnPulse 1.5s infinite;' : 'background:transparent;border:1px solid rgba(255,255,255,0.3);color:var(--ivTextSecondary);'}" onclick="window.startRenderizarAudio(this)">${isRendering ? '🎵 Legendando...' : '🎵 Renderizar Clipe'}</button>
      <button onclick="${isLegendaTab ? 'window.copyAudioCaption()' : 'window.copyAudioPrompt(this)'}" data-prompt="${encodeURIComponent(prompt)}" class="actionBtn" style="padding:7px 14px;font-size:0.82rem;background:rgba(255,255,255,0.08);color:#fff;font-weight:bold;border:1px solid rgba(255,255,255,0.18);cursor:pointer;border-radius:6px;white-space:nowrap;">📋 COPIAR</button>
      <button class="actionBtn" style="padding:7px 16px;border-radius:6px;font-weight:bold;font-size:0.82rem;transition:all 0.2s;${isLegendaTab ? 'background:var(--brandGrad);color:#fff;border:none;' : 'background:transparent;border:1px solid rgba(255,255,255,0.3);color:var(--ivTextSecondary);'}" onclick="window.currentAudioTab = window.currentAudioTab === 'legenda' ? 'prompt' : 'legenda'; window.renderAudioPromptResult(window.lastAudioStyle, window.lastAudioPrompt)">📱 LEGENDA SOCIAL</button>
    </div>

    ${contentBody}
  `;
}

async function loadAudioLibrary() {
  try {
    const res = await fetch('/api/audio-library');
    globalAudioLibrary = await res.json();
    
    const catList = document.getElementById('audioCatList');
    if (catList) {
      catList.innerHTML = '';
      for (const cat in globalAudioLibrary) {
        catList.innerHTML += `<div class="glassOption" onclick="window.selectAudioCat('${cat}')">${cat}</div>`;
      }
    }
  } catch(e) {
    console.error('Erro ao carregar biblioteca de áudio', e);
  }
}

window.toggleAudioCat = function() {
  const list = document.getElementById('audioCatList');
  if (list.style.display === 'none') {
    list.style.display = 'block';
    document.getElementById('audioVarList').style.display = 'none';
    document.getElementById('audioVocalList').style.display = 'none';
  } else {
    list.style.display = 'none';
  }
};

window.toggleAudioVar = function() {
  const list = document.getElementById('audioVarList');
  if (list.style.display === 'none') {
    list.style.display = 'block';
    document.getElementById('audioCatList').style.display = 'none';
    document.getElementById('audioVocalList').style.display = 'none';
  } else {
    list.style.display = 'none';
  }
};

window.toggleAudioVocal = function() {
  const list = document.getElementById('audioVocalList');
  if (list.style.display === 'none') {
    list.style.display = 'block';
    document.getElementById('audioCatList').style.display = 'none';
    document.getElementById('audioVarList').style.display = 'none';
  } else {
    list.style.display = 'none';
  }
};

window.selectAudioCat = function(cat) {
  document.getElementById('audioCategorySelect').value = cat;
  document.getElementById('audioCatText').innerText = cat;
  document.getElementById('audioCatList').style.display = 'none';
  
  document.getElementById('audioStyleSelect').value = '';
  document.getElementById('audioVarText').innerText = 'Selecione uma variação...';
  
  const varList = document.getElementById('audioVarList');
  if (varList) {
    varList.innerHTML = '';
    if (globalAudioLibrary[cat]) {
      for (const variation of globalAudioLibrary[cat]) {
        const escapedVar = variation.replace(/'/g, "\\'");
        varList.innerHTML += `<div class="glassOption" onclick="window.selectAudioVar('${escapedVar}')">${variation}</div>`;
      }
    }
  }
};

window.selectAudioVar = function(variation) {
  document.getElementById('audioStyleSelect').value = variation;
  document.getElementById('audioVarText').innerText = variation;
  document.getElementById('audioVarList').style.display = 'none';
};

window.selectAudioVocal = function(vocal) {
  document.getElementById('audioVocalSelect').value = vocal;
  document.getElementById('audioVocalText').innerText = vocal;
  document.getElementById('audioVocalList').style.display = 'none';
};

window.toggleAudioDedicatedInput = function(isChecked) {
  const box = document.getElementById('boxAudioSubscriber');
  if (box) {
    box.style.display = isChecked ? 'flex' : 'none';
  }
};

window.closeAudioRoom = function() {
  document.getElementById('audioRoomView').style.display = 'none';
  document.getElementById('multiverseWelcome').style.display = 'flex';
  if (window.highlightActiveRoom) window.highlightActiveRoom(null);
};

window.generateAudioPrompt = async function() {
  const campaign = AppState.getSelectedCampaign();
  if (!campaign) return;
  
  const catSelect = document.getElementById('audioCategorySelect');
  const varSelect = document.getElementById('audioStyleSelect');
  const vocalSelect = document.getElementById('audioVocalSelect');
  
  if (!catSelect || !varSelect || !vocalSelect || !catSelect.value || !varSelect.value || !vocalSelect.value) {
    alert('Por favor, selecione Categoria, Variação e Vocal antes de gerar o roteiro musical.');
    return;
  }
  
  const style = `${catSelect.value} - ${varSelect.value} | Voz: ${vocalSelect.value}`;
  
  const resultGrid = document.getElementById('audioPromptResult');
  if (!resultGrid) return;
  
  const container = document.getElementById('audioRoomView');
  if (container) container.classList.add('sonic-pulse');

  resultGrid.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; position: relative; flex: 1; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; background: radial-gradient(circle, var(--cyan) 0%, transparent 70%); opacity: 0.15; filter: blur(30px); animation: pulse 2s ease-in-out infinite;"></div>
      <div style="display: flex; gap: 16px; margin-bottom: 24px; z-index: 1;">
        <div style="font-size: 2.5rem; animation: float 3s ease-in-out infinite;">🎵</div>
        <div style="font-size: 3rem; animation: float 2.5s ease-in-out infinite 0.5s; filter: drop-shadow(0 0 10px var(--cyan));">🎹</div>
        <div style="font-size: 2.5rem; animation: float 3.5s ease-in-out infinite 1s;">✨</div>
      </div>
      <h3 style="color: #fff; font-family: var(--uiRounded); font-size: 1.5rem; margin: 0 0 12px 0; letter-spacing: 1px; z-index: 1;">
        SINTETIZANDO ÁUDIO NO VORTEX (MISTRAL IA)
      </h3>
      <p style="color: var(--ivTextSecondary); font-family: var(--uiText); font-size: 1.1rem; max-width: 400px; margin: 0; z-index: 1;">
        Orquestrando frequências para o DNA <strong style="color: var(--cyan); font-weight: 600;">[${style}]</strong>...
      </p>
      <div style="width: 250px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 32px; overflow: hidden; z-index: 1;">
        <div style="width: 50%; height: 100%; background: var(--brandGrad); border-radius: 4px; animation: cyberProgress 2s ease-in-out infinite alternate;"></div>
      </div>
    </div>
    
    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      @keyframes cyberProgress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    </style>
  `;
  
  try {
    const captionText = (campaign.social && campaign.social.caption) ? campaign.social.caption : (campaign.socialCaption || '');
    
    const chkDedicated = document.getElementById('chkAudioDedicated');
    const txtSubscriber = document.getElementById('txtAudioSubscriberName');
    const isDedicated = chkDedicated ? chkDedicated.checked : false;
    const dedicatedSubscriber = txtSubscriber ? txtSubscriber.value.trim() : '';

    const response = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignTitle: campaign.title || (campaign.topic && campaign.topic.title) || `Minissérie ${campaign.number}`,
        style: style,
        caption: captionText,
        scenes: campaign.scenes || [],
        topic: campaign.topic || {},
        isDedicated: isDedicated,
        dedicatedSubscriber: dedicatedSubscriber
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API backend (${response.status})`);
    }

    const data = await response.json();
    const generatedPrompt = data.prompt || data.audioPrompt || 'Roteiro gerado.';

    campaign.audioPrompt = generatedPrompt;
    campaign.audioStyle = style;
    AppState.save();
    renderAudioPromptResult(style, generatedPrompt);
    
  } catch(e) {
    console.warn("API de áudio indisponível, utilizando gerador inteligente de contingência:", e);
    
    const styleParts = style.split(' | ');
    const genero = styleParts[0] || "Cinematic Epic";
    const voz = styleParts[1] || "Sem Voz";
    
    const fallbackPrompt = `[CONTRATO MUSICAL 60S - INKVORTEX BRASIL]\n[Language: pt-BR (Português do Brasil - Fonética Brasileira)]\n[Genre: ${genero}]\n[Vocals: ${voz}]\n[Brand Signature: InkVortex Brasil]\n[Duration: 60s Total]\n\n(Ato 1 - A Preparação 0s-11s)\nIntrodução envolvente de ${campaign.title || 'Minissérie'}, estabelecendo o tom técnico e rítmico em Português do Brasil.\n\n(Ato 2 - O Desenvolvimento 11s-46s)\nDesenvolvimento rítmico progressivo acompanhando a física dos materiais e os detalhes da narrativa visual.\n\n(Ato 3 - O Ápice e Merchã InkVortex 46s-60s)\nClímax musical com menção expressiva da marca InkVortex Brasil e encerramento triunfal.`;

    campaign.audioPrompt = fallbackPrompt;
    campaign.audioStyle = style;
    AppState.save();
    renderAudioPromptResult(style, fallbackPrompt);
  } finally {
    const container = document.getElementById('audioRoomView');
    if (container) container.classList.remove('sonic-pulse');
  }
};

window.copyAudioPrompt = function(btn) {
  const prompt = decodeURIComponent(btn.getAttribute('data-prompt'));
  navigator.clipboard.writeText(prompt).then(() => {
    const originalText = btn.innerText;
    btn.innerText = "COPIADO!";
    btn.style.background = "#fff";
    btn.style.color = "#000";
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "rgba(255,255,255,0.1)";
      btn.style.color = "#fff";
    }, 2000);
  });
};

window.openAudioRoomFromLibrary = function(campaignId) {
  AppState.selectedCampaignId = campaignId;
  AppState.activeStage = 'expansion';
  
  window.openAudioRoom();
};

window.startRenderizarAudio = async function(btn) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) return;

  if (!confirm("O VORTEX8 irá extrair o Áudio bruto, enviar para a API da Mistral para ouvir e legendar a letra estilo TikTok.\nCertifique-se de ter um MP4 na pasta sonoplastia.\nDeseja iniciar a Renderização do Clipe?")) {
    return;
  }

  if (window.isRenderingAudio) return;
  window.isRenderingAudio = true;
  
  // Re-render UI to show pulsing button and the big Synthesis animation
  renderAudioRoomLayout(window.currentAudioVideoUrl, window.currentAudioVideoTitle);
  renderAudioPromptResult(campaign.audioStyle || '', campaign.audioPrompt || '');

  try {
    const res = await fetch('/api/render-audio-subs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: campaign.number })
    });
    
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Erro ao sincronizar legendas');
    }

    window.isRenderingAudio = false;
    
    // Recarrega a sala instantaneamente sem popups travando a tela
    window.openAudioRoom();

  } catch(e) {
    window.isRenderingAudio = false;
    alert('Erro ao gerar clipe: ' + e.message);
    renderAudioPromptResult(campaign.audioStyle || '', campaign.audioPrompt || '');
  }
};

window.startRenderizarCapas4x5 = async function(btn) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) {
    alert('Nenhuma minissérie selecionada.');
    return;
  }

  const originalText = btn ? btn.innerText : '🖼️ RENDERIZAR CAPA (4x5)';
  if (btn) {
    btn.innerText = '🖼️ Extraindo Capas 4x5...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  try {
    const res = await fetch('/api/render-capas-4x5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: campaign.number })
    });
    
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Erro ao renderizar capas');
    }

    if (btn) {
      btn.innerText = '✅ Capas 4x5 Geradas!';
      btn.style.background = '#00d26a';
      btn.style.color = '#fff';
      btn.style.borderColor = '#00d26a';
      btn.style.opacity = '1';
    }

    alert(`✨ Sucesso! ${data.count || 0} capa(s) no formato 4x5 (Instagram) foram geradas a partir do material cru na pasta sonoplastia!`);

    setTimeout(() => {
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.background = 'rgba(0,174,239,0.14)';
        btn.style.borderColor = 'rgba(0,174,239,0.4)';
        btn.style.color = 'var(--cyan)';
      }
    }, 3500);

  } catch(e) {
    if (btn) {
      btn.innerText = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    }
    alert('Erro ao renderizar capas 4x5: ' + e.message);
  }
};

