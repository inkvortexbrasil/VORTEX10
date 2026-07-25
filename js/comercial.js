// ==========================================
// MULTIVERSO COMERCIAL (CTA & ENGAJAMENTO)
// ==========================================

window.ctaDatabase = [];
window.selectedCtaId = null;

window.openComercialRoom = async function() {
  if (typeof window.switchMultiverseRoom === 'function') {
    window.switchMultiverseRoom('comercialView', 'btnNavComercial');
  } else {
    document.querySelectorAll('.vortexPage').forEach(p => p.style.display = 'none');
    const welcome = document.getElementById('multiverseWelcome');
    if (welcome) welcome.style.display = 'none';
    const view = document.getElementById('comercialView');
    if (view) view.style.display = 'flex';
  }

  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.innerText = 'Multiverso Comercial';
  const subEl = document.getElementById('topbarSubtitle');
  if (subEl) subEl.innerText = 'Banco de dados de chamadas comerciais, cartazes 9:16 e legendas de engajamento.';

  window.renderComercialRoom();
  await window.loadCtaDatabase();
};

window.loadCtaDatabase = async function() {
  try {
    const res = await fetch(`/api/cta/scan?_t=${Date.now()}`);
    if (res.ok) {
      window.ctaDatabase = await res.json();
    } else {
      throw new Error("Erro HTTP ao rastrear banco CTA");
    }
  } catch (e) {
    console.warn("Usando fallback de banco de dados CTA:", e);
    if (!window.ctaDatabase || window.ctaDatabase.length === 0) {
      window.ctaDatabase = [
        {
          "id": "cta_02",
          "numStr": "02",
          "numSeq": 2,
          "title": "[CTA 02] 🌌🎭 ESCOLHA O DESTINO DA PRÓXIMA MINISSÉRIE: VIAGEM INTERDIMENSIONAL DE TEMA! 🚀🔮",
          "subtitle": "Sua decisão molda o enredo e a trilha sonora da próxima jornada. Participe e desbloqueie recompensas cósmicas!",
          "category": "Engajamento & Interação",
          "aspectRatio": "9:16",
          "image": "/render/cta/02.png",
          "created_at": "2026-07-25T18:13:53.892Z",
          "textInImage": "SEU VOTO, NOSSO UNIVERSO",
          "imagePrompt": "Create a vertical 9:16 aspect ratio poster for ChatGPT DALL-E 3 set inside a futuristic biotech laboratory with neon biomoda elements, glowing DNA strands, and holographic fabric samples floating in zero gravity. At the center, design a glowing 3D neon typography text written in Portuguese: \"SEU VOTO, NOSSO UNIVERSO\". Ultra-detailed 8k resolution, photorealistic, cyberpunk-meets-biotech aesthetic.",
          "caption": "🌌🎭 **ESCOLHA O DESTINO DA PRÓXIMA MINISSÉRIE: VIAGEM INTERDIMENSIONAL DE TEMA!** 🚀🔮\n\n1️⃣ **COMENTE** sua trilha sonora favorita (ex: \"Trilha Épica de Fantasia\" ou \"Synthwave Futurista\").\n2️⃣ **VOTE** no tema da minissérie (ex: \"Reinos Mágicos\" ou \"Cidades Cyberpunk\").\n3️⃣ **MARQUE** 2 amigos para embarcar nessa jornada criativa!\n\n✨ **BÔNUS**: Os 5 votos mais engajados ganham um kit exclusivo de arte digital da InkVortex Brasil! ✨\n\n🔗 **Participe agora**: [Link da Bio do Mercado Livre]\n#InkVortexBrasil #EscolhaSuaTrilha #MinissérieInterdimensional #EngajamentoCósmico #ArteQueInspira"
        },
        {
          "id": "cta_01",
          "numStr": "01",
          "numSeq": 1,
          "title": "[CTA 01] 🔥 TRILHA SONORA DEDICADA PARA INSCRITOS & MINISSÉRIES 🎬🎧",
          "subtitle": "Chamada Interativa Oficial de Capa para Solicitação de Trilha Musical Customizada",
          "category": "Engajamento & Interação",
          "aspectRatio": "9:16",
          "image": "/render/cta/01.png",
          "created_at": "2026-07-25T13:50:00.000Z",
          "textInImage": "SUA TRILHA NA MINISSÉRIE",
          "imagePrompt": "Create a vertical 9:16 aspect ratio poster for ChatGPT DALL-E 3 set inside a high-tech Epson DTG/DTF printing studio with vibrant cyan neon lights. Center glowing 3D neon text: \"SUA TRILHA NA MINISSÉRIE\". Photorealistic 8k studio lighting.",
          "caption": "🔥 **SUA TRILHA SONORA EXCLUSIVA NA SUA MINISSÉRIE FAVORITA!**\n\nVocê já imaginou ter uma composição musical inédita, gravada especialmente para você com a marca InkVortex Brasil? 🎬🎧\n\nPara celebrar nossos inscritos e a paixão pela impressão de alta definição, liberamos uma experiência interativa inédita no Multiverso!\n\n👇 COMO SOLICITAR SUA TRILHA PERSONALIZADA (3 PASSOS SIMPLES):\n1️⃣ ESCOLHA A MINISSÉRIE: Digite nos comentários o número ou nome da sua minissérie favorita (ex: Minissérie 01 - DTG vs DTF).\n2️⃣ ESCOLHA O ESTILO MUSICAL: Diga o tom que você quer ouvir (Ex: Épico Cinemático, Synthwave, Rock, Lo-Fi...).\n3️⃣ DEIXE SEU NOME: Digite seu nome exato no comentário.\n\n🎁 O QUE VOCÊ RECEBERÁ:\nNossa engenharia neural vai compor a trilha sonora dedicada, e publicaremos um clipe MP4 legendado com a letra da música e uma saudação especial em seu nome!\n\n💬 Na InkVortex Brasil, conhecimento técnico e arte se transformam em experiências únicas.\n🛒 Insumos, peças e tintas oficiais na nossa loja do Mercado Livre: Link na Bio!\n#InkVortexBrasil #ImpressaoDigital #DTG #DTF #TrilhaSonora #Minisseries"
        }
      ];
    }
  }

  if (Array.isArray(window.ctaDatabase)) {
    window.ctaDatabase.sort((a, b) => {
      const numA = parseInt(a.numStr || String(a.id || '').replace(/\D/g, '') || 0, 10);
      const numB = parseInt(b.numStr || String(b.id || '').replace(/\D/g, '') || 0, 10);
      return numB - numA;
    });
    if (window.ctaDatabase.length > 0) {
      window.selectedCtaId = window.ctaDatabase[0].id;
    }
  }

  window.renderComercialRoom();
};

