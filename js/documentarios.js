// 🎥 Multiverso Documentários 9.0 — Seletor Manual de MP3 por Minissérie com Leitura de Tempo (MM:SS) e Confirmação no Botão ATUALIZAR

let currentAffinityBlocks = [];
let activeBlockIndex = null; // null = Grade 2 Colunas; number = Card Expandido
let blockAudioStatus = {};
let activeDocumentariosTab = 'production'; // 'production' | 'library'

// Estado das seleções e confirmações de áudio pelo Diretor
let userSelectedDocMp3s = {}; // { "01": "filename.mp3", "02": "filename.mp3" }
let userConfirmedDocMp3s = {}; // { "01": true, "02": true }

// Atalho Tecla ESC para fechar card expandido
window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
    if (activeBlockIndex !== null) {
      window.closeExpandedDocCard();
    }
  }
});

window.openDocumentarios = async function() {
  window.switchMultiverseRoom('documentariosRoomView', 'btnNavDocumentarios');
  
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.innerText = 'Multiverso Documentários';
  const subEl = document.getElementById('topbarSubtitle');
  if (subEl) subEl.innerText = 'Histórico e Esteira de Documentários Longos para o YouTube';

  const savedJobId = localStorage.getItem('activeDocJobId');
  if (savedJobId) {
    window.activeDocJobId = savedJobId;
  }

  await fetchDocumentaries();
  buildAffinityBlocks();
  window.switchDocumentariosTab('production');
};

window.closeDocumentarios = function() {
  document.getElementById('documentariosRoomView').style.display = 'none';
  document.getElementById('multiverseWelcome').style.display = 'flex';
  if (window.highlightActiveRoom) window.highlightActiveRoom(null);
};

async function fetchDocumentaries() {
  try {
    const res = await fetch('/api/documentaries');
    if (res.ok) {
      const data = await res.json();
      AppState.documentaries = data.docs || [];
    }
  } catch(e) {
    AppState.documentaries = [];
  }
}

// 🧠 Agrupamento Estrito: 3 Minisséries por Documentário
function buildAffinityBlocks() {
  const validCampaigns = (AppState.campaigns || []).filter(c => c.scenes && c.scenes.length > 0);
  
  if (validCampaigns.length === 0) {
    currentAffinityBlocks = [];
    return;
  }

  const blocks = [];
  const chunkSize = 3;

  for (let i = 0; i < validCampaigns.length; i += chunkSize) {
    const chunk = validCampaigns.slice(i, i + chunkSize);
    const blockNum = Math.floor(i / chunkSize) + 1;
    
    const firstTitle = chunk[0]?.topic?.title || chunk[0]?.title || `Coleção ${blockNum}`;
    let shortCategory = 'Coleção Técnica';
    if (firstTitle.toLowerCase().includes('dtg') || firstTitle.toLowerCase().includes('dtf')) shortCategory = 'Impressão Têxtil (DTG & DTF)';
    else if (firstTitle.toLowerCase().includes('tecido') || firstTitle.toLowerCase().includes('bio')) shortCategory = 'Biomoda & Tecidos Vivos';
    else if (firstTitle.toLowerCase().includes('eco') || firstTitle.toLowerCase().includes('resíduo')) shortCategory = 'Eco-Design & Sustentabilidade';

    const numStrList = chunk.map(c => String(c.number || c.id || '?').padStart(2, '0')).join(', ');

    blocks.push({
      id: `doc-${blockNum}`,
      docNum: blockNum,
      numDisplay: String(blockNum).padStart(2, '0'),
      title: `Documentário ${String(blockNum).padStart(2, '0')}: ${shortCategory}`,
      subtitle: `Minisséries ${numStrList}`,
      campaigns: chunk,
      category: shortCategory
    });
  }

  currentAffinityBlocks = blocks;
}

