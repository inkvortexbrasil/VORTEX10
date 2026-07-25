// Lógica Principal - Vortex 8

document.addEventListener('DOMContentLoaded', async () => {
  AppState.init();
  UI.init();
  setupGlobalListeners();
  
  // API Key Configuration Logic
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');
  const inputMistral = document.getElementById('inputMistralKey');
  const inputGemini = document.getElementById('inputGeminiKey');

  // Load existing keys from backend
  if (inputMistral && inputGemini) {
    fetch('/api/config/keys')
      .then(res => res.json())
      .then(data => {
        if (data.mistral) inputMistral.value = data.mistral;
        else inputMistral.placeholder = "Chave Mistral vazia...";
        
        if (data.gemini) inputGemini.value = data.gemini;
        else inputGemini.placeholder = "Chave Gemini vazia...";
      })
      .catch(e => console.error("Erro ao carregar chaves", e));
  }

  if (btnSaveApiKey) {
    btnSaveApiKey.addEventListener('click', async () => {
      const mistralVal = inputMistral.value.trim();
      const geminiVal = inputGemini.value.trim();
      
      btnSaveApiKey.innerText = "SALVANDO...";
      try {
        await fetch('/api/config/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mistral: mistralVal, gemini: geminiVal })
        });
        document.getElementById('modalApiConfig').style.display = 'none';
        btnSaveApiKey.innerText = "SALVO!";
      } catch(e) {
        alert("Erro ao salvar chaves no servidor.");
      }
      setTimeout(() => btnSaveApiKey.innerText = "SALVAR CHAVES", 2000);
    });
  }
  
  // Carrega fundos por página (Multiverso)
  window.vortexWallpapers = {};
  const defaultWallpaper = 'palco/vortex_nebula_clean.jpg';
  window.currentRoomId = 'multiverseWelcome'; // Default room

  // Setup individual wallpapers per room
  try {
    const saved = localStorage.getItem('vortexWallpapersConfigV9');
    if (saved) {
      window.vortexWallpapers = JSON.parse(saved);
    } else {
      window.vortexWallpapers = {
        'multiverseWelcome': defaultWallpaper,
        'pageLibrary': defaultWallpaper,
        'storyboardView': defaultWallpaper,
        'socialMediaView': defaultWallpaper,
        'audioRoomView': defaultWallpaper,
        'flowRoomView': defaultWallpaper,
        'documentariosRoomView': defaultWallpaper,
        'shortsView': defaultWallpaper
      };
    }
  } catch (e) {
    window.vortexWallpapers = {};
  }

  window.updateWallpaperForCurrentRoom = function() {
    const bgUrl = window.vortexWallpapers[window.currentRoomId] || defaultWallpaper;
    document.documentElement.style.setProperty('--ivStageImage', `url('${bgUrl}')`);
    document.body.style.backgroundImage = `url('${bgUrl}')`;
  };

  // Initial load
  window.updateWallpaperForCurrentRoom();
  
  // Carrega tipografia salva
  try {
    const savedFontJson = localStorage.getItem('vortexFontSelected');
    if (savedFontJson) {
      const f = JSON.parse(savedFontJson);
      if (typeof window.applyFont === 'function') {
        window.applyFont(f.urlOrFontId, f.fontId, f.format);
      }
    }
  } catch(e){}
  
  // Carrega zoom salvo
  try {
    const savedZoom = localStorage.getItem('vortexFontSize');
    if (savedZoom) {
      window.currentReadingFontSize = parseFloat(savedZoom);
      document.documentElement.style.setProperty('--readingFontSizeMultiplier', window.currentReadingFontSize);
      document.documentElement.style.setProperty('--readingFontSize', window.currentReadingFontSize + 'rem');
      const display = document.getElementById('fontSizeDisplay');
      if (display) {
        display.innerText = Math.round(window.currentReadingFontSize * 100) + '%';
      }
    } else {
      window.currentReadingFontSize = 1;
      document.documentElement.style.setProperty('--readingFontSizeMultiplier', 1);
      document.documentElement.style.setProperty('--readingFontSize', '1rem');
    }
  } catch(e){}
  
  // Restaura a tela exata (se existir)
  if (AppState.activeStage && AppState.activeStage !== 'ideation') {
    UI.renderWorkspace();
  }
  // Se for ideation, verifica se tem assuntos
  else if (AppState.suggestedSubjects && AppState.suggestedSubjects.length > 0) {
    UI.renderWorkspace();
  } else {
    handleGenerateSubjects();
  }
  
  // Carrega o wallpaper
  loadStageBackground();
});

let stageBackgroundsFallback = [
  { url: 'palco/00-obra-prima-inkvortex-hd.jpg', label: '👑 Obra Prima HD (Prime)' },
  { url: 'palco/vortex_nebula_clean.jpg', label: 'Nebula Clean' },
  { url: 'palco/vortex_cosmic_master.jpg', label: 'Cosmic Master' },
  { url: 'palco/04-vortex-puro-8k.jpg', label: 'Vortex Puro 8K' },
  { url: 'palco/05-vortex-dark-center-8k.jpg', label: 'Vortex Dark' },
  { url: 'palco/01-azul-eletrico-1920x1080.png', label: 'Azul Elétrico' },
  { url: 'palco/02-gradiente-inkvortex-1920x1080.png', label: 'Gradiente' },
  { url: 'palco/03-aurora-vortex-1920x1080.png', label: 'Aurora' },
  { url: 'palco/vortex_cosmic_super.png', label: 'Cosmic Super' },
  { url: 'palco/VORTEX_FAREWELL_WALLPAPER.jpg', label: 'Farewell Wallpaper' },
  { url: 'palco/VORTEX_FAREWELL_WALLPAPER_HD.jpg', label: 'Farewell HD' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_43 (1).png', label: 'InkVortex Art 01' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_43 (2).png', label: 'InkVortex Art 02' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_44 (3).png', label: 'InkVortex Art 03' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_44 (4).png', label: 'InkVortex Art 04' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_44 (5).png', label: 'InkVortex Art 05' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_45 (6).png', label: 'InkVortex Art 06' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_45 (7).png', label: 'InkVortex Art 07' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_45 (8).png', label: 'InkVortex Art 08' },
  { url: 'palco/ChatGPT Image 13 de jul. de 2026, 20_04_46 (10).png', label: 'InkVortex Art 10' }
];

let stageBackgrounds = stageBackgroundsFallback;