window.scanCtaWithAi = async function(btn) {
  if (btn) {
    btn.innerHTML = "⚡ LENDO IMAGENS (IA)...";
    btn.disabled = true;
  }
  await window.loadCtaDatabase();
  if (btn) {
    btn.innerHTML = "🔄 RASTREAR NOVAS CTAS (IA)";
    btn.disabled = false;
  }
};

window.generateNewCtaWithAi = async function(btn) {
  const inputEl = document.getElementById('inputCtaTopic');
  const topic = inputEl ? inputEl.value.trim() : '';

  const oldHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = "⚡ GERANDO CTA...";
    btn.disabled = true;
  }

  try {
    const res = await fetch('/api/cta/generate-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (res.ok) {
      const newItem = await res.json();
      window.ctaDatabase.unshift(newItem);
      window.selectedCtaId = newItem.id;
      if (inputEl) inputEl.value = '';
      window.renderComercialRoom();
    } else {
      const errData = await res.json();
      alert("Erro ao gerar CTA com IA: " + (errData.error || "Verifique a chave Mistral no Cofre de APIs."));
    }
  } catch(e) {
    alert("Falha na conexão com motor IA Mistral: " + e.message);
  } finally {
    if (btn) {
      btn.innerHTML = oldHtml;
      btn.disabled = false;
    }
  }
};

window.regenerateCtaCaptionWithAi = async function(ctaId, btn) {
  if (!ctaId) return;
  const oldHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = "🧠 LENDO TEXTO DA IMAGEM...";
    btn.disabled = true;
  }

  try {
    const res = await fetch('/api/cta/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ctaId })
    });

    if (res.ok) {
      const updatedItem = await res.json();
      const idx = window.ctaDatabase.findIndex(i => i.id === ctaId);
      if (idx !== -1) {
        window.ctaDatabase[idx] = updatedItem;
      }
      window.renderComercialRoom();
    } else {
      const errData = await res.json();
      alert("Erro ao ler imagem com IA: " + (errData.error || "Verifique a chave Mistral no Cofre de APIs."));
    }
  } catch(e) {
    alert("Falha na conexão com motor de visão IA: " + e.message);
  } finally {
    if (btn) {
      btn.innerHTML = oldHtml;
      btn.disabled = false;
    }
  }
};

