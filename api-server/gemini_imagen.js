const fs = require('fs');
const path = require('path');

function getApiKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/^GEMINI_API_KEY=(.*)$/m);
            if (match) return match[1].trim();
        }
    } catch(e) {}
    return null;
}

/**
 * Generates an image using Gemini Imagen 3 and saves it to disk
 * @param {string} prompt - The image prompt
 * @param {string} outputPath - Where to save the jpg
 * @returns {Promise<string>} The path to the saved image
 */
async function generateImageWithGemini(prompt, outputPath) {
    const API_KEY = getApiKey();
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY não configurada no .env");
    }
    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`;

    const payload = {
        instances: [
            { prompt: prompt }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "9:16" // Formato Vertical para Shorts
        }
    };

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Erro na API do Gemini: ${data.error?.message || response.statusText}`);
        }

        if (data.predictions && data.predictions.length > 0) {
            const base64Image = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64Image, 'base64');
            fs.writeFileSync(outputPath, buffer);
            return outputPath;
        } else {
            throw new Error("Nenhuma imagem retornada pelo Gemini.");
        }
    } catch (error) {
        console.error("Falha ao gerar imagem no Gemini:", error.message);
        throw error;
    }
}

/**
 * Generate a batch of images sequentially (to avoid rate limits on free tier)
 * @param {string[]} prompts 
 * @param {string} outputDir 
 * @param {string} prefix
 */
async function generateImageBatch(prompts, outputDir, prefix = 'img_') {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const generatedPaths = [];
    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const outPath = path.join(outputDir, `${prefix}${String(i + 1).padStart(2, '0')}.png`);
        console.log(`[Gemini] Gerando imagem ${i+1}/${prompts.length}...`);
        try {
            await generateImageWithGemini(prompt, outPath);
            generatedPaths.push(outPath);
        } catch(e) {
            console.error(`[Gemini] Erro na imagem ${i+1}. Pulando...`);
        }
        
        // Wait 2 seconds between requests to respect Free Tier rate limits
        if (i < prompts.length - 1) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return generatedPaths;
}

module.exports = { generateImageWithGemini, generateImageBatch };
