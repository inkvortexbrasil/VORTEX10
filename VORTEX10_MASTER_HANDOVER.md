# 🌌 INKVORTEX BRASIL 10.0 — DOSSIÊ MESTRE DE CONTINUIDADE & DIREÇÃO AI

> **INSTRUÇÃO COMPULSÓRIA PARA O AGENTE AI ANTIGRAVITY / DIRETOR**:
> Ao receber a mensagem mestre no novo chat, **LEIA ESTE ARQUIVO EM `f:\VORTEX10\VORTEX10_MASTER_HANDOVER.md` E ASSUMA IMEDIATAMENTE A IDENTIDADE DO DIRETOR GERAL DE ENGENHARIA E ARQUITETURA DO VORTEX 10.0!**

---

## 📌 1. IDENTIDADE E DIRETRIZES FUNDAMENTAIS
- **Nome da Aplicação**: InkVortex Brasil (Plataforma Multiverso Editorial & Audiovisual).
- **Versão Atual Oficial**: **VORTEX 10.0** (Substitui completamente VORTEX 9, 8 e versões anteriores).
- **Diretório Raiz Oficial (Único & Obrigatório)**: `f:\VORTEX10`
- **Repositório GitHub Oficial**: `https://github.com/inkvortexbrasil/VORTEX10`
- **Servidor Backend / API**: `node f:\VORTEX10\api-server\server.js` ou `f:\VORTEX10\iniciar-central.bat` (Porta `8787`).
- **Endereço Local da Central**: `http://localhost:8787/index.html`

---

## 🎨 2. PADRÕES DE DESIGN & REGRAS VISUAIS CRÍTICAS CUMPRIDAS
- **Abas da Sidebar (Esquerda)**: 100% transparentes e cristalinas (FUNDO TOTALMENTE TRANSPARENTE, `backdrop-filter: none !important;`, `background: transparent !important;`, sem nenhum efeito de embaçado/blur).
- **Barra de Ações do Multiverso Comercial (Coluna Direita)**: Barra unificada de 3 botões horizontais com textos curtos e elegantes:
  1. `✨ GERAR CTA (IA)`
  2. `📋 COPIAR LEGENDA`
  3. `🎨 COPIAR PROMPT`
- **Layout de Centralização das Salas**:
  - Largura da Sidebar: 354px.
  - As salas (`multiverseWelcome`, `multiverseComercial`, `multiverseDocumentarios`, `multiverseAudio`, etc.) usam posicionamento fixo centralizado com margem segura:
    `position: fixed; left: calc(354px + (100vw - 354px) / 2); transform: translateX(-50%); top: 148px; bottom: 25px; width: calc(100vw - 420px); max-width: 1200px;`

---

## 🎬 3. BANCO DE DADOS & MULTIVERSO COMERCIAL (CTA)
- **Banco de Dados Oficial CTA**: `f:\VORTEX10\render\cta\cta_database.json`
- **Regra de Exibição Comercial**: As campanhas CTA são exibidas e ordenadas obrigatoriamente por **ORDEM DECRESCENTE DE ID / NUMERAÇÃO** (`04`, `03`, `02`, `01`).
- **Sistema de Identificação Visual (Bolinhas)**: As campanhas na galeria possuem indicadores numéricos padronizados (`01`, `02`, `03`, `04`).
- **Padrão Único de Imagem**: Somente imagens em formato **PNG** são utilizadas (`01.png`, `02.png`, `03.png`, `04.png`). Imagens JPG duplicadas foram eliminadas.
- **Localização dos Renders CTA Video**: As imagens e mídias do render de vídeo ficam guardadas em `f:\VORTEX10\render\cta_video\`.

---

## 💾 4. PERSISTÊNCIA & BACKUP MESTRE
- **Arquivo de Backup Mestre na Raiz**: `f:\VORTEX10\VORTEX10-BACKUP-OFICIAL-2026-07-25.json`
- **Local Storage Key**: `vortex10_state` (com leitura retrocompatível automática de `vortex9_state` e `vortex8_state`).
- **Motor de Backup Mestre**: `btnExport` e `inputImport` em `js/app.js` exportam e importam todas as 7 salas dos Multiversos (`ctaDatabase`, `documentariosDatabase`, `audioDatabase`, `editorialDatabase`, `shortsDatabase`, `campaigns`, `suggestedSubjects`).

---

## 🛠️ 5. COMANDOS ÚTEIS PARA O AGENTE NO NOVO CHAT
- **Iniciar/Reiniciar Servidor**:
  `Get-Process node | Stop-Process -Force; node f:\VORTEX10\api-server\server.js`
- **Verificar Sintaxe de Todos os Módulos**:
  `node --check f:\VORTEX10\api-server\server.js f:\VORTEX10\js\*.js`
- **Sincronizar Repositório GitHub**:
  `node f:\VORTEX10\upload_vortex10_github.js`

---

## 👑 6. MENSAGEM DO DIRETOR PARA A PRÓXIMA SESSÃO
O ambiente `f:\VORTEX10` está 100% operacional, limpo, sincronizado com o GitHub e pronto para receber novos desenvolvimentos e expansões com performance máxima!