window.renderComercialRoom = function() {
  const grid = document.getElementById('ctaGridList');
  const details = document.getElementById('ctaDetailsArea');
  if (!grid || !details) return;

  // 1. Renderiza lista de cartões CTA à esquerda
  grid.innerHTML = window.ctaDatabase.map(item => {
    const isSelected = item.id === window.selectedCtaId;
    const numDisplay = item.numStr || String(item.id || '').replace(/\D/g, '').padStart(2, '0') || '01';

    return `
      <article class="ctaCard" style="position:relative; background: ${isSelected ? 'rgba(0,174,239,0.15)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isSelected ? 'var(--cyan)' : 'rgba(255,255,255,0.15)'}; border-radius: 14px; padding: 14px; display: flex; gap: 14px; align-items: center; cursor: pointer; transition: all 0.2s ease; box-shadow: ${isSelected ? '0 0 20px rgba(0,174,239,0.35)' : 'none'}; margin-top: 6px;" onclick="window.selectCtaItem('${item.id}')">
        
        <!-- Bolinha Neon de Numeração da Biblioteca (01, 02, 03...) -->
        <div style="position: absolute; top: -8px; left: -8px; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #00aeef, #ec008c); color: #fff; font-weight: 900; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(0,174,239,0.9); z-index: 10; border: 2px solid #0d0d1e;">
          ${numDisplay}
        </div>

        <div style="position: relative; width: 75px; height: 110px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;">
          <img src="${item.image}" alt="${item.title}" onerror="this.onerror=null; this.src='/render/cta/01.jpg';" style="width: 100%; height: 100%; object-fit: cover;">
          <button style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; padding: 3px 6px; border-radius: 6px; font-size: 0.75rem; cursor: pointer;" title="Zoom Lupa" onclick="event.stopPropagation(); window.openCtaLightbox('${item.image}', '${item.title}')">🔍</button>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="background: rgba(0,174,239,0.2); color: var(--cyan); border: 1px solid rgba(0,174,239,0.4); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">CTA #${numDisplay}</span>
            <span style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">${item.aspectRatio || '9:16'}</span>
          </div>
          <h4 style="color: #fff; margin: 4px 0 2px; font-family: var(--uiRounded); font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 800; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">${item.title}</h4>
          <p style="color: rgba(255,255,255,0.75); font-size: 0.8rem; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.subtitle || ''}</p>
        </div>
      </article>
    `;
  }).join('');

  // 2. Renderiza os detalhes e legenda comercial à direita
  const current = window.ctaDatabase.find(i => i.id === window.selectedCtaId);
  if (!current) {
    details.innerHTML = `<div style="text-align:center; color:rgba(255,255,255,0.5); padding:40px;">Selecione uma campanha de CTA no banco de dados.</div>`;
    return;
  }

  details.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100%; box-sizing: border-box;">
      
      <!-- Cabeçalho da Campanha Comercial -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 12px; flex-shrink: 0;">
        <div>
          <span style="color: var(--cyan); font-size: 0.8rem; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">📢 LEGENDA COMERCIAL (CTA)</span>
          <h2 style="color: #fff; font-family: var(--uiRounded); margin: 4px 0 2px; font-size: 1.3rem; font-weight: 800; text-shadow: 0 2px 6px rgba(0,0,0,0.8);">${current.title}</h2>
          <span style="color: rgba(255,255,255,0.7); font-size: 0.82rem;">${current.subtitle}</span>
          ${current.textInImage ? `<div style="margin-top:6px;"><span style="background:rgba(0,174,239,0.15); color:var(--cyan); border:1px solid rgba(0,174,239,0.3); padding:3px 10px; border-radius:8px; font-size:0.75rem; font-weight:bold;">💬 Chamada na Arte: "${current.textInImage}"</span></div>` : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="actionBtn" style="background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; font-size: 0.82rem; font-weight: bold; border-radius: 8px; cursor: pointer;" onclick="window.openCtaLightbox('${current.image}', '${current.title}')">
            🔍 VER POSTER (LUPA)
          </button>
        </div>
      </div>

      <!-- Barra de Ações Unificada de 3 Botões (Gerar CTA + Copiar Legenda + Copiar Prompt) -->
      <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; flex-shrink: 0;">
        <button class="badge actionBtn" style="cursor: pointer; background: var(--brandGrad); color: #fff; border: none; padding: 9px 18px; font-size: 0.85rem; font-weight: bold; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 174, 239, 0.4); transition: all 0.2s ease;" onclick="window.generateNewCtaWithAi(this)">
          ✨ GERAR CTA (IA)
        </button>
        <button id="btnCopyCtaCaption" class="badge actionBtn" style="cursor: pointer; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.25); padding: 9px 18px; font-size: 0.85rem; font-weight: bold; border-radius: 10px; transition: all 0.2s ease;" onclick="window.copyCtaCaption('${current.id}', this)">
          📋 COPIAR LEGENDA
        </button>
        ${current.imagePrompt ? `
        <button id="btnCopyCtaPrompt" class="badge actionBtn" style="cursor: pointer; background: rgba(0,174,239,0.18); color: var(--cyan); border: 1px solid rgba(0,174,239,0.5); padding: 9px 18px; font-size: 0.85rem; font-weight: bold; border-radius: 10px; transition: all 0.2s ease;" onclick="window.copyCtaPrompt('${current.id}', this)">
          🎨 COPIAR PROMPT
        </button>` : ''}
      </div>

      <!-- Corpo da Legenda Rolável & Prompt ChatGPT -->
      <div style="flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;">
        ${current.imagePrompt ? `
        <div style="background: rgba(0, 174, 239, 0.05); border: 1px dashed rgba(0, 174, 239, 0.35); border-radius: 12px; padding: 12px 16px;">
          <div style="color: var(--cyan); font-size: 0.78rem; font-weight: bold; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>🎨 PROMPT EM INGLÊS PARA CHATGPT / DALL-E 3 (GERA A ARTE 9:16):</span>
            <span style="color: rgba(255,255,255,0.5);">Formato 9:16</span>
          </div>
          <pre style="color: #67e8f9; font-family: monospace; font-size: 0.82rem; line-height: 1.4; white-space: pre-wrap; margin: 0; user-select: all;">${current.imagePrompt}</pre>
        </div>` : ''}

        <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 16px;">
          <div style="color: rgba(255,255,255,0.6); font-size: 0.78rem; font-weight: bold; margin-bottom: 8px;">📝 LEGENDA INTERATIVA PARA REDES SOCIAIS:</div>
          <pre id="ctaCaptionText" style="color: #ffffff; font-family: var(--readingFont, 'Inter', sans-serif); font-size: 0.92rem; line-height: 1.6; white-space: pre-wrap; margin: 0; text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${current.caption}</pre>
        </div>
      </div>
    </div>
  `;
};

window.selectCtaItem = function(id) {
  window.selectedCtaId = id;
  window.renderComercialRoom();
};

window.copyCtaCaption = function(id, btn) {
  const item = window.ctaDatabase.find(i => i.id === id);
  if (!item) return;

  navigator.clipboard.writeText(item.caption).then(() => {
    const oldText = btn.innerHTML;
    btn.innerHTML = "✓ LEGENDA COPIADA!";
    btn.style.background = "#00d26a";
    btn.style.color = "#000";
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = "var(--brandGrad)";
      btn.style.color = "#fff";
    }, 2000);
  });
};

window.copyCtaPrompt = function(id, btn) {
  const item = window.ctaDatabase.find(i => i.id === id);
  if (!item || !item.imagePrompt) return;

  navigator.clipboard.writeText(item.imagePrompt).then(() => {
    const oldText = btn.innerHTML;
    btn.innerHTML = "✓ PROMPT COPIADO (DALL-E)!";
    btn.style.background = "#00d26a";
    btn.style.color = "#000";
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = "rgba(0,174,239,0.2)";
      btn.style.color = "var(--cyan)";
    }, 2000);
  });
};

window.openCtaLightbox = function(imgUrl, title) {
  let modal = document.getElementById('ctaLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ctaLightboxModal';
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 100010; background: rgba(0,0,0,0.92); backdrop-filter: blur(12px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (modal.style.display !== 'none') {
          modal.style.display = 'none';
        }
      }
    });
  }

  modal.innerHTML = `
    <!-- Botão Fechar ✕ posicionado em top: 80px; right: 35px (Abaixo da Topbar, 100% livre e clicável) -->
    <button onclick="document.getElementById('ctaLightboxModal').style.display='none'" style="position: fixed; top: 80px; right: 35px; background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.35); border-radius: 50%; width: 50px; height: 50px; font-size: 1.6rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 100020; backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(0,0,0,0.6); transition: all 0.2s ease;" onmouseover="this.style.background='var(--brandGrad)'; this.style.borderColor='transparent';" onmouseout="this.style.background='rgba(255,255,255,0.18)'; this.style.borderColor='rgba(255,255,255,0.35)';">✕</button>

    <div style="max-height: 85vh; max-width: 90vw; display: flex; flex-direction: column; align-items: center; z-index: 100015;" onclick="event.stopPropagation()">
      <h3 style="color: #fff; font-family: var(--uiRounded); margin-bottom: 12px; font-size: 1.3rem; text-shadow: 0 2px 10px rgba(0,0,0,0.8);">${title}</h3>
      <img src="${imgUrl}" alt="${title}" onerror="this.onerror=null; this.src='/render/cta/01.jpg';" style="max-height: 75vh; max-width: 85vw; border-radius: 14px; border: 2px solid var(--cyan); box-shadow: 0 10px 40px rgba(0,174,239,0.45); object-fit: contain;">
    </div>
  `;
  modal.style.display = 'flex';
};
