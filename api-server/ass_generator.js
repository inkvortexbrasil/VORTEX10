/**
 * Gerador de Arquivos .ass (Advanced SubStation Alpha)
 * Cria legendas dinâmicas estilo TikTok a partir do JSON da Mistral.
 */

function generateTikTokAssScript(transcriptData) {
    // Mistral returns words inside the 'segments' array when timestamp_granularities=word is requested
    const rawWords = transcriptData.words || transcriptData.segments;
    
    if (!rawWords || rawWords.length === 0) {
        throw new Error("O áudio não retornou palavras detectáveis.");
    }

    // Como o corte inicial foi desativado, mantemos os tempos absolutos originais
    const words = rawWords.map(w => ({
        word: (w.word || w.text).trim(),
        start: Math.max(0, w.start),
        end: Math.max(0, w.end)
    })).filter(w => w.word.length > 0);

    // Dicionário de Correção Ortográfica e Termos Técnicos PT-BR (InkVortex / Têxtil / Gramática)
    const PT_BR_CORRECTIONS = {
        'algodao': 'algodão',
        'impressao': 'impressão',
        'impressora': 'impressora',
        'impressoras': 'impressoras',
        'tecnica': 'técnica',
        'tecnico': 'técnico',
        'tecnicos': 'técnicos',
        'polimero': 'polímero',
        'polimeros': 'polímeros',
        'sublimacao': 'sublimação',
        'producao': 'produção',
        'atencao': 'atenção',
        'evolucao': 'evolução',
        'revolucao': 'revolução',
        'solucao': 'solução',
        'edicao': 'edição',
        'opcao': 'opção',
        'minisserie': 'minissérie',
        'minisseries': 'minisséries',
        'nao': 'não',
        'sao': 'são',
        'estao': 'estão',
        'tambem': 'também',
        'ja': 'já',
        'ate': 'até',
        'voce': 'você',
        'voces': 'vocês',
        'termica': 'térmica',
        'termico': 'térmico',
        'epson': 'Epson',
        'dtg': 'DTG',
        'dgt': 'DTG',
        'dtf': 'DTF',
        'dft': 'DTF',
        'bio': 'Bio',
        'pio': 'Bio',
        'wink': 'Ink',
        'despespertado': 'despertado',
        'despiscam': 'piscam',
        'consagracao': 'consagração'
    };

    // Dicionário e Normalizador Fonético de Marca e Ortografia PT-BR
    for (let i = 0; i < words.length; i++) {
        const rawW = words[i].word;
        const clean = rawW.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, '');
        const nextClean = (i < words.length - 1) ? words[i+1].word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, '') : '';
        const prevClean = (i > 0) ? words[i-1].word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, '') : '';

        // 0A. Fonética de Marca de Transcrições Legadas ("Nois e ex-Brasil" / "Nois ex Brasil" -> "InkVortex Brasil")
        if (clean === 'nois' && (nextClean === 'e' || nextClean === 'ex' || nextClean === 'exbrasil')) {
            words[i].word = "InkVortex";
            words[i].end = (i + 2 < words.length) ? words[i+2].end : words[i].end;
            if (nextClean === 'e') words[i+1].word = "";
            if (i + 2 < words.length && words[i+2].word.toLowerCase().includes('ex')) words[i+2].word = "";
            if (i + 3 < words.length && (words[i+3].word.toLowerCase().includes('brasil') || words[i+3].word.toLowerCase().includes('brazil'))) {
                words[i+3].word = "Brasil";
            }
            continue;
        }

        // 0B. Fusão Fonética de Duas Palavras ("E que" / "É que" / "Eh que" + "Vortex" -> "InkVortex")
        if ((clean === 'e' || clean === 'eh' || clean === 'in' || clean === 'em' || clean === 'ein') && nextClean === 'que') {
            const wordAfterNext = (i < words.length - 2) ? words[i+2].word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, '') : '';
            if (/^(?:vort|vortex|fort|bort)[a-z]*/i.test(wordAfterNext)) {
                words[i].word = "InkVortex";
                words[i].end = words[i+2].end; // Extende tempo final até o fim de Vortex
                words[i+1].word = ""; // Limpa "que"
                words[i+2].word = ""; // Limpa "Vortex"
                if (i + 3 < words.length && (words[i+3].word.toLowerCase().includes('brasil') || words[i+3].word.toLowerCase().includes('brazil'))) {
                    words[i+3].word = "Brasil";
                }
                continue;
            }
        }

        // 1. Marca Principal ("InkVortex" / "InkVortex Brasil", "Wink Vortex", "Link Vortex")
        if (/^(?:ink|inki|inky|inc|inque|emque|imque|enque|eque|eing|wink|link|infort|imfort|emfort|incvort|inkvort|winkvort|linkvort)[a-z]*(?:vort|fort|bort)[a-z]*/i.test(clean)) {
            if (nextClean === 'brasil' || nextClean === 'brazil') {
                words[i].word = "InkVortex";
                words[i+1].word = "Brasil";
            } else {
                words[i].word = "InkVortex";
            }
            continue;
        }

        // 2. Prefixo isolado ("ink", "inki", "inky", "inc", "inque", "eing", "wink", "link") seguido de sufixo ("vortex", "vortéx", "fortex", "vortics", "vortes")
        if (['ink', 'inki', 'inky', 'inc', 'inque', 'eing', 'einque', 'enque', 'emque', 'imque', 'em', 'im', 'in', 'wink', 'link'].includes(clean)) {
            if (/^(?:vort|vortex|vortex|fort|bort|vorti|forti|vortec|fortec)[a-z]*/i.test(nextClean)) {
                words[i].word = "InkVortex";
                words[i].end = words[i+1].end; // Extende tempo final até o fim do sufixo
                words[i+1].word = ""; // Limpa sufixo para fusão
                if (i + 2 < words.length && (words[i+2].word.toLowerCase().includes('brasil') || words[i+2].word.toLowerCase().includes('brazil'))) {
                    words[i+2].word = "Brasil";
                }
            }
        }

        // 3. Sufixo isolado ("vortex", "vortics", "fortex", "vortes") precedido por prefixo ou em contexto de marca
        if (/^(?:vortex|vortics|vortecx|fortex|fortecx|vortes|bortex)$/i.test(clean)) {
            if (['ink', 'inki', 'inky', 'inc', 'inque', 'eing', 'em', 'in', 'im', 'wink', 'link'].includes(prevClean)) {
                words[i-1].word = "InkVortex";
                words[i-1].end = words[i].end; // Extende tempo final até o fim do sufixo
                words[i].word = ""; // Limpa sufixo para fusão
            } else if (nextClean === 'brasil' || nextClean === 'brazil' || nextClean === 'de' || nextClean === 'no' || nextClean === 'em') {
                // Em contextos de vinheta ("Vortex Brasil", "Vortex de cor", "Vortex no peito") -> normaliza para "InkVortex"
                words[i].word = "InkVortex";
                if (nextClean === 'brasil' || nextClean === 'brazil') {
                    words[i+1].word = "Brasil";
                }
            } else {
                words[i].word = "Vortex";
            }
        }

        // 4. Termos Compostos e Expressões Fonéticas Legadas
        if (clean === 'com' && nextClean === 'a') {
            const wordAfterNext = (i < words.length - 2) ? words[i+2].word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, '') : '';
            if (wordAfterNext === 'sagrado' || wordAfterNext === 'sagrada' || wordAfterNext === 'sagracao') {
                words[i].word = "consagração";
                words[i].end = words[i+2].end; // Extende tempo até o fim de sagrado
                words[i+1].word = ""; // Limpa "a"
                words[i+2].word = ""; // Limpa "sagrado"
                continue;
            }
        }
        if (clean === 'mercado' && nextClean === 'livre') {
            words[i].word = "Mercado";
            words[i+1].word = "Livre";
            continue;
        }
        if ((clean === 'pio' || clean === 'bio') && prevClean === 'na') {
            words[i].word = "Bio";
            continue;
        }
        if (clean === 'df' && (prevClean === 'na' || prevClean === 'no' || nextClean === 'nao' || nextClean === 'pede')) {
            words[i].word = "DTF";
            continue;
        }
        if (clean === 'tia' && nextClean === 'vileta') {
            words[i].word = "ultravioleta";
            words[i+1].word = "";
            continue;
        }

        // 5. Correção Dicionairizada de Palavras PT-BR
        if (PT_BR_CORRECTIONS[clean]) {
            // Preserva pontuação original se houver
            const prefixPunct = rawW.match(/^[^a-zA-ZáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+/)?.[0] || '';
            const suffixPunct = rawW.match(/[^a-zA-ZáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+$/)?.[0] || '';
            words[i].word = prefixPunct + PT_BR_CORRECTIONS[clean] + suffixPunct;
        }
    }

    const cleanWords = words.filter(w => w.word.trim().length > 0);
    console.log('[ASS_GENERATOR] Filtered Brand Text:', cleanWords.map(w => w.word).join(' '));

    // Agrupar palavras limpas em frases (máx 4 palavras por frase para estilo TikTok)
    const MAX_WORDS_PER_PHRASE = 4;
    const MAX_GAP_SECONDS = 1.0;
    
    const phrases = [];
    let currentPhrase = [];
    
    for (let i = 0; i < cleanWords.length; i++) {
        const w = cleanWords[i];
        
        if (currentPhrase.length > 0) {
            const lastW = currentPhrase[currentPhrase.length - 1];
            // Se houver um silêncio muito grande, quebra a frase
            if (w.start - lastW.end > MAX_GAP_SECONDS) {
                phrases.push(currentPhrase);
                currentPhrase = [];
            }
        }
        
        currentPhrase.push(w);
        
        if (currentPhrase.length >= MAX_WORDS_PER_PHRASE) {
            phrases.push(currentPhrase);
            currentPhrase = [];
        }
    }
    if (currentPhrase.length > 0) phrases.push(currentPhrase);

    // Função auxiliar para formatar tempo no formato ASS: H:MM:SS.cs (centissegundos)
    function formatAssTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const cs = Math.floor((seconds % 1) * 100);
        
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    }

    // Estilo Base do ASS (2026 High-Engagement Standard: Space Grotesk / Impact, Micro-Pop 112% Active Word, Gold Glow)
    const header = `[Script Info]
Title: 2026 High Engagement TikTok Subtitles
ScriptType: v4.00+
WrapStyle: 1
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTok,Space Grotesk,105,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,9,4,2,30,30,780,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    let events = '';

    for (const phrase of phrases) {
        // 2026 Retention Style: ALL CAPS com Micro-Pop
        const plainWords = phrase.map(w => w.word.trim().toUpperCase());
        
        for (let i = 0; i < phrase.length; i++) {
            const activeWord = phrase[i];
            
            let startT = activeWord.start;
            let endT = activeWord.end;
            
            // Conecta fim de uma palavra ao início da próxima para transição fluida sem piscar
            if (i < phrase.length - 1) {
                endT = phrase[i + 1].start;
            }
            
            let eventText = '';
            for (let j = 0; j < plainWords.length; j++) {
                if (j === i) {
                    // Palavra Ativa -> Destaque Amarelo Ouro Elétrico (&H0000E6FF&) + Pulsar Micro-Pop 112% (\fscx112\fscy112)
                    eventText += `{\\c&H0000E6FF&\\fscx112\\fscy112}${plainWords[j]}{\\r} `;
                } else {
                    // Palavras Inativas -> Branco Puro + Escala Normal 100%
                    eventText += `{\\c&H00FFFFFF&\\fscx100\\fscy100}${plainWords[j]}{\\r} `;
                }
            }
            
            eventText = eventText.trim();
            events += `Dialogue: 0,${formatAssTime(startT)},${formatAssTime(endT)},TikTok,,0,0,0,,${eventText}\n`;
        }
    }

    const assContent = header + events;
    return { assContent: assContent };
}

module.exports = { generateTikTokAssScript };
