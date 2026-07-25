window.openFlowRoom = async function() {
  const campaign = AppState.getSelectedCampaign();
  if (!campaign) {
    alert('Por favor, volte na Biblioteca e selecione uma minissérie antes de entrar na Sala do Flow.');
    return;
  }
  
  const numDisplay = String(campaign.number).padStart(2, '0');
  const titleStr = `Multiverso Audiovisual - Minissérie ${numDisplay}`;
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
  window.switchMultiverseRoom('flowRoomView', 'btnNavFlow');
  
  const grid = document.getElementById('flowRoomGrid');
  grid.style.display = 'block';
  grid.innerHTML = '<div style="text-align: center; color: var(--ivTextSecondary); padding: 40px;">Buscando vídeos e roteiro... 🌊</div>';

  try {
    const res = await fetch(`/api/storyboard-media?campaign=${encodeURIComponent(campaign.number)}&scene=1&_t=${Date.now()}`);
    const data = await res.json();
    
    let generatedText = campaign.flow && campaign.flow.prompt ? campaign.flow.prompt : "Roteiro cinemático ainda não foi gerado. Rode a etapa no painel Pulsante.";
    
    let cutIdx = generatedText.indexOf("cinematic stingers.");
    if (cutIdx !== -1) {
        generatedText = generatedText.substring(cutIdx + "cinematic stingers.".length).trim();
    } else {
        cutIdx = generatedText.indexOf("throughout the motion.");
        if (cutIdx !== -1) {
            generatedText = generatedText.substring(cutIdx + "throughout the motion.".length).trim();
        }
    }
    
    const flowPrompt = generatedText;

    window.currentFlowData = {
      masterVideo: data.masterVideo,
      finalVideo: data.finalVideo,
      availableFinalVideos: data.availableFinalVideos || [],
      prompt: flowPrompt,
      campaignNumber: campaign.number,
      campaignId: campaign.id,
      availableMp3s: data.availableMp3s || [],
      socialCaption: (campaign.social && campaign.social.caption) ? campaign.social.caption : (campaign.socialCaption || ''),
      title: campaign.topic && campaign.topic.title ? campaign.topic.title : campaign.title,
      selectedMp3: (window.currentFlowData && window.currentFlowData.selectedMp3) ? window.currentFlowData.selectedMp3 : (data.availableMp3s && data.availableMp3s.length > 0 ? data.availableMp3s[0] : null),
      selectedFinalVideo: (window.currentFlowData && window.currentFlowData.selectedFinalVideo) ? window.currentFlowData.selectedFinalVideo : (data.availableFinalVideos && data.availableFinalVideos.length > 0 ? data.availableFinalVideos[0] : data.finalVideo)
    };

    window.renderFlowTab = function(tabName) {
      window.currentFlowTab = tabName;
      const d = window.currentFlowData;
      const isRenderingSingle = window.isRenderingSerie && window.isRenderingSerie[d.campaignId];
      const isRenderingAll = window.isRenderingTodos && window.isRenderingTodos[d.campaignId];
      const isRendering = isRenderingSingle || isRenderingAll;
      
      let html = `
        <style>
          @keyframes renderBtnPulse {
            0% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 5px rgba(232,0,109,0.3)); }
            50% { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 0 20px rgba(232,0,109,0.8)); }
            100% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 5px rgba(232,0,109,0.3)); }
          }
          @keyframes spinGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseGlow {
            0% { transform: scale(0.9); opacity: 0.4; }
            100% { transform: scale(1.1); opacity: 0.8; }
          }
          @keyframes pulseHeart {
            0% { transform: scale(0.9); text-shadow: 0 0 10px rgba(0,174,239,0.4); }
            100% { transform: scale(1.1); text-shadow: 0 0 30px rgba(0,174,239,0.9); }
          }
          #flowMp3Selector option, #finalVideoSelector option {
            background: #1a1a2e;
            color: #fff;
          }
        </style>
        
        <!-- Barra Superior de Controle de Voz e Abas (Top 95px Fixo, Largura 680px Cristalina) -->
        <div style="position: fixed; left: 50vw; transform: translateX(-50%); top: 95px; width: 680px; z-index: 100; height: 44px; display: flex; align-items: center; justify-content: space-between; background: transparent; border: none; padding: 0; box-shadow: none;">
          
          <!-- Seção Esquerda: Abas Principais -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="actionBtn" style="padding:6px 12px;border-radius:6px;font-weight:bold;font-size:0.78rem;border:1px solid rgba(255,255,255,0.15);transition:all 0.2s ease;${tabName === 'cru' ? 'background:var(--brandGrad);color:#fff;' : 'background:transparent;color:var(--ivTextSecondary);'}" onclick="window.renderFlowTab('cru')">🚧 Obra em Construção</button>
            <button class="actionBtn" style="padding:6px 12px;border-radius:6px;font-weight:bold;font-size:0.78rem;border:1px solid rgba(255,255,255,0.15);transition:all 0.2s ease;${tabName === 'final' ? 'background:var(--brandGrad);color:#fff;' : 'background:transparent;color:var(--ivTextSecondary);'}" onclick="window.renderFlowTab('final')">🎬 Obra Finalizada</button>
            <button class="actionBtn" style="padding:6px 12px;border-radius:6px;font-weight:bold;font-size:0.78rem;border:1px solid rgba(255,255,255,0.15);transition:all 0.2s ease;${tabName === 'legenda' ? 'background:var(--brandGrad);color:#fff;' : 'background:transparent;color:var(--ivTextSecondary);'}" onclick="window.renderFlowTab('legenda')">📝 Legenda</button>
          </div>

          <!-- Separador Vertical -->
          <div style="width: 1px; height: 22px; background: rgba(255,255,255,0.15); margin: 0 4px;"></div>

          <!-- Seção Direita: Controles de Voz e Renderização -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <div style="display:flex;flex-direction:row;gap:6px;align-items:center;background:rgba(255,255,255,0.05);padding:3px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);">
                <label style="font-size:0.65rem;color:var(--ivTextSecondary);text-transform:uppercase;letter-spacing:1px;white-space:nowrap;">VOZ / TRILHA BASE:</label>
                <select id="flowMp3Selector" onchange="window.currentFlowData.selectedMp3 = this.value; if(window.currentFlowTab === 'legenda') window.renderFlowTab('legenda');" style="background:rgba(0,0,0,0.5);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:4px;padding:2px 6px;font-family:var(--readingFont);outline:none;cursor:pointer;max-width:150px;font-size:0.78rem;">
                  ${d.availableMp3s && d.availableMp3s.length > 0 ? 
                      d.availableMp3s.map(mp3 => `<option value="${mp3}" ${mp3 === d.selectedMp3 ? 'selected' : ''}>${mp3.replace('.mp3','')}</option>`).join('') : 
                      '<option value="">Automático</option>'}
                </select>
            </div>
            
            <button id="btnRenderizarSerie" class="actionBtn" style="padding:6px 10px;border-radius:6px;font-weight:bold;font-size:0.78rem;border:1px solid rgba(255,255,255,0.15);transition:all 0.2s ease;${isRenderingSingle ? 'background:var(--brandGrad);color:#fff;opacity:0.8;pointer-events:none;animation:renderBtnPulse 1.5s infinite;' : (isRenderingAll ? 'background:rgba(255,255,255,0.1);color:#888;pointer-events:none;' : 'background:rgba(255,255,255,0.08);color:#fff;')}" onclick="window.startRenderizarSerie(this)">${isRenderingSingle ? '⏳ Renderizando...' : '⚡ Renderizar Vídeo'}</button>

            <button id="btnRenderizarTodos" class="actionBtn" style="padding:6px 10px;border-radius:6px;font-weight:bold;font-size:0.78rem;border:1px solid rgba(255,255,255,0.15);transition:all 0.2s ease;${isRenderingAll ? 'background:var(--brandGrad);color:#fff;opacity:0.8;pointer-events:none;animation:renderBtnPulse 1.5s infinite;' : (isRenderingSingle ? 'background:rgba(255,255,255,0.1);color:#888;pointer-events:none;' : 'background:rgba(255,255,255,0.08);color:#fff;')}" onclick="window.startRenderizarTodos(this)">✨ Renderizar Todos</button>
          </div>

        </div>
      `;

      if (tabName === 'cru') {
        if (isRendering) {
          html += `
            <div id="flowContentGrid" style="position: fixed; left: 50vw; transform: translateX(-50%); top: 148px; bottom: 25px; width: 680px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); z-index: 60;">
              <div style="display: flex; gap: 40px; align-items: center; margin-bottom: 40px; transform: scale(0.8);">
                <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; z-index:1;">
                  <div style="position:absolute; inset:0; border-radius:50%; border:2px dashed var(--cyan); animation: spinGlow 4s linear infinite;"></div>
                  <div style="position:absolute; inset:-10px; border-radius:50%; border:1px solid rgba(0, 174, 239, 0.2); animation: spinGlow 8s linear reverse infinite;"></div>
                  <div style="position:absolute; inset:10px; border-radius:50%; background:var(--cyan); opacity:0.3; filter:blur(10px); animation: pulseGlow 2s ease-in-out infinite;"></div>
                  <div style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(0,174,239,0.8));">🎥</div>
                </div>
                
                <div style="position:relative; width:150px; height:150px; display:flex; align-items:center; justify-content:center; transform: translateY(-20px); z-index:2;">
                  <div style="position:absolute; inset:0; border-radius:50%; border:4px solid transparent; border-top-color: var(--brand); border-bottom-color: var(--cyan); animation: spinGlow 1.5s linear infinite;"></div>
                  <div style="position:absolute; inset:-15px; border-radius:50%; border:2px dashed rgba(255,255,255,0.1); animation: spinGlow 6s linear reverse infinite;"></div>
                  <div style="position:absolute; inset:15px; border-radius:50%; border:1px solid rgba(255, 255, 255, 0.15); animation: spinGlow 3s linear infinite;"></div>
                  <div style="position:absolute; inset:25px; border-radius:50%; background:var(--brandGrad); opacity:0.6; filter:blur(20px); animation: pulseGlow 1.5s ease-in-out infinite alternate;"></div>
                  <div style="font-size: 4rem; animation: pulseHeart 1.5s ease-in-out infinite alternate; z-index: 3;">⚡</div>
                </div>

                <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; z-index:1;">
                  <div style="position:absolute; inset:0; border-radius:50%; border:2px dashed var(--magenta); animation: spinGlow 4s linear infinite reverse;"></div>
                  <div style="position:absolute; inset:-10px; border-radius:50%; border:1px solid rgba(232, 0, 109, 0.2); animation: spinGlow 8s linear infinite;"></div>
                  <div style="position:absolute; inset:10px; border-radius:50%; background:var(--magenta); opacity:0.3; filter:blur(10px); animation: pulseGlow 2s ease-in-out infinite 0.5s;"></div>
                  <div style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(232,0,109,0.8));">🎵</div>
                </div>
              </div>

              <h2 style="font-family: var(--uiRounded); font-size: 2rem; color: #fff; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 30px rgba(232,0,109,0.5); text-align: center;">
                SÍNTESE MULTIVERSAL
              </h2>
              
              <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); padding: 8px 24px; border-radius: 50px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                <div style="width: 10px; height: 10px; background: #00d26a; border-radius: 50%; box-shadow: 0 0 10px #00d26a; animation: pulseGlow 1s infinite;"></div>
                <span id="renderStatusText" style="color: #00d26a; font-family: 'Courier New', monospace; font-size: 0.95rem; font-weight: bold; letter-spacing: 1px;">STATUS: MOTOR FFMPEG ATIVO...</span>
              </div>
            </div>
          `;
        } else {
          html += `
            <div id="flowContentGrid" style="position: fixed; left: calc(354px + (100vw - 354px) / 2); transform: translateX(-50%); top: 148px; bottom: 25px; width: calc(100vw - 420px); max-width: 1200px; display: flex; gap: 24px; z-index: 60; pointer-events: auto;">

              <!-- ZONA ESQUERDA: Player / Variações 9:16 (Largura 280px, sem sobrepor a barra lateral) -->
              <div style="width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px;">
                ${d.masterVideo
                    ? `<video src="${d.masterVideo}" controls loop style="width:100%; max-height:calc(100vh - 200px); border-radius:12px; display:block; background:#000; box-shadow:0 8px 30px rgba(0,0,0,0.8); border: 1px solid rgba(0,174,239,0.3); object-fit: contain;"></video>`
                    : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px 12px;text-align:center;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.12);border-radius:10px;min-height:200px;"><span style="font-size:2rem;">🎥</span><p style="color:rgba(255,255,255,0.55);margin:0;font-size:0.75rem;line-height:1.4;">Salve como<br><strong>master.mp4</strong><br>em render/${String(d.campaignNumber).padStart(2,'0')}/flow/</p></div>`
                }
              </div>

              <!-- ZONA DIREITA: Direção de Fotografia (Roteiro Master Cinemático com Scroll) -->
              <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px;">
                
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                  <h3 style="color:var(--cyan);font-family:var(--uiRounded);margin:0;font-size:1.05rem;letter-spacing:1px;">Direção de Fotografia (Veo)</h3>
                  <button class="actionBtn" style="background:rgba(0,174,239,0.15);color:var(--cyan);border:1px solid rgba(0,174,239,0.4);padding:5px 12px;font-size:0.78rem;font-weight:bold;border-radius:6px;cursor:pointer;" onclick="window.generateFlowMaster('${d.campaignId}', this)">🔄 REGENERAR FLOW</button>
                </div>

                <div style="background: transparent; border: none; border-radius: 12px; padding: 10px 0; flex: 1; overflow-y: auto; min-height: 0;">
                  ${(!d.prompt || d.prompt.includes('ainda não foi gerado')) ? `
                    <div style="padding:24px 12px;text-align:center;background:rgba(0,0,0,0.3);border:1px dashed rgba(255,255,255,0.15);border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:12px;">
                      <p style="color:rgba(255,255,255,0.6);margin:0;font-size:0.85rem;line-height:1.5;">O roteiro master cinemático ainda não foi gerado para esta minissérie.</p>
                      <button class="actionBtn" style="background:var(--brandGrad);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;font-size:0.85rem;cursor:pointer;box-shadow:0 4px 15px rgba(0,174,239,0.3);" onclick="window.generateFlowMaster('${d.campaignId}', this)">🌊 GERAR ROTEIRO FLOW (MISTRAL LARGE)</button>
                    </div>
                  ` : `
                    <pre style="white-space:pre-wrap;font-family:var(--readingFont,'Inter',sans-serif);color:#e0e0e0;font-size:var(--readingFontSize,0.95rem);line-height:1.6;margin:0;padding-bottom:30px;">${d.prompt}</pre>
                  `}
                </div>

              </div>

            </div>
          `;
        }
      } else if (tabName === 'final') {
        let displayVideo = d.selectedFinalVideo || d.finalVideo;
        html += `
          <div id="flowContentGrid" style="position: fixed; left: calc(354px + (100vw - 354px) / 2); transform: translateX(-50%); top: 148px; bottom: 25px; width: calc(100vw - 420px); max-width: 1200px; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 60; pointer-events: auto;">
        `;
        if (d.availableFinalVideos && d.availableFinalVideos.length > 0) {
            html += `
            <div style="margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(0,0,0,0.5); padding: 6px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.18);">
                <label style="font-size: 0.78rem; color: var(--cyan); font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">VERSÃO DO VÍDEO FINAL:</label>
                <select id="finalVideoSelector" onchange="window.currentFlowData.selectedFinalVideo = this.value; document.getElementById('finalPlayer').src = this.value; document.getElementById('finalPlayer').play();" style="background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 6px; padding: 4px 12px; outline: none; font-family: var(--readingFont); font-weight: bold; cursor: pointer; font-size: 0.82rem;">
                  ${d.availableFinalVideos.map(vid => {
                      const name = vid.split('/').pop().replace('.mp4', '');
                      return `<option value="${vid}" ${vid === d.selectedFinalVideo ? 'selected' : ''}>${name}</option>`;
                  }).join('')}
                </select>
            </div>
            `;
        }
        
        html += `
            <div style="width: 100%; max-width: 680px; flex: 1; background: #000; border-radius: 12px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: 0 15px 40px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.12);">
              ${displayVideo ? 
                `<video id="finalPlayer" src="${displayVideo}" controls style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px; background: #000;"></video>` : 
                `<div style="padding: 32px; text-align: center; color: rgba(255,255,255,0.5);">
                   <p style="margin: 0; font-size: 1rem; line-height: 1.6;">Nenhum vídeo finalizado encontrado.<br>Renderize um ou mais vídeos na aba <strong>Obra em Construção</strong>.</p>
                 </div>`
              }
            </div>
          </div>
        `;
      } else if (tabName === 'legenda') {
         const versionStr = d.selectedMp3 ? d.selectedMp3.replace('.mp3','').replace(/^\d{2}\s*-\s*/, '') : 'Padrão';
         let fullText = "Legenda social não foi gerada para esta minissérie.";
         if (d.socialCaption) {
             const lines = d.socialCaption.split('\n');
             lines.splice(1, 0, `Versão: ${versionStr}`);
             fullText = lines.join('\n');
         }
         
         window.copyFlowCaption = function() {
            navigator.clipboard.writeText(fullText).then(() => {
                const btn = document.getElementById('btnCopyFlowCaption');
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
         
         html += `
           <div id="flowContentGrid" style="position: fixed; left: calc(354px + (100vw - 354px) / 2); transform: translateX(-50%); top: 148px; bottom: 25px; width: calc(100vw - 420px); max-width: 1200px; display: flex; flex-direction: column; gap: 10px; z-index: 60; pointer-events: auto;">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                 <h3 style="color: var(--cyan); margin: 0; font-family: var(--uiRounded); font-size: 1.05rem; letter-spacing: 0.5px;">Legenda para Redes Sociais</h3>
                 <button id="btnCopyFlowCaption" onclick="window.copyFlowCaption()" class="actionBtn" style="padding: 6px 14px; border-radius: 6px; background: var(--brandGrad); color: #fff; font-weight: bold; border: none; cursor: pointer; font-size: 0.8rem;">📋 Copiar Legenda</button>
             </div>
             <div style="background: transparent; border: none; padding: 10px 0; flex: 1; overflow-y: auto;">
               <textarea readonly style="width: 100%; height: 100%; background: transparent; color: #fff; border: none; outline: none; font-family: var(--readingFont); resize: none; font-size: 0.95rem; line-height: 1.6;">${fullText}</textarea>
             </div>
           </div>
         `;
      }

      grid.innerHTML = html;

      setTimeout(() => {
        const contentGrid = document.getElementById('flowContentGrid');
        if (contentGrid) {
          const rect = contentGrid.getBoundingClientRect();
          const exactHeight = window.innerHeight - rect.top - 40;
          contentGrid.style.height = Math.max(200, exactHeight) + 'px';
        }
      }, 50);
    };

    window.renderFlowTab('cru');

  } catch (err) {
    grid.innerHTML = `<div style="color: #ff4d4d; padding: 20px; text-align: center;">Erro: ${err.message}</div>`;
  }
};

window.closeFlowRoom = function() {
  document.getElementById('flowRoomView').style.display = 'none';
  document.getElementById('multiverseWelcome').style.display = 'flex';
  if (window.highlightActiveRoom) window.highlightActiveRoom(null);
};

window.startRenderizarSerie = async function(btn) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) return;

  if (!confirm("Você quer renderizar mesmo?\nEste processo exigirá bastante do processamento do seu computador.")) {
    return;
  }

  if (!window.isRenderingSerie) window.isRenderingSerie = {};
  if (window.isRenderingSerie[campaign.id]) return;

  window.isRenderingSerie[campaign.id] = true;
  
  if (btn) {
    btn.innerText = "⏳ Renderizando...";
    btn.style.background = "var(--brandGrad)";
    btn.style.opacity = '0.8';
    btn.style.pointerEvents = 'none';
    btn.style.animation = 'renderBtnPulse 1.5s infinite';
  }

  const soundtrackFile = window.currentFlowData.selectedMp3;

  window.renderFlowTab('cru');

  try {
    const res = await fetch('/api/render-multiverso/assemble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        campaignId: campaign.number,
        soundtrackFile: soundtrackFile
      })
    });
    
    const data = await res.json();
    if (!res.ok || !data.ok) {
      const errs = data.missing ? '\nFaltam os arquivos:\n- ' + data.missing.join('\n- ') : '';
      throw new Error((data.error || 'Erro na renderização') + errs);
    }

    window.isRenderingSerie[campaign.id] = false;
    
    try {
      const refreshRes = await fetch(`/api/shorts/flow?campaign=${encodeURIComponent(campaign.number)}`);
      if (refreshRes.ok) {
        window.lastFlowData = await refreshRes.json();
      }
    } catch(e) {
      console.error("Erro ao atualizar dados:", e);
    }

    window.renderFlowTab('final');

    setTimeout(() => {
      const videoEl = document.querySelector('#flowContentGrid video');
      if (videoEl) {
        videoEl.play().catch(e => console.log('Auto-play preventivo do navegador bloqueado:', e));
      }
    }, 500);

  } catch(err) {
    window.isRenderingSerie[campaign.id] = false;
    alert('Erro: ' + err.message);
    window.renderFlowTab('cru');
  }
};

window.startRenderizarTodos = async function(btn) {
  const campaign = AppState.getSelectedCampaign();
  if(!campaign) return;

  const d = window.currentFlowData;
  if (!d.availableMp3s || d.availableMp3s.length === 0) {
     alert("Nenhuma faixa de áudio encontrada para renderizar.");
     return;
  }

  if (!confirm(`Você quer renderizar TODOS os ${d.availableMp3s.length} vídeos em sequência?\nEste processo exigirá bastante do processamento.`)) {
    return;
  }

  if (!window.isRenderingTodos) window.isRenderingTodos = {};
  if (window.isRenderingTodos[campaign.id] || (window.isRenderingSerie && window.isRenderingSerie[campaign.id])) return;

  window.isRenderingTodos[campaign.id] = true;
  window.renderFlowTab('cru');

  try {
    for (let i = 0; i < d.availableMp3s.length; i++) {
        const mp3 = d.availableMp3s[i];
        window.currentFlowData.selectedMp3 = mp3;
        
        const statusEl = document.getElementById('renderStatusText');
        if (statusEl) statusEl.innerText = `STATUS: FFMPEG ATIVO... (${i+1}/${d.availableMp3s.length}: ${mp3.replace('.mp3','')})`;

        const res = await fetch('/api/render-multiverso/assemble', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            campaignId: campaign.number,
            soundtrackFile: mp3
          })
        });
        
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Erro na renderização');
        }
        
        if (data.finalVideoUrl) {
           if (!window.currentFlowData.availableFinalVideos) window.currentFlowData.availableFinalVideos = [];
           if (!window.currentFlowData.availableFinalVideos.includes(data.finalVideoUrl)) {
               window.currentFlowData.availableFinalVideos.unshift(data.finalVideoUrl);
           }
           window.currentFlowData.selectedFinalVideo = data.finalVideoUrl;
        }
    }

    window.isRenderingTodos[campaign.id] = false;
    
    try {
      const refreshRes = await fetch(`/api/shorts/flow?campaign=${encodeURIComponent(campaign.number)}`);
      if (refreshRes.ok) {
        window.lastFlowData = await refreshRes.json();
      }
    } catch(e) {}

    window.renderFlowTab('final');

  } catch(err) {
    window.isRenderingTodos[campaign.id] = false;
    alert('Erro: ' + err.message);
    window.renderFlowTab('cru');
  }
};
