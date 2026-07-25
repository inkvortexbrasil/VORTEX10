// Renderização de Interface - Vortex 8

window.highlightActiveRoom = function(roomId) {
  // Inclui todos os botões de órbita (esquerda E direita)
  const btns = ['btnNavSocial', 'btnNavStoryboard', 'btnNavAudio', 'btnNavFlow', 'btnNavLibrary', 'btnNavDocumentarios', 'btnNavComercial'];
  btns.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === roomId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
};

// Lightbox global para imagens das salas Visual e Editorial
window.openLightbox = function(src) {
  if (!src) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(8px);';
  overlay.innerHTML = `
    <img src="${src}" style="max-height:92vh;max-width:92vw;object-fit:contain;border-radius:12px;box-shadow:0 0 80px rgba(0,0,0,0.8);">
    <button style="position:absolute;top:24px;right:32px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:1.8rem;width:52px;height:52px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:all 0.2s;" onmouseover="this.style.background='var(--brandGrad)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">✕</button>
  `;
  overlay.addEventListener('click', () => document.body.removeChild(overlay));
  document.body.appendChild(overlay);
};

window.addEventListener('keyup', function(e) {
  if (e.key === 'Escape') {
    // 0. Se o modal da galeria de fotos do CTA Comercial estiver aberto, fecha apenas ele!
    const ctaModal = document.getElementById('ctaLightboxModal');
    if (ctaModal && ctaModal.style.display !== 'none') {
      ctaModal.style.display = 'none';
      return;
    }

    // 0.1 Se o modal da galeria de fotos do documentário estiver aberto, fecha apenas ele!
    const docModal = document.getElementById('docImageLightboxModal');
    if (docModal && docModal.style.display !== 'none') {
      if (typeof window.closeDocImageModal === 'function') {
        window.closeDocImageModal();
      } else {
        docModal.style.display = 'none';
      }
      return;
    }

    // 1. Pausa áudio e vídeo em qualquer lugar da página (Anti-ghosting)
    document.querySelectorAll('audio, video').forEach(media => {
      if (!media.paused) {
          media.pause();
          media.currentTime = 0;
      }
    });

    // 2. Fecha todas as salas
    const rooms = [
      'socialMediaView', 'storyboardView', 'flowRoomView', 'audioRoomView',
      'shortsView', 'documentariosRoomView', 'pageLibrary',
      'studioImmersiveModal'
    ];
    rooms.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.classList.contains('fullscreen-presentation')) {
        el.style.display = 'none';
      } else if (el) {
        el.style.display = 'none';
      }
    });

    // 3. Remove destaques dos botões das órbitas
    window.highlightActiveRoom(null);

    // 4. Restaura o painel central do Multiverso
    const welcome = document.getElementById('multiverseWelcome');
    if (welcome) welcome.style.display = 'flex';
  }
});

