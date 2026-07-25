// Estado Global - VORTEX 10.0

const AppState = {
  activeStage: 'multiverse', 
  activeSubTab: 'library', 
  libraryFilter: 'all', 
  expandedCard: null, 
  globalGptMode: 'off',
  
  apiStatus: {
    gpt: true,
    gemini: true
  },
  
  suggestedSubjects: [],
  campaigns: [],
  selectedCampaignId: null,
  mistralKey: '', 
  isGenerating: false, 
  isGeneratingSubjects: false, 
  generatingNumbers: [], 
  generatingError: null, 
  
  init() {
    this.load();
    console.log("VORTEX 10.0 State Initialized");
  },
  
  save() {
    try {
      const data = {
        suggestedSubjects: this.suggestedSubjects,
        campaigns: this.campaigns,
        selectedCampaignId: this.selectedCampaignId,
        globalGptMode: this.globalGptMode,
        mistralKey: this.mistralKey,
        activeStage: this.activeStage,
        activeSubTab: this.activeSubTab
      };
      localStorage.setItem('vortex10_state', JSON.stringify(data));
      localStorage.setItem('vortex9_state', JSON.stringify(data));
    } catch(e) {
      console.error("Erro ao salvar estado VORTEX 10:", e);
    }
  },
  
  load() {
    try {
      const stored = localStorage.getItem('vortex10_state') || localStorage.getItem('vortex9_state') || localStorage.getItem('vortex8_state');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.suggestedSubjects) this.suggestedSubjects = data.suggestedSubjects;
        if (data.campaigns) this.campaigns = data.campaigns;
        if (data.selectedCampaignId) this.selectedCampaignId = data.selectedCampaignId;
        if (data.globalGptMode) this.globalGptMode = data.globalGptMode;
        if (data.mistralKey) this.mistralKey = data.mistralKey;
        if (data.activeStage) this.activeStage = data.activeStage;
        if (data.activeSubTab) this.activeSubTab = data.activeSubTab;
        
        // HIGIENIZAÇÃO DE BANCO DE DADOS SOLICITADA PELO DIREITOR:
        // 1. Deleta a Minissérie 3 em branco sem conteúdo
        this.campaigns = this.campaigns.filter(c => {
          if (c.title === 'Minissérie 3' && (!c.scenes || c.scenes.length === 0)) return false;
          if (c.topic && c.topic.description && c.topic.description.includes('Assunto inserido manualmente')) return false;
          return true;
        });

        // 2. Transforma o segundo 2 duplicado ("Tintas Circulares...") em Minissérie 3 (number: 3)
        // 3. Transforma a CyberArt em Minissérie 6 (number: 6)
        // 4. Transforma Tecido que Brilha duplicado em Minissérie 8 (number: 8)
        this.campaigns.forEach(c => {
          if (c.title && c.title.includes('Tintas Circulares')) {
            c.number = 3;
          }
          if (c.title && c.title.includes('Tecido Luminescente CyberArt')) {
            c.number = 6;
          }
          if (c.title && c.title.includes('Tecido que Brilha')) {
            c.number = 8;
          }
        });

        // BACKFILL: Garante que campanhas velhas ganhem linhas de apoio falsas para teste imediato
        this.campaigns.forEach(c => {
          // VARREDOR DE LIXO DA MEMÓRIA RAM (Persistent Cleanup - Extermínio Seguro)
          if (c.flow && c.flow.prompt) {
            let cutIdx = c.flow.prompt.indexOf("cinematic stingers.");
            if (cutIdx !== -1) {
                c.flow.prompt = c.flow.prompt.substring(cutIdx + "cinematic stingers.".length).trim();
            } else {
                cutIdx = c.flow.prompt.indexOf("throughout the motion.");
                if (cutIdx !== -1) {
                    c.flow.prompt = c.flow.prompt.substring(cutIdx + "throughout the motion.".length).trim();
                }
            }
            // Se restou apenas lixo sem nada de útil (caso de erro), limpa a chave inteira
            // Se restou apenas o cabeçalho velho sem nada (caso de erro), limpa tudo
            if (c.flow.prompt.trim() === '') {
                delete c.flow;
            }
          }

          if (c.scenes) {
            c.scenes.forEach(s => {
              if (!s.lines || s.lines.length === 0) {
                s.lines = [
                  "Primeira linha de apoio recuperada pela central.",
                  "Segunda linha explicativa para compor a imagem.",
                  "Terceira linha com o detalhe técnico da cena."
                ];
              }
            });
          }
        });
        this.save();
      }
    } catch(e) {
      console.error("Erro ao carregar estado:", e);
    }
  },
  
  getSelectedCampaign() {
    return this.campaigns.find(c => c.id === this.selectedCampaignId) || this.campaigns[0];
  }
};
