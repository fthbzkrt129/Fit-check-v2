import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

if (!apiKey) {
    console.error("API Key bulunamadı!");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
    const imagePath = path.join('..', 'fit-check-1774570769749.png');
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    
    // Varyasyon 2'deki verileri kullanarak prompt oluşturuyoruz
    const prompt = `You are an expert luxury fashion campaign photographer AI. You will receive an existing fashion try-on image.

Your job is to preserve the same model identity, same outfit and fit, same garment boundaries and proportions, and the same overall framing and composition while transforming only the environment and lighting in a more premium, believable way.

Scene direction: outside a luxury cocktail bar, street lights in bokeh.
Lighting direction: warm amber ambient lighting, night photography.

Rules:
1. Preserve the same model identity, face, hair, body proportions, and pose.
2. Preserve the same outfit and fit, including garment edges, lengths, colors, materials, and visible accessories.
3. Preserve the same overall framing and composition. Do not crop, zoom, or change camera distance.
4. Do not redesign or restyle the outfit.
5. Replace only the environment and lighting with a more premium, realistic editorial result.
6. Keep the result photorealistic, refined, and commercially usable.
7. Return ONLY the final image.`;

    console.log("Gemini 3.1 Pro (Image Preview) modeliyle görsel üretiliyor...");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                responseModalities: ["IMAGE", "TEXT"],
            }
        });
        
        let found = false;
        for (const candidate of response.candidates ?? []) {
            const imagePart = candidate.content?.parts?.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
                const outputPath = path.join('..', 'generated-scene.png');
                fs.writeFileSync(outputPath, buffer);
                console.log("Başarılı! Yeni görsel ana klasöre kaydedildi: generated-scene.png");
                found = true;
                break;
            }
        }
        if (!found) {
            console.log("Görsel üretilemedi. Modelin yanıtı:", JSON.stringify(response, null, 2));
        }
    } catch (e) {
        console.error("Bir hata oluştu:", e);
    }
}

run();