// 📡 Telemetria de Áudio MP3 (Carrega todas as faixas disponíveis com tempo MM:SS)
async function refreshActiveBlockTelemetry() {
  if (activeBlockIndex === null || !currentAffinityBlocks[activeBlockIndex]) return;
  const currentBlock = currentAffinityBlocks[activeBlockIndex];

  try {
    const res = await fetch('/api/check-block-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        campaigns: currentBlock.campaigns,
        campaignIds: currentBlock.campaigns.map(c => c.number || c.id)
      })
    });
    if (res.ok) {
      const data = await res.json();
      blockAudioStatus = data.results || {};
    }
  } catch(e) {
    console.warn('Erro na telemetria:', e);
  }
}

// 🔍 Seleção de Faixa MP3 pelo Diretor
window.handleSelectDocMp3Track = function(campaignNum, filename) {
  if (!userSelectedDocMp3s) userSelectedDocMp3s = {};
  if (!userConfirmedDocMp3s) userConfirmedDocMp3s = {};

  userSelectedDocMp3s[campaignNum] = filename;
  // Alterar uma faixa coloca a minissérie em revisão até clicar em ATUALIZAR
  userConfirmedDocMp3s[campaignNum] = false;
  renderDocumentariosWorkspace();
};

// 🔄 Botão ATUALIZAR: Valida e Confirma as faixas MP3 selecionadas pelo Diretor
async function handleRefreshTelemetry() {
  if (activeBlockIndex === null || !currentAffinityBlocks[activeBlockIndex]) return;
  const currentBlock = currentAffinityBlocks[activeBlockIndex];

  await refreshActiveBlockTelemetry();

  let unselected = [];
  currentBlock.campaigns.forEach(c => {
    const cNum = String(c.number || (typeof c.id === 'string' ? (c.id.match(/\d+/)||[1])[0] : c.id)).padStart(2, '0');
    const selected = userSelectedDocMp3s[cNum];
    if (!selected) {
      unselected.push(cNum);
    } else {
      userConfirmedDocMp3s[cNum] = true;
    }
  });

  if (unselected.length > 0) {
    alert(`⚠️ Por favor, escolha a faixa MP3 no seletor para a(s) Minissérie(s) #${unselected.join(', #')} antes de atualizar.`);
  } else {
    alert(`✅ Faixas MP3 confirmadas com sucesso para o Documentário ${currentBlock.numDisplay}!`);
  }

  renderDocumentariosWorkspace();
}

// 🔍 Alternar Abas do Header Fixo
window.switchDocumentariosTab = function(tab) {
  activeDocumentariosTab = tab;
  activeBlockIndex = null;

  const btnProd = document.getElementById('btnDocTabProd');
  const btnLib = document.getElementById('btnDocTabLib');

  if (btnProd && btnLib) {
    if (tab === 'production') {
      btnProd.style.background = 'var(--brandGrad)';
      btnProd.style.color = '#fff';
      btnProd.style.border = '1px solid transparent';
      btnProd.style.boxShadow = '0 4px 15px rgba(0,174,239,0.4)';

      btnLib.style.background = 'rgba(255,255,255,0.06)';
      btnLib.style.color = 'rgba(255,255,255,0.8)';
      btnLib.style.border = '1px solid rgba(255,255,255,0.18)';
      btnLib.style.boxShadow = 'none';
    } else {
      btnLib.style.background = 'var(--brandGrad)';
      btnLib.style.color = '#fff';
      btnLib.style.border = '1px solid transparent';
      btnLib.style.boxShadow = '0 4px 15px rgba(0,174,239,0.4)';

      btnProd.style.background = 'rgba(255,255,255,0.06)';
      btnProd.style.color = 'rgba(255,255,255,0.8)';
      btnProd.style.border = '1px solid rgba(255,255,255,0.18)';
      btnProd.style.boxShadow = 'none';
    }

    btnLib.innerText = `📚 CATALOGADOS (${AppState.documentaries?.length || 0})`;
  }

  renderDocumentariosWorkspace();
};

// 🔍 Abrir Card Expandido Focado
window.openExpandedDocCard = async function(index) {
  activeBlockIndex = index;
  userConfirmedDocMp3s = {}; // Reseta confirmações ao abrir novo card
  await refreshActiveBlockTelemetry();
  renderDocumentariosWorkspace();
};

