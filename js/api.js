// Conexão com o Motor Real V8 (Node Server localhost:8787)

function updateStatusMessage(msg) {
  const el = document.getElementById('generationStatusMessage');
  if (el) el.innerHTML = msg;
}

function requireKeysSet() {
  return true; // We now rely on the backend to manage keys natively.
}

const API = {
  async generateSubjects(customBrief) {
    console.log("Gerando novos assuntos localmente (Modo VORTEX 9 Autónomo)...");
    
    // Simula a latência da IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const term = customBrief || "Inovação Técnica em Estamparia";
    
    return [
      { 
        title: "Sinergia DTF & Produtividade", 
        description: `Como a fusão das novas tecnologias de impressão está redefinindo o fluxo de trabalho para o tema: ${term}.`, 
        groupSubject: "Produtividade Avançada" 
      },
      { 
        title: "O Futuro da Tinta Branca", 
        description: `Os segredos técnicos por trás da circulação e manutenção que garantem o branco perfeito em equipamentos Epson.`, 
        groupSubject: "Manutenção Preventiva" 
      },
      { 
        title: "Dominando o " + term, 
        description: `Uma análise profunda sobre as variáveis que controlam o resultado final e reduzem perdas no processo produtivo.`, 
        groupSubject: "Controle de Qualidade" 
      }
    ];
  },

  async generateGPT(campaignId) {
    updateStatusMessage("Preparando pacote de dados para o motor...");
    
    const campaign = AppState.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campanha não encontrada no state.");

    const payload = {
      profile: 'adaptive',
      topic: {
        title: campaign.title,
        description: campaign.topic.groupSubject,
        groupSubject: campaign.topic.groupSubject
      }
    };

    updateStatusMessage("Iniciando Job de Geração Completa (GPT + Gemini + Social)...");
    const startRes = await fetch('/api/generate-complete/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    
    const startData = await startRes.json();
    if (!startRes.ok) throw new Error(startData.error || "Erro ao iniciar job.");
    
    const jobId = startData.jobId;
    if (!jobId) throw new Error("A API não devolveu o ID do Job.");
    
    // Polling do Job
    let result = null;
    let pollCount = 0;
    while (pollCount < 3600) { // Timeout de segurança (~ 1 hora)
      await new Promise(r => setTimeout(r, 1000));
      pollCount++;
      
      const statusRes = await fetch(`/api/generate-complete/status?jobId=${encodeURIComponent(jobId)}`);
      const statusData = await statusRes.json();
      
      if (!statusRes.ok) throw new Error(statusData.error || "Erro ao consultar status.");
      
      // Atualiza interface com os passos
      const stageStr = statusData.stage ? `[${statusData.stage}]` : '';
      const stepStr = (statusData.step && statusData.total) ? `(${statusData.step}/${statusData.total})` : '';
      const detailStr = statusData.detail || 'Processando...';
      updateStatusMessage(`<b>${stageStr} ${stepStr}</b><br>${detailStr}`);
      
      if (statusData.status === 'done') {
        result = statusData.result;
        break;
      }
      
      if (statusData.status === 'error' || statusData.status === 'cancelled') {
        throw new Error(statusData.error || "Geração interrompida no servidor.");
      }
    }

    if (!result) throw new Error("Timeout na geração.");

    updateStatusMessage("Finalizando e empacotando os resultados...");

    // Mapeamento Inteligente: API -> V8 AppState
    const payloadResult = result.campaign || result;
    const scenes = payloadResult.scenes || [];
    const motions = payloadResult.motionScenes || [];
    
    campaign.scenes = scenes.map((s, i) => ({
      no: i + 1,
      title: s.title || `Cena ${i+1}`,
      lines: s.lines || [],
      prompt: s.prompt,
      geminiMotion: motions[i] ? motions[i].motionPrompt : "Movimento não gerado."
    }));
    
    let rawCaption = (payloadResult.socialCaption || "").trim();

    campaign.social = {
      baseCaption: rawCaption,
      caption: rawCaption
    };
    
    let flowScript = "";
    if (payloadResult.flowMaster && payloadResult.flowMaster.prompt) {
      flowScript = payloadResult.flowMaster.prompt;
    }
    
    campaign.flow = {
      prompt: flowScript
    };

    campaign.generatedGPT = true;
    campaign.generatedGemini = true; // Job completo traz o Gemini junto
    
    // Auto-create folders on disk
    fetch('/api/init-render-folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignNumber: campaign.number })
    }).catch(e => console.error('Failed to init folders', e));
    
    // Salvar o estado com a minissérie preenchida
    AppState.save();
  },

  async generateGemini(campaignId) {
    // Como o botão de gerar no Studio agora invoca "generate-complete" (que engloba tudo),
    // o botão individual do Gemini pode simplesmente não fazer nada ou alertar que já foi gerado.
    const campaign = AppState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    if (campaign.generatedGemini) {
      alert("O motor Gemini já foi executado no pipeline principal (Generate Complete). Vá para a aba Gemini e confira os Movimentos!");
    } else {
      alert("Por favor, rode 'GERAR MINISSÉRIE' na aba GPT para rodar a pipeline completa.");
    }
  }
};