async function loadStageBackground() {
  try {
    const response = await fetch(`/api/palco?_t=${Date.now()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.backgrounds && data.backgrounds.length > 0) {
        stageBackgrounds = data.backgrounds;
      }
    }
  } catch (error) {
    console.warn('Usando lista local de palcos', error);
  } finally {
    if (!stageBackgrounds || stageBackgrounds.length === 0) {
      stageBackgrounds = stageBackgroundsFallback;
    }
    let bgUrl = stageBackgrounds[0].url;
    if (typeof window.currentRoomId !== 'undefined' && window.vortexWallpapers && window.vortexWallpapers[window.currentRoomId]) {
        bgUrl = window.vortexWallpapers[window.currentRoomId];
    }
    if (bgUrl.startsWith('/')) bgUrl = bgUrl.substring(1);
    
    document.documentElement.style.setProperty('--ivStageImage', `url('${bgUrl}')`);
    document.body.style.backgroundImage = `url('${bgUrl}')`;
  }
}

function setupGlobalListeners() {
  // Roteamento Topbar
  document.querySelectorAll('.stageTab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const stage = e.currentTarget.dataset.stage;
      window.switchStage(stage);
      
      // Validações antes de mudar de tela
      if (stage === 'studio' && !AppState.getSelectedCampaign()) {
        alert("Gere ou selecione um assunto no Centro de Comando ou na Biblioteca primeiro.");
        return;
      }
      
      document.querySelectorAll('.stageTab').forEach(t => t.classList.remove('on'));
      e.currentTarget.classList.add('on');
      
      AppState.activeStage = stage;
      AppState.save();
      UI.renderWorkspace();
    });
  });

  const btnReset = document.getElementById('btnReset');
  
  // O btnReset é tratado na lógica de Backup no final do arquivo

  window.toggleDropdown = function(id) {
    // Close other dropdowns
    document.querySelectorAll('.vortexDropdown').forEach(el => {
      if (el.id !== id) el.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.vortexGlobalActions .iconBtn, .vortexGlobalActions .actionBtn').forEach(btn => btn.classList.remove('active'));
    
    const el = document.getElementById(id);
    if (el) {
      const isHidden = el.style.display === 'none' || el.style.display === '';
      el.style.display = isHidden ? 'block' : 'none';
      
      // Toggle active class on the button that triggered it
      if (isHidden) {
        if (id === 'dropdownFonts') { let b = document.getElementById('btnFonts'); if(b) b.classList.add('active'); }
        if (id === 'dropdownStage') { let b = document.getElementById('btnChangeWallpaper') || document.getElementById('btnStage'); if(b) b.classList.add('active'); }
        if (id === 'dropdownImport') { let b = document.getElementById('btnImport'); if(b) b.classList.add('active'); }
      }
      
      // If opening, load content if needed
      if (isHidden) {
        if (id === 'dropdownStage' && typeof UI.renderStageOptions === 'function') {
          fetch(`/api/palco?_t=${Date.now()}`).then(res => res.json()).then(data => {
            if (data.backgrounds && data.backgrounds.length > 0) {
              stageBackgrounds = data.backgrounds;
            } else {
              stageBackgrounds = stageBackgroundsFallback;
            }
            UI.renderStageOptions(stageBackgrounds);
          }).catch(e => {
            console.warn("API de palcos offline, carregando lista da pasta palco:", e);
            stageBackgrounds = stageBackgroundsFallback;
            UI.renderStageOptions(stageBackgrounds);
          });
        }
        if (id === 'dropdownFonts' && typeof UI.renderFontOptions === 'function') {
          if (window.localFonts.length === 0) {
            fetch('/api/fonts').then(res => res.json()).then(data => {
              window.localFonts = data.fonts || [];
              UI.renderFontOptions(window.localFonts);
            }).catch(e => console.error("Erro ao carregar fontes", e));
          } else {
            UI.renderFontOptions(window.localFonts);
          }
        }
      }
    }
  };

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.vortexGlobalActions')) {
      document.querySelectorAll('.vortexDropdown').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.vortexGlobalActions .iconBtn, .vortexGlobalActions .actionBtn').forEach(btn => btn.classList.remove('active'));
    }
  });

  window.changeBackground = function(url) {
    document.documentElement.style.setProperty('--ivStageImage', `url('${url}')`);
    document.body.style.backgroundImage = `url('${url}')`;
    
    // Salva especificamente para a sala atual
    if(window.currentRoomId) {
      window.vortexWallpapers[window.currentRoomId] = url;
      localStorage.setItem('vortexWallpapersConfigV9', JSON.stringify(window.vortexWallpapers));
    }
  };

  // Botão Gerar Assuntos
  const btnGenerate = document.getElementById('btnGenerateSubjects');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', handleGenerateSubjects);
  }

  const btnTestDossie = document.getElementById('btnTestDossie');
  if (btnTestDossie) {
    btnTestDossie.addEventListener('click', () => {
      handleGerarDossieCompleto(true);
    });
  }

} // end setupGlobalListeners

// Global ESC Key Logic (Escape Hatch)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Rule 1: Close any zoom or full-screen player states first
    const zoomedPlayers = document.querySelectorAll('.media-player.zoomed, .video-container.zoomed, .zoom-active');
    if (zoomedPlayers.length > 0) {
      zoomedPlayers.forEach(player => {
        player.classList.remove('zoomed');
        player.classList.remove('zoom-active');
        // If there's a specific close function, call it here
      });
      
      // Also close the immersive render modal if open
      const renderModal = document.getElementById('renderImmersiveModal');
      if (renderModal && renderModal.style.display !== 'none') {
        renderModal.style.display = 'none';
      }
      return; // Stop here, we only wanted to exit zoom
    }

    // Rule 2: If no zoom is active, return to the Dashboard (multiverseWelcome)
    if (window.currentRoomId && window.currentRoomId !== 'multiverseWelcome') {
      if (typeof window.switchMultiverseRoom === 'function') {
        window.switchMultiverseRoom('multiverseWelcome', null);
      }
    }
  }
});

// Lógica de Modais

window.localFonts = [];



window.handleCreateManualSubject = function() {
  const briefInput = document.getElementById('customBriefInput');
  const briefVal = briefInput && briefInput.value.trim() !== '' ? briefInput.value.trim() : null;

  if (!briefVal) {
    alert('Por favor, digite um assunto antes de criar manualmente.');
    return;
  }

  let nextNumber = 1;
  if (AppState.campaigns.length > 0) {
    nextNumber = Math.max(...AppState.campaigns.map(c => Number(c.number) || 0)) + 1;
  }

  const newCampaign = {
    id: 'camp_' + Date.now(),
    number: nextNumber,
    title: briefVal,
    topic: {
      assuntoPrincipal: briefVal,
      description: "Minissérie criada manualmente pelo Diretor.",
      targetAudience: "Geral",
      emotionalTone: "Informativo"
    },
    scenes: [],
    generatedGPT: false,
    generatedGemini: false,
    flow: null,
    created_at: new Date().toISOString()
  };

  AppState.campaigns.push(newCampaign);
  AppState.selectedCampaignId = newCampaign.id;
  AppState.save();
  
  briefInput.value = '';
  UI.renderWorkspace();
};

async function handleGenerateSubjects() {
  const btn = document.getElementById('btnGenerateSubjects');
  if(btn) {
    btn.innerHTML = '✨ Gerando...';
    btn.disabled = true;
  }
  
  // Calcula o próximo número
  let nextNumber = 1;
  if (AppState.campaigns.length > 0) {
    nextNumber = Math.max(...AppState.campaigns.map(c => Number(c.number) || 0)) + 1;
  }
  
  const briefInput = document.getElementById('customBriefInput');
  const briefVal = briefInput && briefInput.value.trim() !== '' ? briefInput.value.trim() : null;

  // Ativa a telemetria pulsante
  AppState.isGeneratingSubjects = true;
  AppState.generatingError = null;
  AppState.generatingNumbers = [nextNumber, nextNumber + 1, nextNumber + 2];
  UI.renderIdeationGrid();
  
  try {
    const newSubjects = await API.generateSubjects(briefVal);
    
    const newCampaignIds = [];
    newSubjects.forEach((subject, idx) => {
      const newCampaign = {
        id: 'camp_' + Date.now() + '_' + idx,
        number: nextNumber + idx,
        title: subject.title,
        topic: subject,
        generatedGPT: false,
        generatedGemini: false,
        scenes: [],
        social: {},
        flow: {},
        related_subjects: [] // Para armazenar IDs de assuntos ramificados/afins
      };
      AppState.campaigns.unshift(newCampaign);
      newCampaignIds.push(newCampaign.id);
    });
    
    // Store only the IDs of the newly generated subjects for the ideation grid to display
    AppState.suggestedSubjects = newCampaignIds;
    AppState.isGeneratingSubjects = false;
    AppState.save();
    UI.renderIdeationGrid();
  } catch(e) {
    console.error(e);
    AppState.isGeneratingSubjects = false;
    AppState.generatingError = e.message || "Erro na comunicação com a API.";
    UI.renderIdeationGrid();
  } finally {
    if(btn) {
      btn.disabled = false;
      btn.innerHTML = "✨ Gerar mais 3 assuntos";
      btn.style.opacity = '1';
    }
  }
}

// Quando o diretor clica em um assunto na grade do Centro de Comando
window.selectSubject = async function(campaignId) {
  const campaign = AppState.campaigns.find(c => c.id === campaignId);
  if (!campaign) return;
  
  AppState.selectedCampaignId = campaign.id;
  
  // Remove do Centro de Comando (Ideation Grid) pois já foi despachado para a produção
  AppState.suggestedSubjects = AppState.suggestedSubjects.filter(id => id !== campaignId);
  
  // Mudar para o Estúdio!
  AppState.activeStage = 'studio';
  AppState.studioActiveTab = 'gpt'; // Já cai na aba de prompts
  
  AppState.save();
  
  document.querySelectorAll('.stageTab').forEach(t => t.classList.remove('on'));
  const studioBtn = document.querySelector('.stageTab[data-stage="studio"]');
  if (studioBtn) studioBtn.classList.add('on');
  
  UI.renderWorkspace();
};

window.createCustomSubject = function() {
  const input = document.getElementById('customSubjectInput');
  const customTitle = input ? input.value.trim() : "";
  if(!customTitle) return;
  
  // Use the exact number typed by the user if it's a number
  let nextNumber = parseInt(customTitle);
  if (isNaN(nextNumber)) {
    if (AppState.campaigns.length > 0) {
      nextNumber = Math.max(...AppState.campaigns.map(c => Number(c.number) || 0)) + 1;
    } else {
      nextNumber = 1;
    }
  }
  
  // Check if a campaign with this number already exists
  const existingCampaign = AppState.campaigns.find(c => Number(c.number) === nextNumber);
  let campaignIdToSelect;

  if (existingCampaign) {
    // If it exists, just select it
    campaignIdToSelect = existingCampaign.id;
  } else {
    // Create new
    const newCampaign = {
      id: 'camp_' + Date.now(),
      number: nextNumber,
      title: 'Minissérie ' + nextNumber,
      topic: { title: 'Minissérie ' + nextNumber, description: "Assunto inserido manualmente pelo Diretor.", groupSubject: "Pedido Específico do Público" },
      generatedGPT: false,
      generatedGemini: false,
      scenes: [],
      social: {},
      flow: {},
      related_subjects: []
    };
    
    AppState.campaigns.unshift(newCampaign);
    campaignIdToSelect = newCampaign.id;
  }
  
  if (input) input.value = "";
  
  // Auto select the campaign and refresh the Dashboard!
  AppState.selectedCampaignId = campaignIdToSelect;
  AppState.save();
  UI.renderWorkspace();
};

// Ramifica um assunto
window.branchSubject = async function(campaignId) {
  if (AppState.isGenerating) return;
  const parent = AppState.campaigns.find(c => c.id === campaignId);
  if (!parent) return;

  const btn = event ? event.currentTarget : null;
  if (btn) {
    btn.innerHTML = "⚡ GERANDO ASSUNTOS AFINS...";
    btn.style.opacity = "0.7";
    btn.style.pointerEvents = "none";
  }

  AppState.isGenerating = true;

  try {
    const newSubjects = await API.generateSubjects(`Gere 2 novos ângulos editoriais totalmente diferentes e específicos derivados e aprofundados sobre: ${parent.title}`);
    
    const topicsToAdd = newSubjects.slice(0, 2);
    
    let nextNumber = 1;
    if (AppState.campaigns.length > 0) {
      nextNumber = Math.max(...AppState.campaigns.map(c => Number(c.number) || 0)) + 1;
    }
    
    if (!parent.related_subjects) parent.related_subjects = [];
    
    const newCamps = topicsToAdd.map((t, idx) => ({
      id: 'camp_' + Date.now() + '_' + idx,
      parent_id: parent.id,
      number: nextNumber + idx,
      title: t.title,
      topic: t,
      generatedGPT: false,
      generatedGemini: false,
      scenes: [],
      social: {},
      flow: {},
      related_subjects: [parent.id] // Link back to parent
    }));

    // Cross-link siblings if there are multiple
    if (newCamps.length > 1) {
      newCamps[0].related_subjects.push(newCamps[1].id);
      newCamps[1].related_subjects.push(newCamps[0].id);
    }

    newCamps.forEach(newCamp => {
      AppState.campaigns.unshift(newCamp);
      // Ensure we don't add duplicates to parent
      if (!parent.related_subjects.includes(newCamp.id)) {
        parent.related_subjects.push(newCamp.id);
      }
    });
    
    AppState.save();
    AppState.isGenerating = false;
    UI.renderStudio(); // Update UI to show related subjects
    
    if (btn) {
      btn.innerHTML = "✓ ASSUNTOS GERADOS";
      btn.style.background = "#00d26a";
      btn.style.color = "#000";
      setTimeout(() => {
        btn.innerHTML = "🔗 GERAR +2 ASSUNTOS AFINS";
        btn.style.background = "#fff";
        btn.style.color = "#000";
        btn.style.border = "none";
        btn.style.boxShadow = "0 4px 12px rgba(255,255,255,0.2)";
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
      }, 3000);
    }
  } catch(e) {
    console.error(e);
    AppState.isGenerating = false;
    if (btn) {
      btn.innerHTML = "❌ ERRO AO GERAR";
      btn.style.background = "#ff6b6b";
      btn.style.color = "#fff";
      setTimeout(() => {
        btn.innerHTML = "🔗 GERAR +2 ASSUNTOS AFINS";
        btn.style.background = "#fff";
        btn.style.color = "#000";
        btn.style.border = "none";
        btn.style.boxShadow = "0 4px 12px rgba(255,255,255,0.2)";
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
      }, 3000);
    }
  } finally {
    AppState.isGenerating = false;
  }
};

// Funções de Modal Expandido e Leitura

  // Funções de Clipboard e Formatação
  
  window.fetchPrefix = async function(url) {
    try {
      const res = await fetch(url);
      if(!res.ok) return '';
      return await res.text();
    } catch(e) {
      return '';
    }
  }

window.toggleSceneExpand = async function(type, index) {
  if (AppState.expandedCard && AppState.expandedCard.type === type && AppState.expandedCard.index === index) {
    AppState.expandedCard = null; // Colapsa se clicar de novo
  } else {
    AppState.expandedCard = { type, index };
  }
  
  if (AppState.expandedCard) {
    if (type === 'gpt') {
      await window.buildGptPromptForExpanded(index);
    } else if (type === 'gemini') {
      const campaign = AppState.getSelectedCampaign();
      const s = campaign.scenes[index];
      let prefixRaw = await fetchPrefix('./gemini/abertura.txt');
      let prefix = prefixRaw ? prefixRaw.replace(/\[TÍTULO EXATO AQUI\]\r?\n?/g, '') : "";
      s.assembledGemini = (prefix ? prefix.trim() + "\n\n" : "") + s.geminiMotion;
    }
  }
  
  UI.renderStudio(); // Renderiza para expandir
};

window.setGlobalGptMode = function(mode) {
  if (!AppState) return;
  AppState.globalGptMode = mode;
  AppState.save();
  UI.renderStudio();
  if (AppState.expandedCard && AppState.expandedCard.type === 'gpt') {
    window.buildGptPromptForExpanded(AppState.expandedCard.index);
  }
};

window.buildGptPromptForExpanded = async function(index) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) return;
  const s = campaign.scenes[index];

  let url = './gpt/abertura.txt';
  
  let prefixRaw = await fetchPrefix(url);
  let prefix = prefixRaw.replace(/\[TÍTULO EXATO AQUI\]\r?\n?/g, '');
  
  let exactBlock = `TITULO EXATO: "${s.title || campaign.title}"`;


  let finalPrompt = s.prompt;

  s.assembledPrompt = (prefix ? prefix.trim() + "\n\n" : "") + 
                      exactBlock + "\n\n" + 
                      finalPrompt;
};

window.regenerateSocialCaption = function(campaignId, btnElement) {
  let campaign = null;
  if (typeof campaignId === 'number' || typeof campaignId === 'string') {
    campaign = AppState.campaigns.find(c => String(c.id) === String(campaignId));
  } else {
    btnElement = campaignId; // fallback se chamou passando apenas o elemento
    campaign = AppState.getSelectedCampaign();
  }
  
  if(!campaign || !campaign.social) return;

  const authorityOptions = [
    "Na InkVortex Brasil, conhecimento técnico se transforma em decisões mais seguras para o seu trabalho.",
    "A InkVortex Brasil transforma experiência técnica em informação útil para quem vive da impressão.",
    "A InkVortex Brasil compartilha conhecimento técnico para tornar processos complexos mais claros e seguros."
  ];
  const storeOptions = [
    "Produtos e insumos da InkVortex Brasil estão disponíveis em nossa loja oficial no Mercado Livre. Link na bio.",
    "Leve a qualidade da InkVortex Brasil para sua rotina pela nossa loja oficial no Mercado Livre. Link na bio.",
    "Peças, tintas e insumos profissionais da InkVortex Brasil esperam por você no Mercado Livre. Link na bio."
  ];
  const followOptions = [
    "Se esse tipo de conteúdo te ajuda a enxergar a impressão com mais clareza, siga a InkVortex Brasil para acompanhar as próximas minisséries.",
    "A InkVortex Brasil revela os bastidores técnicos da impressão; siga para não perder a próxima minissérie."
  ];
  const merchLines = [
    "💬 " + authorityOptions[Math.floor(Math.random() * authorityOptions.length)],
    "🛒 " + storeOptions[Math.floor(Math.random() * storeOptions.length)],
    "📲 " + followOptions[Math.floor(Math.random() * followOptions.length)]
  ].join('\n\n');

  let beforeText = "";
  let hashtagsStr = "";

  if (campaign.social.baseCaption !== undefined) {
    const campNoStr = String(campaign.number).padStart(2, '0');
    let prefixTitle = `${campNoStr} ${campaign.title}`;
    beforeText = prefixTitle + '\n\n' + campaign.social.baseCaption;
    hashtagsStr = campaign.social.hashtags || "";
  } else {
    const caption = campaign.social.caption;
    const marker = "Quer se aprofundar neste assunto e se tornar um expert?";
    if (caption.includes(marker)) {
      const parts = caption.split(marker);
      beforeText = parts[0].trimEnd();
      const afterMarkerText = marker + parts[1];
      const lines = afterMarkerText.split('\n');
      hashtagsStr = lines.filter(l => l.trim().startsWith('#')).join('\n');
    } else {
      const lines = caption.split('\n');
      const normalLines = [];
      const hashtagLines = [];
      for (const l of lines) {
        if (l.trim().startsWith('#')) {
          hashtagLines.push(l);
        } else {
          normalLines.push(l);
        }
      }
      beforeText = normalLines.join('\n').trimEnd();
      hashtagsStr = hashtagLines.join('\n');
    }
  }

  const relatedIds = campaign.related_subjects || [];
  let relatedCampaignsStr = AppState.campaigns
    .filter(c => c.id !== campaign.id && relatedIds.includes(c.id))
    .map(c => `▶️ ${String(c.number).padStart(2, '0')} - ${c.title}`)
    .join('\n');
    
  let newCrossRefText = "";
  if (relatedCampaignsStr.length > 0) {
    newCrossRefText = "Quer se aprofundar neste assunto e se tornar um expert? Acesse agora mesmo nosso arsenal de minisséries exclusivas:\n" + relatedCampaignsStr;
  } else {
    newCrossRefText = "Quer se aprofundar neste assunto e se tornar um expert? Fique ligado nas próximas minisséries exclusivas!";
  }

  if (campaign.social.baseCaption !== undefined) {
    let newCaption = campaign.social.baseCaption;
    if (hashtagsStr) newCaption += '\n\n' + hashtagsStr;
    campaign.social.caption = newCaption;
  } else {
    let newCaption = beforeText;
    if (hashtagsStr) newCaption += '\n\n' + hashtagsStr;
    campaign.social.caption = newCaption;
  }

  AppState.save();
  
  if (btnElement) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "ATUALIZADO!";
    btnElement.style.background = "var(--cyan)";
    btnElement.style.color = "#000";
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.style.background = "rgba(0, 174, 239, 0.2)";
      btnElement.style.color = "var(--cyan)";
    }, 2000);
  }
  
  setTimeout(() => UI.renderStudio(), 2000);
  UI.renderStudio();
};
window.copyExpandedContent = async function(type, index, btnElement) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) return;
  
  let textToCopy = "";
  let successMsg = "COPIADO!";
  
  if (type === 'gpt') {
    await window.buildGptPromptForExpanded(index);
    textToCopy = campaign.scenes[index].assembledPrompt || campaign.scenes[index].prompt;
    campaign.scenes[index].copiedGPT = true;
  } else if (type === 'gemini') {
    let prefixRaw = await fetchPrefix('./gemini/abertura.txt');
    let prefix = prefixRaw ? prefixRaw.replace(/\[TÍTULO EXATO AQUI\]\r?\n?/g, '') : "";
    textToCopy = (prefix ? prefix.trim() + "\n\n" : "") + (campaign.scenes[index].geminiMotion || "");
    campaign.scenes[index].assembledGemini = textToCopy;
    campaign.scenes[index].copiedGemini = true;
  } else if (type === 'social') {
    textToCopy = campaign.social.caption;
    campaign.social.copied = true;
  } else if (type === 'flow') {
    let prefixRaw = await fetchPrefix('./flow/flow.txt');
    let prefix = prefixRaw ? prefixRaw.trim() + "\n\n" : "";
    textToCopy = prefix + (campaign.flow.prompt || "");
    campaign.flow.copied = true;
  }
  
  AppState.save();
  navigator.clipboard.writeText(textToCopy);
  
  if (btnElement) {
    const originalText = btnElement.innerText;
    btnElement.innerText = successMsg;
    btnElement.style.background = "var(--cyan)";
    btnElement.style.color = "#000";
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.style.background = "";
      btnElement.style.color = "";
    }, 2000);
  }
  
  // Re-renderizar após 2 segundos para atualizar os selos
  setTimeout(() => UI.renderStudio(), 2000);
};

window.openReadModal = async function(type, index) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) return;

  const modal = document.getElementById('modalRead');
  const titleEl = document.getElementById('modalReadTitle');
  const contentEl = document.getElementById('modalReadContent');
  const badgeEl = document.getElementById('modalReadBadge');
  const copyBtn = document.getElementById('modalReadCopyBtn');
  const togglesEl = document.getElementById('modalGptToggles');
  
  let finalContent = "";
  let isCopied = false;

  modal.style.display = 'flex';
  contentEl.value = "Carregando...";
  badgeEl.style.display = 'none';
  togglesEl.style.display = 'none';

  if (type === 'gpt') {
    const s = campaign.scenes[index];
    titleEl.innerText = `CENA ${s.no} (PROMPT GPT)`;
    isCopied = !!s.copiedGPT;
    
    let url = './gpt/abertura.txt';
    let prefixRaw = await fetchPrefix(url);
    let prefix = prefixRaw.replace(/\[TÍTULO EXATO AQUI\]\r?\n?/g, '');
    let exactBlock = `TITULO EXATO: "${s.title || campaign.title}"`;
    finalContent = (prefix ? prefix.trim() : "") + "\n\n" + exactBlock + "\n\n" + s.prompt;
    contentEl.value = finalContent;
    
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(finalContent);
      s.copiedGPT = true;
      AppState.save();
      UI.renderStudio();
      badgeEl.style.display = 'block';
      copyBtn.innerText = "✓ COPIADO";
    };

  } else if (type === 'gemini') {
    const s = campaign.scenes[index];
    titleEl.innerText = `CENA ${s.no} (GEMINI MOTION)`;
    isCopied = !!s.copiedGemini;
    
    // Buscar a abertura do Gemini Motion (não contém texto, logo não recebe título)
    const prefix = await fetchPrefix('./gemini/abertura.txt');
    finalContent = (prefix ? prefix.trim() + "\n\n" : "") + s.geminiMotion;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(finalContent);
      s.copiedGemini = true;
      AppState.save();
      UI.renderStudio();
      badgeEl.style.display = 'block';
      copyBtn.innerText = "✓ COPIADO";
    };

  } else if (type === 'social') {
    titleEl.innerText = `LEGENDA SOCIAL`;
    isCopied = !!campaign.social.copied;
    
    finalContent = campaign.social.caption || campaign.social.baseCaption || "";

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(finalContent);
      campaign.social.copied = true;
      AppState.save();
      UI.renderStudio();
      badgeEl.style.display = 'block';
      copyBtn.innerText = "✓ COPIADO";
    };

  } else if (type === 'flow') {
    titleEl.innerText = `ROTEIRO MASTER`;
    isCopied = !!(campaign.flow && campaign.flow.copied);
    
    // We need to fetch the prefix async, but renderStudio is not async. 
    // However, the copy button function can be async!
    finalContent = (campaign.flow && campaign.flow.prompt) ? campaign.flow.prompt : "Roteiro não gerado.";

    copyBtn.onclick = async () => {
      if(!campaign.flow || !campaign.flow.prompt) return;
      let prefixRaw = await fetchPrefix('./flow/flow.txt');
      let prefix = prefixRaw ? prefixRaw.trim() + "\n\n" : "";
      let fullContentToCopy = prefix + campaign.flow.prompt;
      
      navigator.clipboard.writeText(fullContentToCopy);
      campaign.flow.copied = true;
      AppState.save();
      UI.renderStudio();
      badgeEl.style.display = 'block';
      copyBtn.innerText = "COPIADO";
    };
  }

  contentEl.value = finalContent;
  
  if (isCopied) {
    badgeEl.style.display = 'block';
    copyBtn.innerText = "✓ COPIADO";
  } else {
    badgeEl.style.display = 'none';
    copyBtn.innerText = "COPIAR TEXTO";
  }
};

window.handleGenerateAction = async function(type, campaignId, fromDashboard = false) {
  AppState.isGenerating = true; // Trava a UI
  const contentArea = document.getElementById('multiversePromptsArea') || document.body;
  
  // Salvar conteúdo original para restaurar depois se der erro
  const originalHtml = contentArea === document.body ? '' : contentArea.innerHTML;
  
  contentArea.innerHTML = `
    <style>
      @keyframes spinGlow { 100% { transform: rotate(360deg); } }
      @keyframes pulseGlow {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 0.3; }
      }
      @keyframes pulseHeart {
        0% { transform: scale(0.9); filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)); }
        50% { transform: scale(1.1); filter: drop-shadow(0 0 25px rgba(255,255,255,1)); }
        100% { transform: scale(0.9); filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)); }
      }
    </style>
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; position:relative;">
      
      <!-- Motores Orbitais -->
      <div style="display:flex; align-items:center; gap: 40px; margin-bottom: 60px; position:relative;">
        <!-- Conexão Central (Linha de energia) -->
        <div style="position:absolute; top:50%; left:40px; right:40px; height:2px; background: linear-gradient(90deg, var(--cyan), var(--magenta)); opacity: 0.4; z-index:0; filter: blur(2px);"></div>

        <!-- Motor 1 (Esquerda) -->
        <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; z-index:1;">
          <div style="position:absolute; inset:0; border-radius:50%; border:2px dashed var(--cyan); animation: spinGlow 4s linear infinite;"></div>
          <div style="position:absolute; inset:-10px; border-radius:50%; border:1px solid rgba(0, 174, 239, 0.2); animation: spinGlow 8s linear reverse infinite;"></div>
          <div style="position:absolute; inset:10px; border-radius:50%; background:var(--cyan); opacity:0.3; filter:blur(10px); animation: pulseGlow 2s ease-in-out infinite;"></div>
          <div style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(0,174,239,0.8));">🧠</div>
        </div>
        
        <!-- Motor Central (Núcleo) -->
        <div style="position:relative; width:150px; height:150px; display:flex; align-items:center; justify-content:center; transform: translateY(-20px); z-index:2;">
          <div style="position:absolute; inset:0; border-radius:50%; border:4px solid transparent; border-top-color: var(--magenta); border-bottom-color: var(--cyan); animation: spinGlow 1.5s linear infinite;"></div>
          <div style="position:absolute; inset:-15px; border-radius:50%; border:2px dashed rgba(255,255,255,0.1); animation: spinGlow 6s linear reverse infinite;"></div>
          <div style="position:absolute; inset:15px; border-radius:50%; border:1px solid rgba(255, 255, 255, 0.15); animation: spinGlow 3s linear infinite;"></div>
          
          <div style="position:absolute; inset:25px; border-radius:50%; background:var(--brandGrad); opacity:0.6; filter:blur(20px); animation: pulseGlow 1.5s ease-in-out infinite alternate;"></div>
          <div style="font-size: 4rem; animation: pulseHeart 1.5s ease-in-out infinite alternate; z-index: 3;">⚡</div>
        </div>

        <!-- Motor 3 (Direita) -->
        <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; z-index:1;">
          <div style="position:absolute; inset:0; border-radius:50%; border:2px dashed var(--magenta); animation: spinGlow 4s linear infinite reverse;"></div>
          <div style="position:absolute; inset:-10px; border-radius:50%; border:1px solid rgba(232, 0, 109, 0.2); animation: spinGlow 8s linear infinite;"></div>
          <div style="position:absolute; inset:10px; border-radius:50%; background:var(--magenta); opacity:0.3; filter:blur(10px); animation: pulseGlow 2s ease-in-out infinite 0.5s;"></div>
          <div style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(232,0,109,0.8));">👁️</div>
        </div>
      </div>

      <!-- Telemetria Textual -->
      <h2 style="font-family: var(--uiRounded); font-size: 3rem; color: #fff; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 40px rgba(0,174,239,0.6); text-align: center;">
        Invocando Motores de IA
      </h2>
      
      <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); padding: 12px 32px; border-radius: 50px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">
        <div style="width: 14px; height: 14px; background: #00d26a; border-radius: 50%; box-shadow: 0 0 15px #00d26a; animation: pulseGlow 1s infinite;"></div>
        <span style="color: #00d26a; font-family: 'Courier New', monospace; font-size: 1.15rem; font-weight: bold; letter-spacing: 2px;">STATUS: PROCESSANDO EM ÓRBITA...</span>
      </div>

      <p id="generationStatusMessage" style="color:var(--ivTextSecondary); font-size: 1.3rem; text-align:center; max-width: 600px; line-height: 1.6; font-family: var(--uiText);">
        Conectando ao núcleo V8 central...<br>Aguarde enquanto as redes neurais moldam sua minissérie.
      </p>
    </div>
  `;
  
  try {
    if (type === 'gpt') {
      await API.generateGPT(campaignId);
    } else if (type === 'gemini') {
      await API.generateGemini(campaignId);
    }
  } catch(e) {
    alert("Erro na geração: " + e.message);
  } finally {
    AppState.isGenerating = false; // Destrava a UI
  }
  
  if (fromDashboard) {
    UI.closeStudioModal();
    UI.renderPulsePanel();
  } else {
    UI.renderStudio();
  }
};

window.switchSceneTab = function(index, type) {
  AppState.activeSceneIndex = index;
  if(type === 'gpt' && UI.renderGPTArea) UI.renderGPTArea();
  if(type === 'gemini' && UI.renderGeminiArea) UI.renderGeminiArea();
};

window.handleDashboardGenerate = async function(campaignId, isRegenerating) {
  if (AppState.isGenerating) return;
  
  const campaign = AppState.campaigns.find(c => c.id === campaignId);
  if (!campaign) return;

  if (isRegenerating) {
    if (!confirm("Isso apagará as cenas e movimentos gerados desta minissérie. Deseja recriar do zero?")) return;
    campaign.scenes = [];
    campaign.generatedGPT = false;
    campaign.generatedGemini = false;
    AppState.save();
  }

  // Abre o modal de estúdio no modo "Invocando Motores"
  UI.openStudioModal('DIREÇÃO DE ARTE (GPT)');
  
  // Dispara a geração com a flag indicando que veio do dashboard
  await window.handleGenerateAction('gpt', campaignId, true);
};

window.handleRegenerateCampaign = async function(campaignId) {
  if (!confirm("Isso apagará as cenas e movimentos gerados desta minissérie. Deseja recriar do zero?")) return;
  
  const campaign = AppState.campaigns.find(c => c.id === campaignId);
  if (!campaign) return;
  
  campaign.scenes = [];
  campaign.generatedGPT = false;
  campaign.generatedGemini = false;
  
  AppState.studioActiveTab = 'gpt';
  UI.renderStudio();
};

window.handleDeleteCampaign = function(campaignId) {
  if (!confirm("🚨 ATENÇÃO: Deseja apagar DEFINITIVAMENTE essa minissérie? Ela será removida da biblioteca e desvinculada de todos os assuntos afins.")) return;
  
  // Remove from library
  AppState.campaigns = AppState.campaigns.filter(c => c.id !== campaignId);
  
  // Remove from suggested subjects if it's there
  AppState.suggestedSubjects = AppState.suggestedSubjects.filter(id => id !== campaignId);
  
  // Unlink from other campaigns' related_subjects
  AppState.campaigns.forEach(c => {
    if (c.related_subjects && c.related_subjects.includes(campaignId)) {
      c.related_subjects = c.related_subjects.filter(id => id !== campaignId);
    }
  });
  
  // Go back to Library
  AppState.selectedCampaignId = null;
  AppState.activeStage = 'library';
  
  AppState.save();
  
  // Update Topbar
  document.querySelectorAll('.stageTab').forEach(t => t.classList.remove('on'));
  const libBtn = document.querySelector('.stageTab[data-stage="library"]');
  if (libBtn) libBtn.classList.add('on');
  
  UI.renderWorkspace();
};

window.handleRegenerateSocial = async function(campaignId, btn) {
  const oldText = btn.innerHTML;
  btn.innerHTML = "✨ Regenerando...";
  btn.disabled = true;
  
  const campaign = AppState.campaigns.find(c => c.id === campaignId);
  if (campaign && campaign.social) {
    try {
      const payload = {
        campaign: {
          title: campaign.title,
          topic: campaign.topic,
          scenes: campaign.scenes
        },
        brief: 'adaptive'
      };
      
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Erro na API");
      
      const data = await res.json();
      const rawCaption = data.socialCaption;
      
      if (rawCaption) {
        let rc = rawCaption.trim();
        let hashtagRegex = /(?:\s*#[a-zA-Z0-9_À-ÿ]+)+\s*$/;
        let match = rc.match(hashtagRegex);
        let hashtags = "";
        if (match) {
           hashtags = match[0].trim();
           rc = rc.substring(0, match.index).trim();
        }
        let baseCaption = rc.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n\n');
        
        campaign.social.baseCaption = baseCaption;
        campaign.social.hashtags = hashtags;
        
        window.regenerateSocialCaption(campaignId, null);
      }
    } catch(err) {
      console.error(err);
      alert("Falha ao regenerar legenda.");
    }
  }
  
  btn.innerHTML = oldText;
  btn.disabled = false;
  UI.renderStudio();
};

// Atalho Ninja: Digitar um número e dar Enter na biblioteca
window.quickOpenCampaign = function(val) {
  if (!val) return;
  const term = val.trim().replace('#', '');
  
  // Acha a campanha que tenha exatamente esse número
  const target = AppState.campaigns.find(c => String(c.number) === term);
  if (target) {
    window.openCampaignFromLibrary(target.id);
  } else {
    // Se não for número, tenta encontrar pelo título para agilizar
    const targetTitle = AppState.campaigns.find(c => c.title.toLowerCase().includes(term.toLowerCase()));
    if (targetTitle) {
      window.openCampaignFromLibrary(targetTitle.id);
    }
  }
};

window.openCampaignFromLibrary = function(campaignId) {
  AppState.selectedCampaignId = campaignId;
  AppState.activeStage = 'studio';
  AppState.studioActiveTab = null;
  AppState.save();
  
  document.querySelectorAll('.stageTab').forEach(t => t.classList.remove('on'));
  document.querySelector('.stageTab[data-stage="studio"]').classList.add('on');
  
  UI.renderWorkspace();
};

window.setLibraryFilter = function(filter) {
  AppState.libraryFilter = filter;
  
  // Atualiza visual dos três botões de filtro
  const btnAll     = document.getElementById('btnFilterAll');
  const btnPending = document.getElementById('btnFilterPending');
  const btnComp    = document.getElementById('btnFilterCompleted');

  const activeStyle   = 'background: var(--brandGrad); color: #fff; border: 1px solid transparent; font-weight: bold; padding: 10px 22px; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,174,239,0.4); font-size: 0.88rem;';
  const inactiveStyle = 'background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.18); font-weight: normal; padding: 10px 22px; border-radius: 10px; cursor: pointer; font-size: 0.88rem; box-shadow: none;';
  
  if (btnAll)     btnAll.style.cssText     = filter === 'all'       ? activeStyle : inactiveStyle;
  if (btnPending) btnPending.style.cssText = filter === 'pending'   ? activeStyle : inactiveStyle;
  if (btnComp)    btnComp.style.cssText    = filter === 'completed' ? activeStyle : inactiveStyle;
  
  UI.renderLibrary();
};

// Lógica de Backup VORTEX 10.0 (Exportar/Importar Todas as 7 Salas dos Multiversos)
const btnExport = document.getElementById('btnExport');
const inputImport = document.getElementById('importBackupFile');

if (btnExport) {
  btnExport.addEventListener('click', async () => {
    try {
      if (typeof window.loadCtaDatabase === 'function') {
        await window.loadCtaDatabase();
      }

      const backupObject = {
        version: "10.0",
        timestamp: new Date().toISOString(),
        systemName: "InkVortex Brasil VORTEX 10.0",
        activeStage: AppState.activeStage || "multiverse",
        activeSubTab: AppState.activeSubTab || "library",
        suggestedSubjects: AppState.suggestedSubjects || [],
        campaigns: AppState.campaigns || [],
        mistralKey: AppState.mistralKey || "",
        ctaDatabase: window.ctaDatabase || [],
        documentariosDatabase: window.documentariosDatabase || [],
        audioDatabase: window.audioDatabase || [],
        editorialDatabase: window.editorialDatabase || [],
        shortsDatabase: window.shortsDatabase || []
      };

      const dataStr = JSON.stringify(backupObject, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `VORTEX10-BACKUP-OFICIAL-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao exportar backup VORTEX 10.0: " + err.message);
    }
  });
}