// ✖️ Fechar Card Expandido
window.closeExpandedDocCard = function() {
  activeBlockIndex = null;
  renderDocumentariosWorkspace();
};

// 🧠 Gerar Roteiro
async function handleGenerateDocumentary() {
  if (activeBlockIndex === null) return;
  const currentBlock = currentAffinityBlocks[activeBlockIndex];
  if (!currentBlock) return;

  try {
    const res = await fetch('/api/generate-documentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaigns: currentBlock.campaigns })
    });

    if (!res.ok) throw new Error('Falha ao gerar roteiro documental.');
    const data = await res.json();
    window.currentDocumentary = data.script;
    window.currentDocFilename = data.filename;
    alert(`✨ Roteiro para o Documentário ${currentBlock.numDisplay} gerado com sucesso!`);
    await fetchDocumentaries();
    renderDocumentariosWorkspace();
  } catch(err) {
    alert('Erro: ' + err.message);
  }
}

// 🎬 Renderizar Vídeo Final
async function handleRenderVideo() {
  if (activeBlockIndex === null) return;
  const currentBlock = currentAffinityBlocks[activeBlockIndex];
  if (!currentBlock) return;

  const btn = document.getElementById('btnRenderDoc');
  if (btn) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }

  try {
    const res = await fetch('/api/render-documentary/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numDisplay: currentBlock.numDisplay,
        docNum: currentBlock.numDisplay,
        script: window.currentDocumentary || 'Documentário com Trilha Sonora Multi-MP3 e Legenda Vertical',
        campaigns: currentBlock.campaigns,
        selectedMp3s: userSelectedDocMp3s // Envia as faixas confirmadas pelo usuário
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(errTxt);
    }

    const job = await res.json();
    window.activeDocJobId = job.jobId;
    localStorage.setItem('activeDocJobId', job.jobId);
    resumeDocPolling();
  } catch(error) {
    alert('Erro ao iniciar renderização: ' + error.message);
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
  }
}

function resumeDocPolling() {
  if (!window.activeDocJobId) {
    window.activeDocJobId = localStorage.getItem('activeDocJobId');
  }
  if (!window.activeDocJobId) return;

  if (window.activeDocPollInterval) clearInterval(window.activeDocPollInterval);
  const monitor = document.getElementById('docMonitorContainer');
  const log = document.getElementById('docMonitorLog');
  const bar = document.getElementById('docMonitorBar');
  const percent = document.getElementById('docMonitorPercent');
  const btn = document.getElementById('btnRenderDoc');

  if (monitor) monitor.style.display = 'block';

  window.activeDocPollInterval = setInterval(async () => {
    try {
      const statusRes = await fetch(`/api/render-documentary/status?jobId=${window.activeDocJobId}`);
      if (!statusRes.ok) throw new Error('Falha ao verificar progresso');
      const currentJob = await statusRes.json();

      if (currentJob.status === 'running') {
        if (log) log.innerText = currentJob.detail;
        let p = (currentJob.step / 4) * 100;

        if (currentJob.step === 3 && currentJob.detail) {
          const match = currentJob.detail.match(/(\d+)\/(\d+)\s+salvas/);
          if (match) {
            const saved = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            if (total > 0) {
              p = 50 + (saved / total) * 25; // Avanço em tempo real entre 50% e 75%
            }
          }
        }

        if (bar) bar.style.width = `${p.toFixed(1)}%`;
        if (percent) percent.innerText = `${Math.round(p)}%`;
      } else if (currentJob.status === 'done') {
        clearInterval(window.activeDocPollInterval);
        localStorage.removeItem('activeDocJobId');
        window.activeDocJobId = null;
        if (bar) bar.style.width = '100%';
        if (percent) percent.innerText = '100%';
        if (log) {
          log.style.background = 'rgba(0, 210, 106, 0.2)';
          log.style.borderLeftColor = '#00d26a';
          log.innerHTML = `✅ DOCUMENTÁRIO FINALIZADO E CATALOGADO!<br>Vídeo: ${currentJob.result.video}`;
        }
        await fetchDocumentaries();
        if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerText = '✨ RENDERIZAR NOVO'; }
      } else if (currentJob.status === 'error') {
        clearInterval(window.activeDocPollInterval);
        localStorage.removeItem('activeDocJobId');
        window.activeDocJobId = null;
        if (log) { log.style.background = 'rgba(255,68,68,0.2)'; log.innerHTML = `❌ Erro: ${currentJob.error}`; }
        if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
      }
    } catch(err) {
      clearInterval(window.activeDocPollInterval);
    }
  }, 2000);
}