const UI = {
  pageLibrary: null,
  subjectsGrid: null,
  leftPanel: null,
  contentArea: null,
  
  init() {
    this.pageLibrary = document.getElementById('pageLibrary');
    this.subjectsGrid = document.getElementById('subjectsGrid');
    this.leftPanel = document.getElementById('workspaceLeftPanel');
    this.contentArea = document.getElementById('multiversePromptsArea');
    
    this.renderWorkspace();
  },
  
  renderWorkspace() {
    if (typeof window.switchMultiverseRoom === 'function') {
      window.switchMultiverseRoom('multiverseWelcome', null);
    }

    
    if (typeof window.renderMultiverseControlPanel === 'function') {
        window.renderMultiverseControlPanel();
    }
  },

  renderIdeationGrid() {
    // This function can just render the subjects grid
    if (!this.subjectsGrid) return;
    
    // Força a exibição do painel direito na tela de Welcome para mostrar o resultado da ideação
    this.subjectsGrid.style.display = 'flex';
    
    if (AppState.isGeneratingSubjects) {
      const nums = AppState.generatingNumbers.join(', ');
      this.subjectsGrid.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: pulse 2s infinite;">
          <div style="font-size: 3rem; margin-bottom: 16px; animation: spinGlow 3s linear infinite;">🌀</div>
          <h2 style="color: transparent; background: var(--brandGrad); -webkit-background-clip: text; font-family: var(--uiRounded); font-size: 1.5rem; letter-spacing: 2px;">EXPANDINDO CONSCIÊNCIA...</h2>
          <p style="color: var(--ivTextSecondary); margin-top: 8px;">Mapeando vetores para as minisséries ${nums}</p>
        </div>
      `;
      return;
    }
    
    let recentLogHtml = '';
    if (AppState.suggestedSubjects && AppState.suggestedSubjects.length > 0) {
      const nums = AppState.suggestedSubjects.map(id => {
        const c = AppState.campaigns.find(camp => camp.id === id);
        return c ? String(c.number).padStart(2, '0') : '';
      }).filter(Boolean).join(', ');
      
      if (nums) {
        recentLogHtml = `
          <div style="margin-top: 16px; display: inline-block; animation: textGlow 3s infinite;">
            <p style="color: #00d26a; margin: 0; font-family: var(--uiRounded); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px rgba(0,210,106,0.8);">
              ✅ SUCESSO: ASSUNTOS ${nums} ROTEADOS PARA A BIBLIOTECA
            </p>
          </div>
        `;
      }
    }
    
    this.subjectsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 40px; background: transparent; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.9; filter: drop-shadow(0 0 15px rgba(255,255,255,0.2));">🛰️</div>
        <h2 style="color: transparent; background: var(--brandGrad); -webkit-background-clip: text; font-family: var(--uiRounded); font-size: 2rem; margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase;">SISTEMA EM ÓRBITA E PRONTO</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 1.05rem; max-width: 650px; margin-bottom: 16px; line-height: 1.5; text-shadow: 0 4px 10px rgba(0,0,0,0.9);">
          O motor de <strong>Inteligência Editorial V8</strong> está ativo e aguarda seus comandos para varrer as redes em busca de novas inovações e abordagens inéditas.
        </p>
        
        ${recentLogHtml}
        
        <div style="display: flex; gap: 40px; justify-content: center; flex-wrap: wrap; margin-top: 24px; margin-bottom: 32px;">
           <div style="background: transparent; padding: 10px; text-align: center;">
             <h4 style="color: transparent; background: var(--brandGrad); -webkit-background-clip: text; font-size: 2.2rem; margin-bottom: 4px; font-family: var(--uiRounded);">100%</h4>
             <span style="color: #fff; font-size: 0.85rem; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">Capacidade Neural</span>
           </div>
           <div style="background: transparent; padding: 10px; text-align: center;">
             <h4 style="color: transparent; background: var(--brandGrad); -webkit-background-clip: text; font-size: 2.2rem; margin-bottom: 4px; font-family: var(--uiRounded);">ATIVO</h4>
             <span style="color: #fff; font-size: 0.85rem; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">DNA InkVortex</span>
           </div>
      </div>
    `;
  },

  openStudioModal(title) {
    const modal = document.getElementById('studioImmersiveModal');
    if(modal) {
      modal.style.display = 'flex';
      const titleEl = document.getElementById('studioModalTitle');
      if (titleEl) titleEl.innerText = title;
      
      const welcome = document.getElementById('multiverseWelcome');
      if (welcome) welcome.style.display = 'none';
    }
  },
  
  closeStudioModal() {
    const modal = document.getElementById('studioImmersiveModal');
    if(modal) {
      modal.style.display = 'none';
      AppState.studioActiveTab = '';
      
      const welcome = document.getElementById('multiverseWelcome');
      if (welcome) welcome.style.display = 'flex';
    }
  },

  renderStudio() {
    AppState.save();
    if (AppState.isGenerating) return;
    if (typeof window.renderMultiverseControlPanel === 'function') {
        window.renderMultiverseControlPanel();
    }
  },


  renderGPTArea() {
    const campaign = AppState.getSelectedCampaign();
    if(!campaign) return;

    if (!campaign.generatedGPT) {
      this.contentArea.innerHTML = `
        <div style="padding: 32px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h2 style="color: #fff; font-family: var(--uiRounded); margin-bottom: 16px;">Direção de Arte (GPT)</h2>
          <p style="color: var(--ivTextSecondary); margin-bottom: 32px; max-width: 500px;">O motor está pronto. Clique abaixo para gerar 5 roteiros hiper-realistas para esta minissérie.</p>
          <button class="actionBtn" style="background:var(--brandGrad); padding:16px 32px; font-size:1.1rem; border:none;" onclick="handleGenerateAction('gpt', '${campaign.id}')">✨ GERAR MINISSÉRIE (GPT)</button>
        </div>
      `;
      return;
    }

    const activeIdx = AppState.activeSceneIndex || 0;
    
    const tabsHtml = campaign.scenes.map((s, idx) => {
      const isActive = activeIdx === idx;
      return `
        <button style="background: ${isActive ? 'rgba(255,255,255,0.15)' : 'transparent'}; color: ${isActive ? '#fff' : 'var(--ivTextSecondary)'}; border: 1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}; padding: 5px 9px; border-radius: 8px; font-weight: ${isActive ? 'bold' : 'normal'}; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; font-size: 0.76rem;" onclick="window.switchSceneTab(${idx}, 'gpt')">
          CENA ${s.no}
        </button>
      `;
    }).join('');

    let contentHtml = '';
    if (campaign.scenes.length > 0 && campaign.scenes[activeIdx]) {
      const s = campaign.scenes[activeIdx];
      contentHtml = `
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 8px; flex-shrink: 0;">
          <button class="badge actionBtn" style="cursor: pointer; background: ${s.copiedGPT ? 'var(--brandGrad)' : 'rgba(0, 174, 239, 0.25)'}; color: #fff; border: 1px solid ${s.copiedGPT ? 'transparent' : 'var(--cyan)'}; padding: 6px 18px; font-size: 0.8rem; font-weight: bold; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0, 174, 239, 0.3);" onclick="window.copyExpandedContent('gpt', ${activeIdx}, this)">
            ${s.copiedGPT ? 'COPIADO ✓' : '📋 COPIAR CENA'}
          </button>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding-right: 6px; mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%);">
          <p id="gptPromptText_${activeIdx}" style="color: #e2e8f0; font-family: var(--readingFont, 'Inter', sans-serif); font-size: calc(0.86rem * var(--readingFontSizeMultiplier, 1)); line-height: 1.55; white-space: pre-wrap; text-shadow: 0 1px 3px rgba(0,0,0,0.9); margin: 0; padding: 4px 8px 75px 8px;">
            ${s.assembledPrompt || s.prompt}
          </p>
        </div>
      `;
    }

    this.contentArea.innerHTML = `
      <div style="padding: 0 8px 16px 8px; height: 100%; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
        <div style="display: flex; gap: 5px; justify-content: center; width: 100%; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; flex-shrink: 0; box-sizing: border-box;">
          ${tabsHtml}
        </div>
        ${contentHtml}
      </div>
    `;

    // Async Live Prefix Injection (VORTEX 8 Behavior)
    if (campaign.scenes.length > 0 && campaign.scenes[activeIdx]) {
      const s = campaign.scenes[activeIdx];
      setTimeout(async () => {
        try {
          if (typeof window.fetchPrefix !== 'function') return;
          const prefixRaw = await window.fetchPrefix('./gpt/abertura.txt');
          const prefix = prefixRaw.replace(/\[TÍTULO EXATO AQUI\]\r?\n?/g, '');
          const exactBlock = `TITULO EXATO: "${s.title || campaign.title}"`;
          const finalPrompt = s.prompt;
          const assembled = (prefix ? prefix.trim() + "\n\n" : "") + exactBlock + "\n\n" + finalPrompt;
          
          const pEl = document.getElementById(`gptPromptText_${activeIdx}`);
          if (pEl) pEl.innerText = assembled;
        } catch(e) { console.error("Erro ao carregar prefixo GPT", e); }
      }, 50);
    }
  },
  
  renderGeminiArea() {
    const campaign = AppState.getSelectedCampaign();
    if(!campaign) return;

    if (!campaign.generatedGPT) {
      this.contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:var(--ivTextSecondary);">Gere primeiro as Cenas GPT.</div>`;
      return;
    }
    
    if (!campaign.generatedGemini) {
      this.contentArea.innerHTML = `
        <div style="padding: 32px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h2 style="color: var(--magenta); font-family: var(--uiRounded); margin-bottom: 16px;">Movimentos Dinâmicos (Gemini)</h2>
          <p style="color: var(--ivTextSecondary); margin-bottom: 32px; max-width: 500px;">Baseado nos roteiros gerados, injete vida gerando os movimentos de câmera.</p>
          <button class="actionBtn" style="background:rgba(232,0,109,0.2); color:var(--magenta); border:1px solid var(--magenta); padding:16px 32px; font-size:1.1rem;" onclick="handleGenerateAction('gemini', '${campaign.id}')">🎥 GERAR MOVIMENTOS (GEMINI)</button>
        </div>
      `;
      return;
    }

    const activeIdx = AppState.activeSceneIndex || 0;
    
    const tabsHtml = campaign.scenes.map((s, idx) => {
      const isActive = activeIdx === idx;
      return `
        <button style="background: ${isActive ? 'rgba(255,255,255,0.15)' : 'transparent'}; color: ${isActive ? '#fff' : 'var(--ivTextSecondary)'}; border: 1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}; padding: 5px 9px; border-radius: 8px; font-weight: ${isActive ? 'bold' : 'normal'}; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; font-size: 0.76rem;" onclick="window.switchSceneTab(${idx}, 'gemini')">
          CENA ${s.no}
        </button>
      `;
    }).join('');

    let contentHtml = '';
    if (campaign.scenes.length > 0 && campaign.scenes[activeIdx]) {
      const s = campaign.scenes[activeIdx];
      contentHtml = `
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 8px; flex-shrink: 0;">
          <button class="badge actionBtn" style="cursor: pointer; background: ${s.copiedGemini ? 'var(--brandGrad)' : 'rgba(0, 174, 239, 0.25)'}; color: #fff; border: 1px solid ${s.copiedGemini ? 'transparent' : 'var(--cyan)'}; padding: 6px 18px; font-size: 0.8rem; font-weight: bold; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0, 174, 239, 0.3);" onclick="window.copyExpandedContent('gemini', ${activeIdx}, this)">
            ${s.copiedGemini ? 'COPIADO ✓' : '📋 COPIAR MOVIMENTO'}
          </button>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding-right: 6px; mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%);">
          <p id="geminiPromptText_${activeIdx}" style="color: #e2e8f0; display: block; font-family: var(--readingFont, 'Inter', sans-serif); font-size: calc(0.86rem * var(--readingFontSizeMultiplier, 1)); line-height: 1.55; white-space: pre-wrap; text-shadow: 0 1px 3px rgba(0,0,0,0.9); margin: 0; padding: 4px 8px 75px 8px;">
            ${s.assembledGemini || s.geminiMotion}
          </p>
        </div>
      `;
    }

    this.contentArea.innerHTML = `
      <div style="padding: 0 8px 16px 8px; height: 100%; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
        <div style="display: flex; gap: 5px; justify-content: center; width: 100%; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; flex-shrink: 0; box-sizing: border-box;">
          ${tabsHtml}
        </div>
        ${contentHtml}
      </div>
    `;

    if (campaign.scenes.length > 0 && campaign.scenes[activeIdx]) {
      const s = campaign.scenes[activeIdx];
      setTimeout(async () => {
        try {
          if (typeof window.fetchPrefix !== 'function') return;
          const prefix = await window.fetchPrefix('./gemini/abertura.txt');
          const finalContent = (prefix ? prefix.trim() + "\n\n" : "") + s.geminiMotion;
          
          const pEl = document.getElementById(`geminiPromptText_${activeIdx}`);
          if (pEl) pEl.innerText = finalContent;
        } catch(e) { console.error("Erro ao carregar prefixo Gemini", e); }
      }, 50);
    }
  },

  
  renderSocialArea() {
    const campaign = AppState.getSelectedCampaign();
    if (!campaign) return;

    if (!campaign.social || !campaign.social.caption) {
      this.contentArea.innerHTML = `
        <div style="padding: 32px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h2 style="color: var(--cyan); font-family: var(--uiRounded); margin-bottom: 12px; font-size: 1.3rem;">Legendas Social (Instagram / LinkedIn)</h2>
          <p style="color: var(--ivTextSecondary); margin-bottom: 24px; max-width: 440px; font-size: 0.88rem; line-height: 1.5;">A legenda narrativa de aprofundamento educativo ainda não foi gerada para esta minissérie.</p>
          <button class="actionBtn" style="background: var(--brandGrad); color: #fff; border: none; padding: 12px 24px; font-size: 0.92rem; font-weight: bold; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,174,239,0.3);" onclick="window.handleRegenerateSocial('${campaign.id}', this)">✨ GERAR LEGENDA SOCIAL</button>
        </div>
      `;
      return;
    }

    const isCopied = campaign.social.copied;

    this.contentArea.innerHTML = `
      <div style="padding: 0 8px 16px 8px; height: 100%; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
        
        <!-- Cabeçalho Fixo da Aba -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          <div>
            <h2 style="color: #fff; font-family: var(--uiRounded); margin: 0 0 2px 0; font-size: 1rem;">Legendas (Social)</h2>
            <p style="color: rgba(255,255,255,0.45); margin: 0; font-size: 0.75rem;">Instagram, LinkedIn & Redes Sociais</p>
          </div>
          <button class="actionBtn" style="background: rgba(0, 174, 239, 0.15); color: var(--cyan); border: 1px solid rgba(0, 174, 239, 0.4); padding: 5px 10px; font-size: 0.75rem; font-weight: bold; border-radius: 6px; cursor: pointer;" onclick="window.handleRegenerateSocial('${campaign.id}', this)">🔄 REGENERAR LEGENDA</button>
        </div>

        <!-- Botão Fixo COPIAR Centralizado Abaixo do Cabeçalho -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 8px; flex-shrink: 0;">
          <button class="badge actionBtn" style="cursor: pointer; background: ${isCopied ? 'var(--brandGrad)' : 'rgba(0, 174, 239, 0.25)'}; color: #fff; border: 1px solid ${isCopied ? 'transparent' : 'var(--cyan)'}; padding: 6px 18px; font-size: 0.8rem; font-weight: bold; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0, 174, 239, 0.3);" onclick="window.copyExpandedContent('social', 0, this)">
            ${isCopied ? 'COPIADO ✓' : '📋 COPIAR LEGENDA'}
          </button>
        </div>

        <!-- Área de Texto Rolável Independente -->
        <div style="flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding-right: 6px; mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%);">
          <p id="socialCaptionText" style="color: #e2e8f0; font-family: var(--readingFont, 'Inter', sans-serif); font-size: calc(0.88rem * var(--readingFontSizeMultiplier, 1)); line-height: 1.6; white-space: pre-wrap; text-shadow: 0 1px 3px rgba(0,0,0,0.9); margin: 0; padding: 4px 8px 75px 8px;">
            ${campaign.social.caption}
          </p>
        </div>
      </div>
    `;
  },

  renderFlowArea() {
    const campaign = AppState.getSelectedCampaign();
    if (!campaign) return;

    if (!campaign.flow || !campaign.flow.prompt) {
      this.contentArea.innerHTML = `
        <div style="padding: 32px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h2 style="color: var(--cyan); font-family: var(--uiRounded); margin-bottom: 12px; font-size: 1.3rem;">Estrutura Master (Flow)</h2>
          <p style="color: var(--ivTextSecondary); margin-bottom: 24px; max-width: 440px; font-size: 0.88rem; line-height: 1.5;">Gere o roteiro master cinemático continuo via Mistral Large para integrar as 5 cenas em uma narrativa fluida.</p>
          <button class="actionBtn" style="background: var(--brandGrad); color: #fff; border: none; padding: 12px 24px; font-size: 0.92rem; font-weight: bold; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,174,239,0.3);" onclick="window.generateFlowMaster('${campaign.id}', this)">🌊 GERAR FLOW (MISTRAL LARGE)</button>
        </div>
      `;
      return;
    }

    // Sempre expandido — sem toggle, sem película
    this.contentArea.innerHTML = `
      <div style="padding:12px 16px 12px 8px;height:100%;display:flex;flex-direction:column;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <h2 style="color:#fff;font-family:var(--uiRounded);margin:0 0 2px;font-size:1rem;">Flow (Estrutura Mestre)</h2>
            <p style="color:rgba(255,255,255,0.45);margin:0;font-size:0.75rem;">Roteiro central consolidado da campanha.</p>
          </div>
          <button class="actionBtn" style="background:rgba(0,174,239,0.15);color:var(--cyan);border:1px solid rgba(0,174,239,0.4);padding:5px 10px;font-size:0.75rem;font-weight:bold;border-radius:6px;cursor:pointer;" onclick="window.generateFlowMaster('${campaign.id}', this)">🔄 REGENERAR FLOW</button>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-shrink:0;">
          <h3 style="color:rgba(255,255,255,0.7);margin:0;font-size:0.82rem;text-transform:uppercase;letter-spacing:1.5px;">Roteiro Master</h3>
          <button class="badge actionBtn" style="cursor:pointer;background:${campaign.flow && campaign.flow.copied ? 'var(--brandGrad)' : 'transparent'};color:#fff;border:1px solid ${campaign.flow && campaign.flow.copied ? 'transparent' : 'rgba(255,255,255,0.2)'};padding:5px 10px;font-size:0.75rem;font-weight:bold;border-radius:6px;" onclick="window.copyExpandedContent('flow', 0, this)">
            ${campaign.flow && campaign.flow.copied ? 'COPIADO' : 'COPIAR'}
          </button>
        </div>

        <div style="flex:1;overflow-y:auto;min-height:0;mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%);">
          <p id="flowPromptText" style="color:#e2e8f0; font-family: var(--readingFont, 'Inter', sans-serif); font-size: calc(0.86rem * var(--readingFontSizeMultiplier, 1)); line-height:1.55; white-space:pre-wrap; margin:0; padding:4px 8px 75px 8px;">
            ${(campaign.flow && campaign.flow.prompt) ? campaign.flow.prompt : 'Roteiro ainda não gerado.'}
          </p>
        </div>
      </div>
    `;

    if (campaign.flow && campaign.flow.prompt) {
      setTimeout(async () => {
        try {
          if (typeof window.fetchPrefix !== 'function') return;
          const prefixRaw = await window.fetchPrefix('./flow/flow.txt');
          const finalContent = prefixRaw + campaign.flow.prompt;
          const pEl = document.getElementById('flowPromptText');
          if (pEl) pEl.innerText = finalContent;
        } catch(e) { console.error("Erro ao carregar prefixo Flow", e); }
      }, 50);
    }
  },


  renderLibrary() {
    const grid = document.getElementById('libraryGrid');
    if (!grid) return;

    if (AppState.campaigns.length === 0) {
      grid.innerHTML = `<div style="text-align: center; color: var(--ivTextSecondary); padding: 40px;">A Biblioteca está vazia. Gere assuntos na aba de Centro de Comando para começar.</div>`;
      grid.className = "";
      return;
    }

    const searchInput = document.getElementById('librarySearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter campaigns
    let filtered = AppState.campaigns.filter(c => {
      // 1. Apply Search
      if (searchTerm) {
        const term = searchTerm.replace('#', '');
        const matchTitle = c.title.toLowerCase().includes(term);
        const matchNumber = String(c.number) === term || String(c.number).padStart(2, '0') === term;
        const matchDesc = c.topic && c.topic.description && c.topic.description.toLowerCase().includes(term);
        if (!(matchTitle || matchNumber || matchDesc)) return false;
      }
      
      // 2. Apply Status Filter
      const isComplete = c.generatedGPT && c.generatedGemini;
      if (AppState.libraryFilter === 'completed' && !isComplete) return false;
      if (AppState.libraryFilter === 'pending' && isComplete) return false;
      
      return true;
    });
    
    // Sort ascending by number (01 to down)
    filtered.sort((a, b) => a.number - b.number);

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="text-align: center; color: var(--ivTextSecondary); padding: 40px; font-size: 1.2rem;">Nenhuma minissérie encontrada com os filtros atuais.</div>`;
      return;
    }

    grid.className = "subjectsGrid";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "1fr 1fr";
    grid.style.gap = "24px 32px";

    const renderCard = (c) => {
      const isComplete = c.generatedGPT && c.generatedGemini;
      const numDisplay = String(c.number).padStart(2, '0');
      return `
        <article class="subjectCard" style="position:relative; cursor:pointer; transition: all 0.2s ease;" onclick="window.openCampaignFromLibrary('${c.id}')" onmouseover="this.style.borderColor='var(--cyan)';" onmouseout="this.style.borderColor='rgba(0,174,239,0.2)';">
          ${isComplete ? '<div style="position:absolute; top:-8px; right:-8px; background:var(--cyan); color:#000; padding:4px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold; z-index: 10;">COMPLETO</div>' : ''}
          <div class="cardHeader" style="position:relative;">
            <div style="position: absolute; top: -25px; left: -25px; width: 40px; height: 40px; background: var(--brandGrad); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--uiRounded); font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">${numDisplay}</div>
            <h2 style="font-size: 1.1rem; line-height: 1.3; margin-left: 24px;">${c.title}</h2>
          </div>
          <p style="font-size: 0.9rem; color: var(--ivTextSecondary); margin-top: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex-grow: 1;">
            ${c.topic ? c.topic.description : ''}
          </p>
          <div style="margin-top: 24px; display: flex; gap: 8px;">
            <button class="actionBtn" style="padding: 12px; flex-grow: 1; font-size: 0.85rem;" title="Voltar ao Painel da Minissérie" onclick="event.stopPropagation(); AppState.selectedCampaignId='${c.id}'; AppState.save(); UI.renderWorkspace();">
              ⚙️ Painel da Minissérie
            </button>
            <button class="actionBtn" style="padding: 12px; flex-grow: 1; font-size: 0.85rem; background: rgba(0, 174, 239, 0.1); color: var(--cyan); border: 1px solid rgba(0, 174, 239, 0.3);" title="Sala de Montagem (Storyboard)" onclick="event.stopPropagation(); window.openStoryboardFromLibrary('${c.id}')">
              🎬 Sala Visual
            </button>
          </div>
        </article>
      `;
    };

    grid.innerHTML = filtered.map(c => renderCard(c)).join('');
  }
};

window.copyToClipboard = function(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const oldText = btn.innerHTML;
    const oldBg = btn.style.background;
    btn.innerHTML = "✓ Copiado!";
    btn.style.background = "#00d26a";
    btn.style.color = "#000";
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = oldBg;
      btn.style.color = "";
    }, 2000);
  });
};

UI.renderStageOptions = function(bgList) {
  const grid = document.getElementById('stageGrid');
  if (!grid) return;
  
  const list = bgList || (typeof stageBackgrounds !== 'undefined' ? stageBackgrounds : []);
  
  if (list && list.length > 0) {
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '12px';
    
    grid.innerHTML = list.map(bg => `
      <div class="stageOption" onclick="window.changeBackground('${bg.url}')" style="position:relative; cursor:pointer; border-radius:8px; overflow:hidden; border:2px solid transparent; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--cyan)'; this.style.transform='scale(1.05)';" onmouseout="this.style.borderColor='transparent'; this.style.transform='none';">
        <img src="${bg.url}" alt="${bg.label}" style="width:100%; height:80px; object-fit:cover; display:block;">
        <div style="position:absolute; bottom:0; left:0; right:0; text-align:center; padding:6px; background:rgba(0,0,0,0.8); color:#fff; font-size:0.75rem; font-family:var(--uiText); font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${bg.label}</div>
      </div>
    `).join('');
  } else {
    grid.innerHTML = '<p style="color:var(--ivTextSecondary); padding: 16px; text-align:center;">Nenhum palco encontrado.</p>';
  }
};

// ============================================================
// SISTEMA DE TIPOGRAFIA — Zoom + Seleção de Fonte
// ============================================================

// Tamanho base de leitura (1rem = 100%)
window.adjustFontSize = function(delta) {
  if (delta === 1) {
    // Restaurar padrão
    window.currentReadingFontSize = 1;
  } else {
    window.currentReadingFontSize = Math.min(2, Math.max(0.5,
      Math.round((window.currentReadingFontSize + delta) * 10) / 10
    ));
  }
  document.documentElement.style.setProperty('--readingFontSizeMultiplier', window.currentReadingFontSize);
  document.documentElement.style.setProperty('--readingFontSize', window.currentReadingFontSize + 'rem');
  localStorage.setItem('vortexFontSize', window.currentReadingFontSize);
  const display = document.getElementById('fontSizeDisplay');
  if (display) display.innerText = Math.round(window.currentReadingFontSize * 100) + '%';
};

window.applyFont = function(urlOrFontId, fontId, fontName, el) {
  // Modo simplificado: chamada com só o nome da fonte (botões hardcoded no HTML)
  // Ex: applyFont('Inter')
  let resolvedId   = fontId   || urlOrFontId;
  let resolvedName = fontName || urlOrFontId;
  let resolvedUrl  = urlOrFontId; // Para fontes locais, é a URL real

  window.activeFontId = resolvedId;

  // Injeta @font-face só se for URL de arquivo externo (fontes locais)
  // Para fontes do sistema (Inter, DM Sans, etc) não precisa
  const isSystemFont = !urlOrFontId.startsWith('/') && !urlOrFontId.includes('.') && !urlOrFontId.startsWith('http');
  if (!isSystemFont) {
    let styleEl = document.getElementById('custom-font-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-font-style';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@font-face { font-family: '${resolvedId}'; src: url('${resolvedUrl}') format('truetype'); }`;
  }

  // Aplica como fonte UI e leitura
  document.documentElement.style.setProperty('--uiRounded', `'${resolvedId}', sans-serif`);
  document.documentElement.style.setProperty('--uiText', `'${resolvedId}', sans-serif`);
  document.documentElement.style.setProperty('--readingFont', `'${resolvedId}', sans-serif`);
  document.body.style.fontFamily = `'${resolvedId}', sans-serif`;

  // Persiste no localStorage
  localStorage.setItem('vortexFontSelected', JSON.stringify({
    urlOrFontId: resolvedUrl,
    fontId: resolvedId,
    format: resolvedName
  }));

  // Atualiza destaque visual nos botões HARDCODED do HTML
  document.querySelectorAll('#fontsList button').forEach(btn => {
    const isThis = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${resolvedId}'`);
    btn.style.background = isThis ? 'var(--brandGrad)' : '';
    btn.style.border     = isThis ? '2px solid rgba(255,255,255,0.4)' : '';
    const label = btn.querySelector('span:last-child');
    if (label) label.innerText = isThis ? '✓ APLICADA' : 'Aplicar';
  });

  // Atualiza destaque visual nos botões DINÂMICOS (renderFontOptions)
  if (el) {
    document.querySelectorAll('.dropdownItem').forEach(d => {
      d.style.background = 'rgba(0,0,0,0.4)';
      d.style.borderLeft = 'none';
      const s = d.querySelector('.font-status');
      if (s) { s.innerHTML = 'Aplicar'; s.style.color = '#fff'; }
    });
    el.style.background = 'var(--brandGrad)';
    el.style.borderLeft = '4px solid #fff';
    const s = el.querySelector('.font-status');
    if (s) { s.innerHTML = '✓ APLICADA'; }
  }

  // Atualiza o label do botão Aa no topbar
  const btn = document.getElementById('btnFonts');
  if (btn) btn.innerHTML = `<span style="font-size:0.65rem;display:block;line-height:1;opacity:0.8;">${resolvedName.substring(0,10)}</span>Aa`;
};


UI.renderFontOptions = function(fonts) {
  const list = document.getElementById('fontsList');
  if (!list) return;
  
  // Esconde o texto de carregando se ele existir
  const loadingText = list.parentElement.querySelector('p');
  if (loadingText) loadingText.style.display = 'none';

  if (fonts && fonts.length > 0) {
    list.innerHTML = fonts.map(f => {
      const url = f.url;
      const fontName = f.familyLabel + (f.label.includes('wght') ? '' : ' - ' + f.label);
      const fontId = f.fontFamily;
      const isActive = window.activeFontId === fontId;
      const bg = isActive ? 'var(--brandGrad)' : 'rgba(0,0,0,0.4)';
      const border = isActive ? '4px solid #fff' : 'none';
      const text = isActive ? '✓ APLICADA' : 'Aplicar';
      
      return `
        <div class="dropdownItem" onclick="window.applyFont('${url}', '${fontId}', '${fontName.replace(/'/g,"\\'")}', this)" style="transition: all 0.3s; background: ${bg}; border-left: ${border};">
          <span>${fontName}</span>
          <span class="font-status" style="font-size:0.8rem; font-weight: bold;">${text}</span>
        </div>
      `;
    }).join('');
  } else {
    list.innerHTML = '<p style="color:var(--ivTextSecondary); padding: 16px;">Nenhuma fonte encontrada.</p>';
  }
};

window.selectCampaign = function(idOrNum) {
  const c = AppState.campaigns.find(camp => String(camp.id) === String(idOrNum) || Number(camp.number) === Number(idOrNum));
  if (c) {
    AppState.selectedCampaignId = c.id;
    AppState.save();
    UI.renderWorkspace();
  }
};

window.renderMultiverseControlPanel = function() {
  const panel = document.getElementById('activeCampaignPanel');
  const rightArea = document.getElementById('multiversePromptsArea');
  const ideationHeader = document.querySelector('.ideationHeader');
  if(!panel || !rightArea) return;

  // Garante que a secao de criacao e busca por numero fique SEMPRE VISIVEL no topo do cockpit
  if (ideationHeader) ideationHeader.style.display = 'block';

  const campaign = AppState.getSelectedCampaign();
  const subjectsGrid = document.getElementById('subjectsGrid');
  
  if (!campaign) {
    panel.style.display = 'none';
    rightArea.style.display = 'none';
    if (subjectsGrid) subjectsGrid.style.display = 'flex';
    return;
  }

  // Se tiver campanha selecionada, mostra o painel ativo e a area direita de texto
  panel.style.display = 'flex';
  rightArea.style.display = 'flex';
  if (subjectsGrid) subjectsGrid.style.display = 'none';

  const t = AppState.studioActiveTab || 'gpt';
  
  // Status de Telemetria das 4 Etapas
  const hasGpt = Array.isArray(campaign.scenes) && campaign.scenes.length >= 5;
  const hasGemini = hasGpt && campaign.scenes.some(s => s.prompt);
  const hasFlow = !!(campaign.flow && campaign.flow.prompt);
  const hasSocial = !!(campaign.social && campaign.social.caption);

  // Minisséries Afins (Relacionadas)
  let relatedHtml = '';
  const relatedIds = campaign.related_subjects || [];
  let relatedCampaigns = AppState.campaigns.filter(c => c.id !== campaign.id && (relatedIds.includes(c.id) || relatedIds.includes(c.number)));
  
  if (relatedCampaigns.length === 0) {
    // Fallback: pega até 4 outras minisséries para garantir presença no cockpit
    relatedCampaigns = AppState.campaigns.filter(c => c.id !== campaign.id).slice(0, 4);
  }

  if (relatedCampaigns.length > 0) {
    relatedHtml = `
      <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 14px;">
        <span style="color: var(--cyan); font-size: 0.88rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 10px;">🔗 MINISSÉRIES AFINS DESTE TEMA</span>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${relatedCampaigns.map(rc => `
            <button class="actionBtn" style="padding: 11px 14px; background: rgba(0, 174, 239, 0.1); border: 1px solid rgba(0, 174, 239, 0.35); color: #fff; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 0.92rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;" onclick="window.selectCampaign('${rc.id}')">
              <span style="color: #fff; font-weight: 900; font-size: 0.95rem;">▶️ ${String(rc.number || rc.id).padStart(2, '0')}</span>
              <span style="flex: 1; margin-left: 10px; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: rgba(255,255,255,0.95); font-weight: 600;">${rc.title || rc.topic?.title || 'Minissérie ' + rc.number}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  panel.innerHTML = `
    <div style="padding: 0; display: flex; flex-direction: column; gap: 10px;">
      
      <!-- Cabeçalho com Número Gigante em BRANCO PURO (Pure White) -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px;">
        <div style="display: flex; align-items: baseline; gap: 12px;">
          <span style="color: rgba(255,255,255,0.65); font-size: 0.8rem; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase;">MINISSÉRIE</span>
          <h1 style="color: #FFFFFF; font-family: var(--uiRounded); margin: 0; font-size: 2.6rem; font-weight: 900; line-height: 1; text-shadow: 0 0 25px rgba(255,255,255,0.8);">
            ${String(campaign.number || campaign.id).padStart(2, '0')}
          </h1>
        </div>
        <button class="actionBtn" style="padding: 6px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.78rem; transition: all 0.2s;" onclick="window.regenerateCurrentCampaign()">🔄 REGENERAR</button>
      </div>

      <!-- Título Principal Expandido e Centralizado -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; text-align: center;">
        <strong style="color: #fff; font-size: 1.1rem; line-height: 1.35; font-family: var(--uiRounded); font-weight: 800; display: block; text-shadow: 0 2px 6px rgba(0,0,0,0.8);">
          ${campaign.title || campaign.topic?.title || campaign.assuntoPrincipal || 'Sem título definido'}
        </strong>
      </div>

      <!-- Grade de Telemetria dos Motores -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px;">
        <div style="display:flex; align-items:center; gap:8px; font-size:0.88rem; color: ${hasGpt ? '#4ade80' : 'rgba(255,255,255,0.5)'}; font-weight: 600;">
          <span style="font-size: 1rem;">${hasGpt ? '✅' : '⏳'}</span> <span style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);">GPT (Imagens)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:0.88rem; color: ${hasGemini ? '#4ade80' : 'rgba(255,255,255,0.5)'}; font-weight: 600;">
          <span style="font-size: 1rem;">${hasGemini ? '✅' : '⏳'}</span> <span style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);">Gemini (Vídeo)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:0.88rem; color: ${hasFlow ? '#4ade80' : 'rgba(255,255,255,0.5)'}; font-weight: 600;">
          <span style="font-size: 1rem;">${hasFlow ? '✅' : '⏳'}</span> <span style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);">Flow (Master)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:0.88rem; color: ${hasSocial ? '#4ade80' : 'rgba(255,255,255,0.5)'}; font-weight: 600;">
          <span style="font-size: 1rem;">${hasSocial ? '✅' : '⏳'}</span> <span style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);">Legenda Social</span>
        </div>
      </div>

      <!-- Botões de Alternância de Abas Centralizados e Ampliados -->
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:2px;">
        <button class="actionBtn" style="padding:12px 18px; justify-content:center; text-align:center; background:${t === 'gpt' ? 'var(--brandGrad)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${t === 'gpt' ? 'transparent' : 'rgba(255,255,255,0.15)'}; color:#fff; border-radius:12px; font-weight:800; cursor:pointer; font-size:1.08rem; display:flex; align-items:center; gap:12px; box-shadow: ${t === 'gpt' ? '0 4px 22px rgba(0,174,239,0.5)' : 'none'}; transition: all 0.2s ease;" onclick="AppState.studioActiveTab='gpt'; UI.renderWorkspace();">
          <span style="font-size:1.45rem;">📝</span> <span>Direção de Arte (GPT)</span>
        </button>
        <button class="actionBtn" style="padding:12px 18px; justify-content:center; text-align:center; background:${t === 'gemini' ? 'var(--brandGrad)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${t === 'gemini' ? 'transparent' : 'rgba(255,255,255,0.15)'}; color:#fff; border-radius:12px; font-weight:800; cursor:pointer; font-size:1.08rem; display:flex; align-items:center; gap:12px; box-shadow: ${t === 'gemini' ? '0 4px 22px rgba(0,174,239,0.5)' : 'none'}; transition: all 0.2s ease;" onclick="AppState.studioActiveTab='gemini'; UI.renderWorkspace();">
          <span style="font-size:1.45rem;">🚀</span> <span>Movimentos (Gemini)</span>
        </button>
        <button class="actionBtn" style="padding:12px 18px; justify-content:center; text-align:center; background:${t === 'flow' ? 'var(--brandGrad)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${t === 'flow' ? 'transparent' : 'rgba(255,255,255,0.15)'}; color:#fff; border-radius:12px; font-weight:800; cursor:pointer; font-size:1.08rem; display:flex; align-items:center; gap:12px; box-shadow: ${t === 'flow' ? '0 4px 22px rgba(0,174,239,0.5)' : 'none'}; transition: all 0.2s ease;" onclick="AppState.studioActiveTab='flow'; UI.renderWorkspace();">
          <span style="font-size:1.45rem;">🌊</span> <span>Estrutura Master (Flow)</span>
        </button>
        <button class="actionBtn" style="padding:12px 18px; justify-content:center; text-align:center; background:${t === 'social' ? 'var(--brandGrad)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${t === 'social' ? 'transparent' : 'rgba(255,255,255,0.15)'}; color:#fff; border-radius:12px; font-weight:800; cursor:pointer; font-size:1.08rem; display:flex; align-items:center; gap:12px; box-shadow: ${t === 'social' ? '0 4px 22px rgba(0,174,239,0.5)' : 'none'}; transition: all 0.2s ease;" onclick="AppState.studioActiveTab='social'; UI.renderWorkspace();">
          <span style="font-size:1.45rem;">📱</span> <span>Legenda Social</span>
        </button>
      </div>

      <!-- Minisséries Afins -->
      ${relatedHtml}
    </div>
  `;

  // Renderiza a aba ativa na coluna direita
  if(t === 'gpt') UI.renderGPTArea();
  else if(t === 'gemini') UI.renderGeminiArea();
  else if(t === 'flow') UI.renderFlowArea();
  else if(t === 'social') UI.renderSocialArea();
};