// O botão Reset apaga a memória. Import carrega VORTEX 9.0 Completo.
const btnReset = document.getElementById('btnReset');
if (btnReset) {
  btnReset.addEventListener('click', (e) => {
    if(confirm("ALERTA VERMELHO: Isso vai apagar TODA a sua biblioteca de campanhas e multiversos atual! Tem certeza que deseja resetar o sistema inteiro?")) {
      localStorage.clear();
      location.reload();
    }
  });
}

const btnImport = document.getElementById('btnImport');

if (inputImport) {
  inputImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        
        if (data.campaigns) {
          AppState.campaigns = data.campaigns;
          AppState.suggestedSubjects = data.suggestedSubjects || [];
          if (data.mistralKey) AppState.mistralKey = data.mistralKey;
          AppState.save(); // Persiste no localStorage
        }

        // Restaura banco comercial (ctaDatabase)
        if (data.ctaDatabase && Array.isArray(data.ctaDatabase)) {
          window.ctaDatabase = data.ctaDatabase;
          try {
            await fetch('/api/cta/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data.ctaDatabase)
            });
          } catch(errCta) {
            console.warn("Sincronização de CTA no servidor:", errCta);
          }
        }

        // Restaura outros multiversos se presentes
        if (data.documentariosDatabase) window.documentariosDatabase = data.documentariosDatabase;
        if (data.audioDatabase) window.audioDatabase = data.audioDatabase;
        if (data.editorialDatabase) window.editorialDatabase = data.editorialDatabase;

        UI.renderWorkspace();
        if (typeof window.renderComercialRoom === 'function') {
          window.renderComercialRoom();
        }

        alert("✅ BACKUP VORTEX 10.0 RESTAURADO COM SUCESSO!\n\nTodas as 7 salas dos Multiversos e campanhas foram restauradas e sincronizadas.");
      } catch (err) {
        alert("Erro ao ler o backup VORTEX 10.0: " + err.message);
      }
    };
    reader.readAsText(file);
  });
}