// 🖥️ Renderização Principal no Contêiner
function renderDocumentariosWorkspace() {
  const contentEl = document.getElementById('documentariosRoomContent');
  if (!contentEl) return;

  if (activeDocumentariosTab === 'library') {
    contentEl.innerHTML = renderLibraryHTML();
  } else {
    if (activeBlockIndex !== null) {
      contentEl.innerHTML = renderExpandedDocCardHTML();
      if (window.activeDocJobId) resumeDocPolling();
    } else {
      contentEl.innerHTML = render2ColumnDocGridHTML();
    }
  }
}

// 📐 1. GRADE GERAL EM 2 COLUNAS (1:1 Idêntica a subjectsGrid da Biblioteca - Modo Ultra Compacto)
function render2ColumnDocGridHTML() {
  if (currentAffinityBlocks.length === 0) {
    return `<div style="text-align: center; color: var(--ivTextSecondary); padding: 40px; font-size: 1.1rem;">Nenhuma minissérie suficiente na biblioteca para formar blocos de documentários.</div>`;
  }

  let cardsHTML = currentAffinityBlocks.map((block, idx) => {
    const numDisplay = block.numDisplay;
    const numsStr = block.campaigns.map(c => `#${String(c.number||c.id).padStart(2,'0')}`).join(' • ');

    return `
      <article class="subjectCard" style="position:relative; cursor:pointer; transition: all 0.2s ease; width: 100%; box-sizing: border-box; padding: 18px 20px;" onclick="window.openExpandedDocCard(${idx})" onmouseover="this.style.borderColor='var(--cyan)';" onmouseout="this.style.borderColor='rgba(0,174,239,0.2)';">
        
        <!-- Insígnia Redonda Criança (01, 02...) -->
        <div style="position: absolute; top: 14px; left: 16px; width: 36px; height: 36px; background: var(--brandGrad); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--uiRounded); font-weight: bold; font-size: 1.05rem; box-shadow: 0 4px 12px rgba(0,0,0,0.5); color: #fff; z-index: 10; border: 2px solid rgba(255,255,255,0.2);">
          ${numDisplay}
        </div>

        <div class="cardHeader" style="position:relative; margin-left: 46px; min-height: 36px; display: flex; align-items: center;">
          <h2 style="font-size: 1.05rem; line-height: 1.3; margin: 0; color: #fff;">${block.category}</h2>
        </div>

        <!-- COMPACTO: Apenas a lista de números das minisséries -->
        <div style="margin-top: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: rgba(255,255,255,0.6); font-size: 0.82rem;">Minisséries:</span>
          <span style="color: var(--cyan); font-weight: bold; font-size: 0.88rem; letter-spacing: 0.5px;">${numsStr}</span>
        </div>

        <div style="margin-top: 16px;">
          <button class="actionBtn" style="padding: 10px; width: 100%; font-size: 0.85rem; background: rgba(0, 174, 239, 0.1); color: var(--cyan); border: 1px solid rgba(0, 174, 239, 0.3);" onclick="event.stopPropagation(); window.openExpandedDocCard(${idx})">
            🔍 Acessar Produção
          </button>
        </div>

      </article>
    `;
  }).join('');

  return `
    <div class="subjectsGrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px 28px; padding-bottom: 50px; width: 100%; box-sizing: border-box;">
      ${cardsHTML}
    </div>
  `;
}

