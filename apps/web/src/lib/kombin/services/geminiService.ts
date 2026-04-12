/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import type { GarmentCategory, LightingOption, SceneOption, SceneQualityMode, TopLengthOption, DressLengthOption, OuterwearLengthOption } from '@/lib/kombin/types';
import { imageUrlToDataUrl } from '@/lib/kombin/imagePersistence';

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

let _ai: GoogleGenAI | null = null;
const getAi = () => {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return _ai;
};
const model = 'gemini-2.5-flash-image';

const sceneDescriptions: Record<SceneOption, string> = {
    studio: 'a clean premium fashion studio set with a minimal editorial backdrop',
    cafe: 'an upscale lifestyle cafe interior with tasteful decor and depth',
    street: 'a modern urban fashion street scene with premium editorial energy',
    'luxury room': 'an elegant luxury interior reminiscent of a designer suite',
};

const lightingDescriptions: Record<LightingOption, string> = {
    'soft daylight': 'soft balanced daylight with flattering natural skin tones',
    'golden hour': 'warm golden hour lighting with a premium lifestyle glow',
    dramatic: 'directional dramatic lighting with contrast and fashion depth',
    editorial: 'high-end editorial fashion lighting with polished highlights and controlled shadows',
};

export const getSceneModelName = (mode: SceneQualityMode) =>
    mode === 'pro' ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';

export const buildScenePrompt = (
    scene: SceneOption,
    lighting: LightingOption,
    mode: SceneQualityMode,
    customPrompt?: string,
) => {
    const sceneDirection = customPrompt 
      ? `a ${customPrompt} environment`
      : sceneDescriptions[scene];
    const lightingDirection = lightingDescriptions[lighting];

    if (mode === 'pro') {
        return `You are an expert luxury fashion campaign photographer AI. You will receive an existing fashion try-on image.

Your job is to seamlessly blend the person and their outfit into a new environment. The result must look like a single photograph taken on location — NOT a composite or cutout.

Scene direction: ${sceneDirection}.
Lighting direction: ${lightingDirection}.

Critical blending rules:
1. Preserve the same model identity, face, hair, body proportions, and pose exactly.
2. Preserve the same outfit and fit — garment edges, lengths, colors, materials, and visible accessories must remain identical.
3. Preserve the same overall framing and composition. Do not crop, zoom, or change camera distance.
4. Add realistic contact shadows beneath the model's feet/shoes that match the new floor surface and lighting angle.
5. Apply subtle ambient light color from the new environment onto the model's skin, hair, and clothing — warm scenes should warm the subject, cool scenes should cool it. This is the single most important step to avoid the "pasted on" look.
6. Add soft environmental reflections on shiny fabric surfaces (leather, silk, metallic accessories) that correspond to the new scene colors.
7. Apply a gentle rim light or backlight from the environment to separate the subject from the background naturally.
8. Soften the subject's silhouette edges with subtle environmental light bleeding — no hard cutout edges.
9. Match the overall color temperature and contrast grading of the entire image to the new environment.
10. Do not redesign or restyle the outfit.
11. Keep the result photorealistic, refined, and commercially usable.
12. Return ONLY the final image.`;
    }

    return `You are an expert fashion photographer AI. You will receive an existing fashion try-on image.

Your job is to naturally place the person into a new environment so it looks like a real photograph taken on location — not a composite.

Scene direction: ${sceneDirection}.
Lighting direction: ${lightingDirection}.

Critical blending rules:
1. Preserve the person's identity, face, hair, body proportions, and pose exactly.
2. Preserve the clothing design, silhouette, fabric appearance, colors, and all visible accessories.
3. Do not redesign or replace the outfit.
4. Add a realistic floor shadow beneath the model that matches the ground surface and lighting direction.
5. Tint the model's skin and clothing with the ambient color of the new environment so the subject belongs in the scene — this prevents the "pasted on" effect.
6. Add subtle environmental light reflections on any shiny or glossy surfaces of the clothing.
7. Soften the edges where the model meets the background with natural light wrap — avoid hard cutout edges.
8. Match the overall color tone and brightness of the whole image to the new scene.
9. Keep the result photorealistic and natural.
10. Return ONLY the final image.`;
};