// CSS inline dinâmico pro spinner
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

window.toggleApi = function(apiStr) {
  if (apiStr === 'gpt-on') AppState.apiStatus.gpt = true;
  if (apiStr === 'gpt-off') AppState.apiStatus.gpt = false;
  if (apiStr === 'gemini') AppState.apiStatus.gemini = !AppState.apiStatus.gemini;
  UI.renderPulsePanel();
}

window.generateFlowMaster = async function(campaignId, btn) {
  AppState.isGenerating = true; // Trava a UI
  
  // Identifica qual container está visível na tela no momento
  let contentArea = null;
  const flowRoom = document.getElementById('flowRoomView');
  if (flowRoom && flowRoom.style.display !== 'none') {
    contentArea = document.getElementById('flowRoomGrid');
  } else {
    contentArea = document.getElementById('multiversePromptsArea');
  }
  if (!contentArea) contentArea = document.getElementById('multiversePromptsArea');
  
  contentArea.innerHTML = `
    <style>
      @keyframes spinGlowFlow { 100% { transform: rotate(360deg); } }
      @keyframes pulseGlowFlow {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 0.3; }
      }
      @keyframes pulseHeartFlow {
        0% { transform: scale(0.9); filter: drop-shadow(0 0 10px rgba(255,215,0,0.5)); }
        50% { transform: scale(1.1); filter: drop-shadow(0 0 35px rgba(255,215,0,1)); }
        100% { transform: scale(0.9); filter: drop-shadow(0 0 10px rgba(255,215,0,0.5)); }
      }
    </style>
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; position:relative;">
      
      <!-- Motores Orbitais Master -->
      <div style="display:flex; align-items:center; gap: 40px; margin-bottom: 60px; position:relative;">
        <!-- Conexao Central -->
        <div style="position:absolute; top:50%; left:40px; right:40px; height:2px; background: linear-gradient(90deg, #ff8c00, #ffd700); opacity: 0.6; z-index:0; filter: blur(2px);"></div>

        <!-- Motor 1 (Esquerda) -->
        <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; z-index:1;">
          <div style="position:absolute; inset:0; border-radius:50%; border:2px dashed #ff8c00; animation: spinGlowFlow 3s linear infinite;"></div>
          <div style="position:absolute; inset:-10px; border-radius:50%; border:1px solid rgba(255, 140, 0, 0.3); animation: spinGlowFlow 6s linear reverse infinite;"></div>
          <div style="position:absolute; inset:10px; border-radius:50%; background:#ff8c00; opacity:0.3; filter:blur(10px); animation: pulseGlowFlow 2s ease-in-out infinite;"></div>
          <div style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(255,140,0,0.8));">🧠</div>
        </div>
        
        <!-- Motor Central (Nucleo) -->
        <div style="position:relative; width:150px; height:150px; display:flex; align-items:center; justify-content:center; transform: translateY(-20px); z-index:2;">
          <div style="position:absolute; inset:0; border-radius:50%; border:4px solid transparent; border-top-color: #ffd700; border-bottom-color: #ff8c00; animation: spinGlowFlow 1.2s linear infinite;"></div>
          <div style="position:absolute; inset:-15px; border-radius:50%; border:2px dashed rgba(255,215,0,0.3); animation: spinGlowFlow 4s linear reverse infinite;"></div>
          <div style="position:absolute; inset:15px; border-radius:50%; border:1px solid rgba(255, 215, 0, 0.2); animation: spinGlowFlow 2.5s linear infinite;"></div>
          
          <div style="position:absolute; inset:25px; border-radius:50%; background:linear-gradient(45deg, #ff8c00, #ffd700); opacity:0.6; filter:blur(20px); animation: pulseGlowFlow 1.5s ease-in-out infinite alternate;"></div>
          <div style="font-size: 4rem; animation: pulseHeartFlow 1.5s ease-in-out infinite alternate; z-index: 3;">🔥</div>
        </div>

        <!-- Motor 3 (Direita) -->
        <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; z-index:1;">
          <div style="position:absolute; inset:0; border-radius:50%; border:2px dashed #ffd700; animation: spinGlowFlow 3s linear infinite reverse;"></div>
          <div style="position:absolute; inset:-10px; border-radius:50%; border:1px solid rgba(255, 215, 0, 0.3); animation: spinGlowFlow 6s linear infinite;"></div>
          <div style="position:absolute; inset:10px; border-radius:50%; background:#ffd700; opacity:0.3; filter:blur(10px); animation: pulseGlowFlow 2s ease-in-out infinite 0.5s;"></div>
          <div style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(255,215,0,0.8));">🎬</div>
        </div>
      </div>

      <!-- Telemetria Textual -->
      <h2 style="font-family: var(--uiRounded); font-size: 3rem; color: #fff; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 40px rgba(255,215,0,0.6); text-align: center;">
        Invocando Motores de IA
      </h2>
      
      <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,215,0,0.3); padding: 12px 32px; border-radius: 50px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">
        <div style="width: 14px; height: 14px; background: #ffd700; border-radius: 50%; box-shadow: 0 0 15px #ffd700; animation: pulseGlowFlow 1s infinite;"></div>
        <span style="color: #ffd700; font-family: 'Courier New', monospace; font-size: 1.15rem; font-weight: bold; letter-spacing: 2px;">STATUS: SINTONIZANDO VEO...</span>
      </div>

      <p style="color:var(--ivTextSecondary); font-size: 1.3rem; text-align:center; max-width: 600px; line-height: 1.6; font-family: var(--uiText);">
        Conectando ao núcleo cinemático central...<br>Aguarde enquanto as diretrizes do especialista moldam sua minissérie.
      </p>
    </div>
  `;
  
  try {
    const campaign = AppState.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campanha nao encontrada");
    
    const response = await fetch('/api/generate-flow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erro na geracao");
    }
    
    const data = await response.json();
    campaign.flow = { prompt: data.prompt };
    AppState.save();
  } catch (error) {
    console.error("Erro ao gerar roteiro master:", error);
    alert("Falha: " + error.message);
  } finally {
    AppState.isGenerating = false;
    UI.renderStudio(); // Recarrega a UI do cockpit
    if (window.currentRoomId === 'flowRoomView' && typeof window.openFlowRoom === 'function') {
      window.openFlowRoom();
    }
  }
};