// 🔍 2. CARD EXPANDIDO FOCADO (Com Seletor Manual de MP3s + Leitura de Tempo MM:SS + Confirmação no Botão ATUALIZAR)
function renderExpandedDocCardHTML() {
  const currentBlock = currentAffinityBlocks[activeBlockIndex];
  if (!currentBlock) return render2ColumnDocGridHTML();

  let confirmedCount = 0;
  currentBlock.campaigns.forEach(c => {
    const cNum = String(c.number || (typeof c.id === 'string' ? (c.id.match(/\d+/)||[1])[0] : c.id)).padStart(2, '0');
    if (userConfirmedDocMp3s[cNum] && userSelectedDocMp3s[cNum]) {
      confirmedCount++;
    }
  });

  const isAllConfirmed = (confirmedCount === currentBlock.campaigns.length && currentBlock.campaigns.length > 0);

  let html = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 20px; padding-bottom: 50px;">
      
      <!-- BARRA SUPERIOR DO CARD EXPANDIDO -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 20px;">
        <button class="actionBtn" onclick="window.closeExpandedDocCard()" style="background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 0.85rem; cursor: pointer;">
          ← VOLTAR À BIBLIOTECA (ESC)
        </button>

        <span style="color: var(--cyan); font-weight: bold; font-size: 0.9rem;">
          📌 PRODUÇÃO DO DOCUMENTÁRIO ${currentBlock.numDisplay}
        </span>
      </div>

      <!-- CÁPSULA OPERACIONAL RESTRITA AO CARD EXPANDIDO -->
      <div style="display: flex; gap: 10px; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,174,239,0.3); padding: 14px 20px; border-radius: 14px;">
        <button class="actionBtn" onclick="handleGenerateDocumentary()" style="flex: 1; background: var(--brandGrad); color: #fff; border: none; font-weight: bold; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 0.88rem;">
          ✨ GERAR ROTEIRO (DOC ${currentBlock.numDisplay})
        </button>

        <button id="btnRenderDoc" class="actionBtn" onclick="handleRenderVideo()" style="flex: 1.3; background: linear-gradient(135deg, #00aeff 0%, #0070ba 100%); color: #fff; border: none; font-weight: bold; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 0.88rem; box-shadow: 0 4px 15px rgba(0, 174, 239, 0.4);">
          🎬 RENDERIZAR VÍDEO ${currentBlock.numDisplay}
        </button>

        <button class="actionBtn" onclick="handleRefreshTelemetry()" style="background: var(--brandGrad); color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; font-size: 0.88rem; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 15px rgba(0,174,239,0.4);" title="Confirmar seleções de faixas MP3">
          🔄 ATUALIZAR & CONFIRMAR
        </button>
      </div>

      <!-- CARD EXPANDIDO EM DESTAQUE -->
      <article class="subjectCard" style="position:relative; width: 100%; border: 2px solid var(--cyan); background: rgba(0,0,0,0.5); padding: 24px;">
        
        <div style="position: absolute; top: 16px; left: 20px; width: 40px; height: 40px; background: var(--brandGrad); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--uiRounded); font-weight: bold; font-size: 1.15rem; box-shadow: 0 4px 12px rgba(0,0,0,0.5); color: #fff; z-index: 10; border: 2px solid rgba(255,255,255,0.2);">
          ${currentBlock.numDisplay}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-left: 50px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 1.2rem; color: #fff; margin: 0;">${currentBlock.title}</h2>
            <span style="color: var(--ivTextSecondary); font-size: 0.82rem;">${currentBlock.subtitle}</span>
          </div>

          <span style="background: ${isAllConfirmed ? 'rgba(0,210,106,0.15)' : 'rgba(255,170,0,0.15)'}; color: ${isAllConfirmed ? '#00d26a' : '#ffaa00'}; border: 1px solid ${isAllConfirmed ? 'rgba(0,210,106,0.3)' : 'rgba(255,170,0,0.3)'}; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 0.82rem;">
            ${isAllConfirmed ? `✅ MP3 CONFIRMADOS (${confirmedCount}/${currentBlock.campaigns.length})` : `⚠️ ÁUDIOS MP3: ${confirmedCount}/${currentBlock.campaigns.length}`}
          </span>
        </div>

        <!-- SELETOR MANUAL DE TRILHAS MP3 POR MINISSÉRIE COM MM:SS -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          <strong style="color: rgba(255,255,255,0.85); font-size: 0.88rem;">🎧 Escolha as Trilhas MP3 (Selecione a faixa e clique em ATUALIZAR para confirmar):</strong>
      `;

      currentBlock.campaigns.forEach(c => {
        const cId = c.id || c.number;
        const cNum = String(c.number || (typeof c.id === 'string' ? (c.id.match(/\d+/)||[1])[0] : c.id)).padStart(2, '0');
        const st = blockAudioStatus[c.number] || blockAudioStatus[cId] || blockAudioStatus[cNum] || blockAudioStatus[parseInt(cNum, 10)];
        const cTitle = c.topic?.title || c.title || 'Sem título';
        const tracks = (st && st.availableTracks) ? st.availableTracks : [];
        const currentSelected = userSelectedDocMp3s[cNum] || '';
        const isConfirmed = userConfirmedDocMp3s[cNum] && !!currentSelected;

        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 16px; border-radius: 10px; border: 1px solid ${isConfirmed ? 'rgba(0,210,106,0.4)' : 'rgba(255,170,0,0.4)'}; gap: 16px;">
            
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0;">
              <span style="color: #fff; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="[Minissérie ${cNum}] ${cTitle}">
                <strong>[Minissérie ${cNum}]</strong> ${cTitle}
              </span>
              
              <!-- DROPDOWN SELETOR DE MP3 COM MM:SS -->
              <select onchange="window.handleSelectDocMp3Track('${cNum}', this.value)" style="background: rgba(0,0,0,0.6); color: var(--cyan); border: 1px solid rgba(0,174,239,0.4); border-radius: 8px; padding: 6px 12px; font-size: 0.82rem; outline: none; cursor: pointer; max-width: 420px; font-weight: 500;">
                <option value="">-- Selecionar Trilha MP3 (Pendente) --</option>
        `;

        if (tracks.length > 0) {
          tracks.forEach(tr => {
            const isSel = (currentSelected === tr.filename);
            html += `<option value="${tr.filename}" ${isSel ? 'selected' : ''}>🎵 ${tr.filename} (⏱️ ${tr.formattedTime})</option>`;
          });
        } else if (st && st.allFiles && st.allFiles.length > 0) {
          st.allFiles.forEach(fName => {
            const isSel = (currentSelected === fName);
            html += `<option value="${fName}" ${isSel ? 'selected' : ''}>🎵 ${fName}</option>`;
          });
        }

        html += `
              </select>
            </div>

            <!-- BADGE INDICADOR (⚠️ MP3 em Revisão vs ✅ MP3 Confirmado) -->
            <span style="font-size: 0.85rem; font-weight: bold; color: ${isConfirmed ? '#00d26a' : '#ffaa00'}; background: ${isConfirmed ? 'rgba(0,210,106,0.15)' : 'rgba(255,170,0,0.15)'}; border: 1px solid ${isConfirmed ? 'rgba(0,210,106,0.3)' : 'rgba(255,170,0,0.3)'}; padding: 6px 14px; border-radius: 8px; flex-shrink: 0; margin-left: auto;">
              ${isConfirmed ? '✅ MP3' : '⚠️ MP3'}
            </span>

          </div>
        `;
      });

      html += `
        </div>

        <!-- MONITOR FFMPEG -->
        <div id="docMonitorContainer" style="display: none; width: 100%; background: rgba(0,0,0,0.6); border: 1px solid var(--cyan); border-radius: 14px; padding: 18px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #fff; font-size: 0.9rem;">PROCESSANDO DOCUMENTÁRIO ${currentBlock.numDisplay} (FFMPEG)</strong>
            <span id="docMonitorPercent" style="color: var(--cyan); font-weight: bold; font-size: 1rem;">0%</span>
          </div>
          
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 10px;">
            <div id="docMonitorBar" style="width: 0%; height: 100%; background: var(--brandGrad); transition: width 0.3s ease;"></div>
          </div>
          
          <div id="docMonitorLog" style="color: #fff; font-family: monospace; font-size: 0.82rem; background: rgba(0,174,239,0.1); border-left: 4px solid var(--cyan); padding: 8px 12px; border-radius: 0 6px 6px 0;">
            Iniciando os motores...
          </div>
        </div>

      </article>

    </div>
  `;

  return html;
}

