window.openSocialMedia = async function() {
  const campaign = AppState.getSelectedCampaign();
  if (!campaign) {
    window.switchMultiverseRoom('socialMediaView', 'btnNavSocial');
    document.getElementById('socialMediaGrid').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;gap:20px;">
        <div style="font-size:3rem;">📋</div>
        <h2 style="color:#fff;font-family:var(--uiRounded);">Nenhuma Minissérie Selecionada</h2>
        <p style="color:var(--ivTextSecondary);max-width:400px;">Acesse a <strong>Biblioteca</strong> e selecione uma minissérie para ver o editorial.</p>
        <button class="actionBtn" style="background:var(--brandGrad);border:none;padding:14px 28px;font-weight:bold;" onclick="window.openLibraryRoom()">📚 Ir para a Biblioteca</button>
      </div>`;
    return;
  }
  if (!campaign.generatedGPT) {
    window.switchMultiverseRoom('socialMediaView', 'btnNavSocial');
    document.getElementById('socialMediaGrid').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;gap:20px;">
        <div style="font-size:3rem;">🔒</div>
        <h2 style="color:#fff;font-family:var(--uiRounded);">Minissérie não gerada</h2>
        <p style="color:var(--ivTextSecondary);max-width:400px;">A Minissérie <strong>#${String(campaign.number).padStart(2,'0')}</strong> ainda não tem conteúdo GPT gerado. Gere no Painel primeiro.</p>
        <button class="actionBtn" style="background:var(--brandGrad);border:none;padding:14px 28px;font-weight:bold;" onclick="window.switchMultiverseRoom('multiverseWelcome',null)">⬅ Voltar ao Painel</button>
      </div>`;
    return;
  }
  
  const campStr = String(campaign.number).padStart(2, '0');
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

  window.updateTopbarTitle(`Multiverso Editorial - Minissérie ${campStr}`, topicText);
  window.switchMultiverseRoom('socialMediaView', 'btnNavSocial');
  
  const grid = document.getElementById('socialMediaGrid');
  grid.innerHTML = '<div style="text-align: center; color: var(--ivTextSecondary); padding: 40px;">Carregando apresentação... 📡</div>';
  
  window.currentSocialGallerySlides = [];
  
  for (let i = 0; i < campaign.scenes.length; i++) {
    const s = campaign.scenes[i];
    let media = { image: null };
    
    try {
      const res = await fetch(`/api/social-media?campaign=${encodeURIComponent(campaign.number)}&scene=${s.no}`);
      if (res.ok) {
        media = await res.json();
      }
    } catch(e) {
      console.warn("Falha ao escanear mídia social da cena", s.no, e);
    }

    const hasImage = !!media.image;
    const displayImage = hasImage ? media.image : null;
    const sceneStr = String(s.no).padStart(2, '0');
    
    const textData = s.lines && s.lines.length > 0 ? s.lines.join('<br><br>').replace(/'/g, "\\'") : 'Nenhum contexto disponível.';
    const sceneTitle = s.title ? s.title : `CENA ${sceneStr}`;
    
    window.currentSocialGallerySlides.push({
      src: displayImage || '',
      title: sceneTitle,
      textContent: textData
    });
  }

  window.currentSocialIndex = 0;
  
  window.renderSocialSlide = function(index) {
    window.currentSocialIndex = index;
    const slide = window.currentSocialGallerySlides[index];
    if (!slide) return;
    const prevDisabled = index === 0 ? 'opacity: 0.3; pointer-events: none;' : '';
    const nextDisabled = index === window.currentSocialGallerySlides.length - 1 ? 'opacity: 0.3; pointer-events: none;' : '';

    grid.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: relative;">
        <!-- Navigation Arrow Prev -->
        <button style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); color: white; width: 52px; height: 52px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.3s ease; z-index: 10; ${prevDisabled}" onclick="window.renderSocialSlide(${index - 1})" onmouseover="this.style.background='var(--brandGrad)'; this.style.borderColor='transparent';" onmouseout="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.18)';">◀</button>
        
        <!-- Conteúdo Centralizado no Buraco Negro (Sem Película Escura, Sem Moldura) -->
        <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; max-width: 860px; height: 100%; background: transparent; border: none; margin: 0 auto; gap: 36px; padding: 0 40px; box-sizing: border-box;">
          <!-- Lado Esquerdo: Imagem 9:16 Compacta e Elegante -->
          <div style="width: 250px; height: 444px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: transparent; position: relative; cursor: zoom-in; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.6);" onclick="if('${slide.src}') window.openLightbox('${slide.src}')">
            ${slide.src ? 
              `<img src="${slide.src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
               <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.3); pointer-events: none;">🔍</div>` : 
              `<div style="text-align: center; color: rgba(255,255,255,0.4);"><div style="font-size: 3rem; margin-bottom: 12px;">📱</div>Sem Imagem</div>`
            }
          </div>
          
          <!-- Lado Direito: Texto/Contexto Direto sobre o Palco -->
          <div style="flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: center; background: transparent; border: none; cursor: default; min-width: 0;">
            <h2 style="color: var(--cyan); font-family: var(--uiRounded); font-size: 1.4rem; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1.5px; flex-shrink: 0;">${slide.title}</h2>
            <div style="color: #e2e8f0; font-size: 1.05rem; line-height: 1.65; font-family: var(--uiText); text-shadow: 0 2px 6px rgba(0,0,0,0.9); overflow-y: auto; max-height: 420px; padding-right: 12px;">
              ${slide.textContent}
            </div>
          </div>
        </div>

        <!-- Navigation Arrow Next -->
        <button style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); color: white; width: 52px; height: 52px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.3s ease; z-index: 10; ${nextDisabled}" onclick="window.renderSocialSlide(${index + 1})" onmouseover="this.style.background='var(--brandGrad)'; this.style.borderColor='transparent';" onmouseout="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.18)';">▶</button>
      </div>
    `;
  };

  window.renderSocialSlide(0);
};

window.closeSocialMedia = function() {
  document.getElementById('socialMediaView').style.display = 'none';
  document.getElementById('multiverseWelcome').style.display = 'flex';
  if (window.highlightActiveRoom) window.highlightActiveRoom(null);
};
