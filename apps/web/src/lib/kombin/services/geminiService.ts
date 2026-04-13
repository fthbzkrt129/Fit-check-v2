/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { aiSuccessSchema } from '@/lib/ai/contracts';
import type { GarmentCategory, LightingOption, SceneOption, SceneQualityMode, TopLengthOption, DressLengthOption, OuterwearLengthOption } from '@/lib/kombin/types';
import { imageUrlToDataUrl } from '@/lib/kombin/imagePersistence';

const fileToDataUrl = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const requestModelImage = async (userImage: string, fetchImpl: typeof fetch = fetch): Promise<string> => {
    const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);
    const response = await fetchImpl('/api/ai/model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceSlug, userImage }),
    });

    if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || 'Model generation request failed.');
    }

    const payload = aiSuccessSchema.parse(await response.json());
    return payload.imageUrl;
};

const requestPoseVariation = async (
    tryOnImageUrl: string,
    poseInstruction: string,
    fetchImpl: typeof fetch = fetch,
    normalizeTryOnImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
): Promise<string> => {
    const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);
    const response = await fetchImpl('/api/ai/pose', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspaceSlug,
            tryOnImage: await normalizeTryOnImage(tryOnImageUrl),
            poseInstruction,
        }),
    });

    if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || 'Pose generation request failed.');
    }

    const payload = aiSuccessSchema.parse(await response.json());
    return payload.imageUrl;
};

const requestSceneVariation = async (
    baseImageUrl: string,
    scene: SceneOption,
    lighting: LightingOption,
    mode: SceneQualityMode = 'fast',
    customPrompt?: string,
    fetchImpl: typeof fetch = fetch,
    normalizeBaseImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
): Promise<string> => {
    const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);
    const response = await fetchImpl('/api/ai/scene', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspaceSlug,
            baseImage: await normalizeBaseImage(baseImageUrl),
            scene,
            lighting,
            mode,
            customPrompt,
        }),
    });

    if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || 'Scene generation request failed.');
    }

    const payload = aiSuccessSchema.parse(await response.json());
    return payload.imageUrl;
};

const requestIdentityReferenceImage = async (
    newModelImage: File,
    fetchImpl: typeof fetch = fetch,
    toDataUrl: (file: File) => Promise<string> = fileToDataUrl,
): Promise<string> => {
    const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);
    const response = await fetchImpl('/api/ai/model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspaceSlug,
            operation: 'identity-reference',
            userImage: await toDataUrl(newModelImage),
        }),
    });

    if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || 'Identity reference request failed.');
    }

    const payload = aiSuccessSchema.parse(await response.json());
    return payload.imageUrl;
};

const requestModelSwapImage = async (
    referenceLookImageUrl: string,
    identityReferenceImageUrl: string,
    fetchImpl: typeof fetch = fetch,
    normalizeReferenceLookImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
    normalizeIdentityReferenceImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
): Promise<string> => {
    const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);
    const response = await fetchImpl('/api/ai/model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspaceSlug,
            operation: 'swap',
            referenceLookImage: await normalizeReferenceLookImage(referenceLookImageUrl),
            identityReferenceImage: await normalizeIdentityReferenceImage(identityReferenceImageUrl),
        }),
    });

    if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || 'Model swap request failed.');
    }

    const payload = aiSuccessSchema.parse(await response.json());
    return payload.imageUrl;
};

const resolveWorkspaceSlug = (locationLike: Pick<Location, 'pathname' | 'hostname'> | null | undefined): string => {
    const pathname = locationLike?.pathname ?? '';
    const workspaceMatch = pathname.match(/^\/workspace\/([^/]+)/);
    if (workspaceMatch?.[1]) {
        return decodeURIComponent(workspaceMatch[1]);
    }

    const devMatch = pathname.match(/^\/dev\/([^/]+)/);
    if (devMatch?.[1]) {
        return decodeURIComponent(devMatch[1]);
    }

    const hostname = locationLike?.hostname ?? '';
    const hostParts = hostname.split('.').filter(Boolean);
    if (hostParts.length >= 3 && hostParts[0]) {
        return hostParts[0];
    }

    throw new Error('Workspace slug could not be resolved for secure AI request.');
};

const requestTryOnImage = async (
    modelImageUrl: string,
    garmentImage: File,
    category: GarmentCategory,
    topLength: TopLengthOption | null,
    dressLength: DressLengthOption | null,
    outerwearLength: OuterwearLengthOption | null,
    fetchImpl: typeof fetch = fetch,
    normalizeModelImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
    toDataUrl: (file: File) => Promise<string> = fileToDataUrl,
): Promise<string> => {
    const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);
    const response = await fetchImpl('/api/ai/try-on', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspaceSlug,
            modelImage: await normalizeModelImage(modelImageUrl),
            garmentImage: await toDataUrl(garmentImage),
            category,
            topLength,
            dressLength,
            outerwearLength,
        }),
    });

    if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || 'Try-on request failed.');
    }

    const payload = aiSuccessSchema.parse(await response.json());
    return payload.imageUrl;
};

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

export const generateModelImage = async (
    userImage: File,
    fetchImpl: typeof fetch = fetch,
    toDataUrl: (file: File) => Promise<string> = fileToDataUrl,
): Promise<string> => {
    return requestModelImage(await toDataUrl(userImage), fetchImpl);
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
    fetchImpl: typeof fetch = fetch,
    normalizeModelImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
    toDataUrl: (file: File) => Promise<string> = fileToDataUrl,
): Promise<string> => {
    return requestTryOnImage(
        modelImageUrl,
        garmentImage,
        category,
        topLength ?? null,
        dressLength ?? null,
        outerwearLength ?? null,
        fetchImpl,
        normalizeModelImage,
        toDataUrl,
    );
};

export const generateIdentityReferenceImage = async (
    newModelImage: File,
    fetchImpl: typeof fetch = fetch,
    toDataUrl: (file: File) => Promise<string> = fileToDataUrl,
): Promise<string> => {
    return requestIdentityReferenceImage(newModelImage, fetchImpl, toDataUrl);
};

export const generateModelSwapImage = async (
    referenceLookImageUrl: string,
    identityReferenceImageUrl: string,
    fetchImpl: typeof fetch = fetch,
    normalizeReferenceLookImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
    normalizeIdentityReferenceImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
): Promise<string> => {
    return requestModelSwapImage(
        referenceLookImageUrl,
        identityReferenceImageUrl,
        fetchImpl,
        normalizeReferenceLookImage,
        normalizeIdentityReferenceImage,
    );
};

export const generatePoseVariation = async (
    tryOnImageUrl: string,
    poseInstruction: string,
    fetchImpl: typeof fetch = fetch,
    normalizeTryOnImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
): Promise<string> => {
    return requestPoseVariation(tryOnImageUrl, poseInstruction, fetchImpl, normalizeTryOnImage);
};

export const generateSceneVariation = async (
    baseImageUrl: string,
    scene: SceneOption,
    lighting: LightingOption,
    mode: SceneQualityMode = 'fast',
    customPrompt?: string,
    fetchImpl: typeof fetch = fetch,
    normalizeBaseImage: (imageUrl: string) => Promise<string> = imageUrlToDataUrl,
): Promise<string> => {
    return requestSceneVariation(baseImageUrl, scene, lighting, mode, customPrompt, fetchImpl, normalizeBaseImage);
};

export const __private__ = {
    requestModelImage,
    requestTryOnImage,
    requestPoseVariation,
    requestSceneVariation,
    requestIdentityReferenceImage,
    requestModelSwapImage,
    resolveWorkspaceSlug,
};