// 🔍 Visualizador de Imagens HD em Tela Cheia (Slideshow / Carrossel com Setas ◀ ▶)
window.currentDocModalImages = [];
window.currentDocModalIndex = 0;

window.openDocImageModal = function(images, index = 0) {
  if (!images || images.length === 0) return;
  window.currentDocModalImages = Array.isArray(images) ? images : [images];
  window.currentDocModalIndex = Math.max(0, Math.min(index, window.currentDocModalImages.length - 1));

  let modal = document.getElementById('docImageLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'docImageLightboxModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.94); z-index:100000; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(10px); padding:20px; box-sizing:border-box; user-select:none;';
    modal.innerHTML = `
      <!-- Botão Fechar ✕ posicionado em top: 80px; right: 35px (Abaixo da Topbar, 100% livre e clicável) -->
      <button style="position:fixed; top:80px; right:35px; cursor:pointer; color:#fff; font-size:1.6rem; font-weight:bold; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.35); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:100002; backdrop-filter:blur(8px); box-shadow:0 4px 20px rgba(0,0,0,0.6); transition:all 0.2s ease;" onclick="window.closeDocImageModal()" onmouseover="this.style.background='var(--brandGrad)'; this.style.borderColor='transparent';" onmouseout="this.style.background='rgba(255,255,255,0.18)'; this.style.borderColor='rgba(255,255,255,0.35)';">✕</button>

      <!-- Seta Esquerda ◀ -->
      <button id="docImageLightboxPrev" style="position:fixed; left:30px; top:50%; transform:translateY(-50%); cursor:pointer; color:#fff; font-size:2rem; background:rgba(0,174,239,0.25); border:1px solid var(--cyan); width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:100001; backdrop-filter:blur(6px); transition:all 0.2s ease; box-shadow:0 0 20px rgba(0,174,239,0.4);" onclick="window.navDocImageModal(-1)" onmouseover="this.style.background='var(--brandGrad)'; this.style.transform='translateY(-50%) scale(1.1)';" onmouseout="this.style.background='rgba(0,174,239,0.25)'; this.style.transform='translateY(-50%) scale(1)';">◀</button>

      <!-- Foto HD Central Ampliada -->
      <img id="docImageLightboxImg" src="" style="max-width:85vw; max-height:80vh; border-radius:14px; box-shadow:0 12px 40px rgba(0,174,239,0.45); border:2px solid var(--cyan); object-fit:contain; transition:all 0.3s ease;">

      <!-- Seta Direita ▶ -->
      <button id="docImageLightboxNext" style="position:fixed; right:30px; top:50%; transform:translateY(-50%); cursor:pointer; color:#fff; font-size:2rem; background:rgba(0,174,239,0.25); border:1px solid var(--cyan); width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:100001; backdrop-filter:blur(6px); transition:all 0.2s ease; box-shadow:0 0 20px rgba(0,174,239,0.4);" onclick="window.navDocImageModal(1)" onmouseover="this.style.background='var(--brandGrad)'; this.style.transform='translateY(-50%) scale(1.1)';" onmouseout="this.style.background='rgba(0,174,239,0.25)'; this.style.transform='translateY(-50%) scale(1)';">▶</button>

      <!-- Rodapé Contador de Fotos -->
      <div id="docImageLightboxCounter" style="position:fixed; bottom:25px; background:rgba(10,15,30,0.85); border:1px solid rgba(0,174,239,0.4); padding:8px 22px; border-radius:20px; color:#fff; font-family:var(--uiRounded); font-weight:bold; font-size:0.95rem; box-shadow:0 4px 15px rgba(0,0,0,0.6); z-index:100001;"></div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeDocImageModal();
    });

    window.addEventListener('keydown', (e) => {
      if (modal.style.display !== 'none') {
        if (e.key === 'ArrowLeft') window.navDocImageModal(-1);
        if (e.key === 'ArrowRight') window.navDocImageModal(1);
      }
    });
  }

  window.updateDocImageModalView();
  modal.style.display = 'flex';
};

window.navDocImageModal = function(dir) {
  if (!window.currentDocModalImages || window.currentDocModalImages.length === 0) return;
  const total = window.currentDocModalImages.length;
  window.currentDocModalIndex = (window.currentDocModalIndex + dir + total) % total;
  window.updateDocImageModalView();
};

window.updateDocImageModalView = function() {
  const imgEl = document.getElementById('docImageLightboxImg');
  const counterEl = document.getElementById('docImageLightboxCounter');
  const images = window.currentDocModalImages || [];
  const idx = window.currentDocModalIndex || 0;

  if (imgEl && images[idx]) {
    imgEl.src = images[idx];
  }
  if (counterEl) {
    counterEl.innerHTML = `🖼️ Foto <span style="color:var(--cyan);">${idx + 1}</span> de <span style="color:var(--cyan);">${images.length}</span>`;
  }
};

window.closeDocImageModal = function() {
  const modal = document.getElementById('docImageLightboxModal');
  if (modal) modal.style.display = 'none';
};

// 📚 3. ABA BIBLIOTECA DE DOCUMENTÁRIOS CATALOGADOS
function renderLibraryHTML() {
  const docs = AppState.documentaries || [];

  if (docs.length === 0) {
    return `<div style="text-align: center; color: var(--ivTextSecondary); padding: 40px; font-size: 1.1rem;">Nenhum documentário catalogado ainda. Renderize um projeto para criar o primeiro registro (Doc 01)!</div>`;
  }

  let cards = docs.map(doc => {
    const docNumStr = String(doc.docId || doc.docFolder || '01').padStart(2, '0');
    const dateStr = doc.createdAt ? new Date(doc.createdAt).toLocaleString('pt-BR') : 'Data recente';
    const cTitles = (doc.campaignTitles || []).join(' + ');
    const imagesJson = JSON.stringify(doc.images || []).replace(/"/g, '&quot;');

    return `
      <article class="subjectCard" style="position:relative; width: 100%; display: flex; flex-direction: column; gap: 16px; padding: 24px;">
        
        <div style="position: absolute; top: 16px; left: 20px; width: 40px; height: 40px; background: var(--brandGrad); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--uiRounded); font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.5); color: #fff; z-index: 10; border: 2px solid rgba(255,255,255,0.2);">
          ${docNumStr}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-left: 50px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <div>
            <h3 style="color: #fff; margin: 0 0 4px 0; font-family: var(--uiRounded); font-size: 1.15rem;">
              ${cTitles}
            </h3>
            <span style="color: var(--ivTextSecondary); font-size: 0.78rem;">Catalogado em ${dateStr} • Pasta Local: render/documentarios/${docNumStr}/</span>
          </div>
        </div>

        <!-- PLAYER DE VÍDEO E GALERIA DE IMAGENS -->
        <div style="display: flex; gap: 20px; align-items: flex-start;">
          
          ${doc.videoUrl ? `
            <div style="width: 340px; flex-shrink: 0; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);">
              <video src="${doc.videoUrl}" controls style="width: 100%; display: block; aspect-ratio: 16/9;"></video>
            </div>
          ` : `<div style="width: 340px; height: 190px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3);">Sem Vídeo Renderizado</div>`}

          <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <strong style="color: #fff; font-size: 0.88rem;">🖼️ Imagens HD Catalogadas (${(doc.images || []).length} Fotos - Clique para Ampliar e Navegar):</strong>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; max-height: 190px; overflow-y: auto; padding-right: 4px;">
              ${(doc.images || []).map((imgUrl, imgIdx) => `
                <div style="aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); background: #000; cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" onclick="window.openDocImageModal(${imagesJson}, ${imgIdx})" onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='var(--cyan)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(255,255,255,0.15)';">
                  <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </article>
    `;
  }).join('');

  return `<div style="display: flex; flex-direction: column; gap: 24px; width: 100%; padding-bottom: 50px;">${cards}</div>`;
}