// ==========================================
// MÉTODOS DO MULTIVERSO (NOVAS SALAS)
// ==========================================

window.updateTopbarTitle = function(title = '', subtitle = '') {
  const tEl = document.getElementById('topbarTitle');
  const sEl = document.getElementById('topbarSubtitle');
  if (tEl) tEl.innerText = title;
  if (sEl) sEl.innerText = subtitle;
};

window.switchMultiverseRoom = function(roomId, btnId) {
  // Update tracking variable and change wallpaper
  window.currentRoomId = roomId;
  if(window.updateWallpaperForCurrentRoom) window.updateWallpaperForCurrentRoom();

  if (roomId === 'multiverseWelcome') {
    window.updateTopbarTitle('', '');
  } else if (roomId === 'pageLibrary') {
    window.updateTopbarTitle('Multiverso Biblioteca', 'Acesse seu histórico de campanhas produzidas durante esta sessão.');
  }

  const rooms = [
    'pageLibrary',
    'multiverseWelcome',
    'socialMediaView',
    'storyboardView',
    'audioRoomView',
    'flowRoomView',
    'documentariosRoomView',
    'shortsView',
    'comercialView'
  ];
  
  // Hide all rooms
  rooms.forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });

  const orbitLeft = document.getElementById('orbitLeft');
  const orbitRight = document.getElementById('orbitRight');
  const btnBack = document.getElementById('btnBackToDashboard');

  // Show the target room
  const target = document.getElementById(roomId);
  if(target) {
    target.style.display = 'flex';
    target.classList.add('active');
  }

  // As 7 abas do Multiverso (orbitLeft) permanecem SEMPRE VISÍVEIS para navegação fluida entre salas
  if(orbitLeft) orbitLeft.style.display = 'flex';

  // Dashboard vs Isolated Room logic
  if(roomId === 'multiverseWelcome') {
    if(orbitRight) orbitRight.style.display = 'flex';
    if(btnBack) btnBack.style.display = 'none';
  } else {
    if(orbitRight) orbitRight.style.display = 'none';
    if(btnBack) btnBack.style.display = 'flex';
  }

  if(btnId && window.highlightActiveRoom) {
    window.highlightActiveRoom(btnId);
  }
};