export const generateModelImage = async (userImage: File): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    const prompt = "You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo suitable for an e-commerce website. The background must be a clean, neutral studio backdrop (light gray, #f0f0f0). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.";
    const response = await getAi().models.generateContent({
        model,
        contents: { parts: [userImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};

export const buildGarmentInstructions = (category: GarmentCategory, topLength?: TopLengthOption | null, dressLength?: DressLengthOption | null, outerwearLength?: OuterwearLengthOption | null) => {
    if (category === 'top') {
        const topLengthInstructions: Record<TopLengthOption, string> = {
            crop: 'The top must end above the waist in a clear cropped proportion.',
            waist: 'The top must end around the waist.',
            hip: 'The top must extend to hip length.',
            tunic: 'The top must read as a tunic length top and extend below the hips, but it must not become a dress.',
        };

        return `Replace only the upper-body garment. Keep any visible lower-body garment intact. ${topLength ? topLengthInstructions[topLength] : 'The top must keep a realistic top-garment length.'}`;
    }

    if (category === 'dress') {
        const dressLengthInstructions: Record<DressLengthOption, string> = {
            knee: 'The dress must end at knee length.',
            midi: 'The dress must be midi length, typically ending mid-calf.',
            maxi: 'The dress must be maxi length, extending to the ankles.',
            floor: 'The dress must be floor-length, extending to or touching the floor.',
        };

        return `Replace the entire outfit with a full-body dress. The dress must cover the torso and legs completely. ${dressLength ? dressLengthInstructions[dressLength] : 'The dress must be a realistic full-length dress.'}`;
    }

    if (category === 'outerwear') {
        const outerwearLengthInstructions: Record<OuterwearLengthOption, string> = {
            short: 'The outerwear must be short jacket length, ending above the hip.',
            medium: 'The outerwear must be medium/blazer length, ending at the hip.',
            long: 'The outerwear must be long coat length, extending past the hip to mid-thigh or longer.',
        };

        return `Layer the outerwear naturally OVER the existing top. Keep the top fully visible. The outerwear must rest on the shoulders and drape naturally. ${outerwearLength ? outerwearLengthInstructions[outerwearLength] : 'The outerwear must have realistic jacket proportions.'}`;
    }

    if (category === 'bottom') {
        return 'Replace only the lower-body garment. Keep the upper-body garment intact and visible. Preserve the full-body framing from head to toe. Do not crop the model. Do not change the aspect ratio or camera distance.';
    }

    if (category === 'footwear') {
        return 'Replace only the footwear on the feet and keep the existing pants or leg silhouette intact. Match sole contact, foot angle, and ground shadow naturally. Preserve the full-body framing from head to toe. Do not crop above the ankles. Do not change the aspect ratio or camera distance.';
    }

    return 'Add the accessory naturally in the correct wearing position without altering the rest of the outfit. Preserve the clothing silhouette and place the accessory where it would realistically be worn or carried. Preserve the full-body framing from head to toe. Do not crop the model. Do not change the aspect ratio or camera distance.';
};

const buildBottomGarmentStructureRules = () => [
    'This is a full lower-garment replacement, not a recolor or texture swap.',
    'Remove all original lower-garment construction details from the base image.',
    'Do not preserve any original pockets, front seam lines, pleats, creases, hems, waistband shape, rise, cut, or leg width from the base garment.',
    'Rebuild the lower-body silhouette from the garment image only.',
    'The final hem width, leg shape, seam placement, drape, and garment construction must match the garment image, not the original model image.',
    'If the base image and garment image conflict, always follow the garment image for garment structure.',
];

export const buildVirtualTryOnPrompt = (
    category: GarmentCategory,
    topLength?: TopLengthOption | null,
    dressLength?: DressLengthOption | null,
    outerwearLength?: OuterwearLengthOption | null,
) => {
    const promptPayload = {
        role: 'expert virtual try-on AI',
        task: "Create a new photorealistic image where the person from the model image is wearing the clothing from the garment image.",
        inputs: ['model image', 'garment image'],
        category,
        categorySpecificInstruction: buildGarmentInstructions(category, topLength, dressLength, outerwearLength),
        structuralReplacementRules: category === 'bottom' ? buildBottomGarmentStructureRules() : undefined,
        crucialRules: [
            'Change only the area relevant to the garment category.',
            "Preserve the person's face, hair, body shape, and pose from the model image.",
            'Preserve the entire background from the model image.',
            'Fit the garment naturally with realistic folds, shadows, and lighting consistent with the original scene.',
            'Maintain the aspect ratio of the base image. Do not stretch or squash the garment or background.',
            'Return only the final edited image.',
        ],
    };

    return JSON.stringify(promptPayload, null, 2);
};

export const generateVirtualTryOnImage = async (
    modelImageUrl: string,
    garmentImage: File,
    category: GarmentCategory = 'top',
    topLength?: TopLengthOption | null,
    dressLength?: DressLengthOption | null,
    outerwearLength?: OuterwearLengthOption | null,
): Promise<string> => {
    const normalizedModelImageUrl = await imageUrlToDataUrl(modelImageUrl);
    const modelImagePart = dataUrlToPart(normalizedModelImageUrl);

    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(garmentImage);
    });
    const garmentImagePart = dataUrlToPart(dataUrl);

    const prompt = buildVirtualTryOnPrompt(category, topLength, dressLength, outerwearLength);
    const response = await getAi().models.generateContent({
        model,
        contents: { parts: [modelImagePart, garmentImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};

export const generateIdentityReferenceImage = async (newModelImage: File): Promise<string> => {
    const newModelImagePart = await fileToPart(newModelImage);
    const prompt = `You are an expert fashion photography AI. Create a clean full-body identity reference image from this person photo.

Critical rules:
1. Preserve the person's identity, face, hair, and body characteristics.
2. Use a neutral standing fashion pose.
3. Use a clean light studio background.
4. Keep the clothing simple and non-distracting so identity and body proportions remain clear.
5. Return ONLY the final image.`;

    const response = await getAi().models.generateContent({
        model,
        contents: { parts: [newModelImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return handleApiResponse(response);
};

export const generateModelSwapImage = async (
    referenceLookImageUrl: string,
    identityReferenceImageUrl: string,
): Promise<string> => {
    const referenceLookImagePart = dataUrlToPart(referenceLookImageUrl);
    const identityReferenceImagePart = dataUrlToPart(identityReferenceImageUrl);

    const prompt = `You are an expert fashion identity transfer AI. You will receive two labeled images.

Image A: the reference fashion look image. It is the source of truth for the outfit, styling, pose, framing, and composition.
Image B: the identity reference image. It is the source of truth for the new person's face, hair, and body characteristics.

Your task is to generate a single photorealistic image where the person from Image B replaces the mannequin/model from Image A.

Critical rules:
1. Preserve the outfit from Image A exactly. Do not redesign, restyle, add, remove, or reinterpret any garment or accessory.
2. Preserve the pose, camera angle, framing, crop, and composition from Image A as closely as possible.
3. Replace the person identity with Image B. The final face, hair, and body characteristics must clearly resemble Image B, not Image A.
4. Keep garment colors, fit, silhouette, layering, hem lengths, fabric appearance, and visible accessories identical to Image A.
5. Do not borrow clothing from Image B.
6. If the final person still looks like Image A, the result is incorrect.
7. The result must look like one coherent fashion photograph, with realistic anatomy, lighting, shadows, and garment drape.
8. Return ONLY the final image.`;

    const response = await getAi().models.generateContent({
        model,
        contents: { parts: [
            { text: 'Image A: reference fashion look image.' },
            referenceLookImagePart,
            { text: 'Image B: new person identity reference image.' },
            identityReferenceImagePart,
            { text: prompt },
        ] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return handleApiResponse(response);
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string): Promise<string> => {
    const normalizedTryOnImageUrl = await imageUrlToDataUrl(tryOnImageUrl);
    const tryOnImagePart = dataUrlToPart(normalizedTryOnImageUrl);
    const prompt = `You are an expert fashion photographer AI. Take this image and regenerate it from a different perspective. The person, clothing, and background style must remain identical. The new perspective should be: "${poseInstruction}". Return ONLY the final image.`;
    const response = await getAi().models.generateContent({
        model,
        contents: { parts: [tryOnImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};

export const generateSceneVariation = async (
    baseImageUrl: string,
    scene: SceneOption,
    lighting: LightingOption,
    mode: SceneQualityMode = 'fast',
    customPrompt?: string,
): Promise<string> => {
    const normalizedBaseImageUrl = await imageUrlToDataUrl(baseImageUrl);
    const baseImagePart = dataUrlToPart(normalizedBaseImageUrl);
    const prompt = buildScenePrompt(scene, lighting, mode, customPrompt);
    const response = await getAi().models.generateContent({
        model: getSceneModelName(mode),
        contents: { parts: [baseImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};