window.openCommandRoom = function() {
  // pageIdeation não existe no V9 — o Centro de Comando é o multiverseWelcome
  window.switchMultiverseRoom('multiverseWelcome', null);
  if (typeof UI !== 'undefined' && UI.renderIdeationGrid) {
    UI.renderIdeationGrid();
  }
};

window.openLibraryRoom = function() {
  window.switchMultiverseRoom('pageLibrary', 'btnNavLibrary');
  if (typeof UI !== 'undefined' && UI.renderLibrary) {
    // Garante que o filtro 'Todas' começa ativo visualmente
    window.setLibraryFilter(AppState.libraryFilter || 'all');
  }
};

// Regenera a campanha selecionada do zero (GPT + Gemini)
window.regenerateCurrentCampaign = async function() {
  const campaign = AppState.getSelectedCampaign();
  if (!campaign) return;
  if (!confirm(`Isso vai APAGAR o conteúdo gerado da Minissérie ${campaign.number} e regenerar do zero. Confirma?`)) return;
  // Limpa o conteúdo gerado
  campaign.generatedGPT = false;
  campaign.generatedGemini = false;
  campaign.scenes = [];
  campaign.social = {};
  campaign.flow = {};
  AppState.save();
  UI.renderStudio();
  window.renderMultiverseControlPanel();
};

window.openGPTModal = function() {
  const promptsArea = document.getElementById('multiversePromptsArea');
  if(promptsArea) {
    promptsArea.style.display = 'flex';
    AppState.studioActiveTab = 'gpt';
    if (typeof UI !== 'undefined' && UI.renderGPTArea) {
      UI.renderGPTArea();
    }
  }
};

window.openGeminiModal = function() {
  const promptsArea = document.getElementById('multiversePromptsArea');
  if(promptsArea) {
    promptsArea.style.display = 'flex';
    AppState.studioActiveTab = 'gemini';
    if (typeof UI !== 'undefined' && UI.renderGeminiArea) {
      UI.renderGeminiArea();
    }
  }
};

window.openFlowModal = function() {
  const promptsArea = document.getElementById('multiversePromptsArea');
  if(promptsArea) {
    promptsArea.style.display = 'flex';
    AppState.studioActiveTab = 'flow';
    if (typeof UI !== 'undefined' && UI.renderFlowArea) {
      UI.renderFlowArea();
    }
  }
};
