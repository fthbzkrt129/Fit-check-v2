import { getServerEnv } from "@/lib/env";
import { buildScenePrompt, buildVirtualTryOnPrompt, getSceneModelName } from "@/lib/kombin/services/geminiService";
import type { DressLengthOption, GarmentCategory, OuterwearLengthOption, TopLengthOption } from "@/lib/kombin/types";

type FetchLike = typeof fetch;

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const dataUrlToInlinePart = (dataUrl: string) => {
  const [header, data] = dataUrl.split(",");

  if (!header || !data) {
    throw new Error("Invalid data URL provided to Gemini provider.");
  }

  const mimeType = header.match(/data:(.*?);base64/)?.[1];
  if (!mimeType) {
    throw new Error("Could not parse MIME type from Gemini input.");
  }

  return {
    inlineData: {
      mimeType,
      data
    }
  };
};

const extractImageUrl = (payload: {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
    finishReason?: string;
  }>;
}) => {
  for (const candidate of payload.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inlineData = part.inlineData;
      if (inlineData?.mimeType && inlineData.data) {
        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
      }
    }
  }

  const finishReason = payload.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    throw new Error(`Gemini image generation stopped unexpectedly. Reason: ${finishReason}.`);
  }

  throw new Error("Gemini did not return an image.");
};

const requestGeminiImage = async (
  prompt: string,
  images: string[],
  fetchImpl: FetchLike = fetch,
  modelName = "gemini-2.5-flash-image",
) => {
  const { geminiApiKey } = getServerEnv();
  const response = await fetchImpl(`${GEMINI_ENDPOINT_BASE}/${modelName}:generateContent?key=${geminiApiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [...images.map(dataUrlToInlinePart), { text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }

  return extractImageUrl((await response.json()) as Parameters<typeof extractImageUrl>[0]);
};

export const generateModelImage = async (userImage: string, fetchImpl?: FetchLike) =>
  requestGeminiImage("generate-model", [userImage], fetchImpl);

export const generateIdentityReferenceImage = async (userImage: string, fetchImpl?: FetchLike) =>
  requestGeminiImage(
    `You are an expert fashion photography AI. Create a clean full-body identity reference image from this person photo.

Critical rules:
1. Preserve the person's identity, face, hair, and body characteristics.
2. Use a neutral standing fashion pose.
3. Use a clean light studio background.
4. Keep the clothing simple and non-distracting so identity and body proportions remain clear.
5. Return ONLY the final image.`,
    [userImage],
    fetchImpl,
  );

export const generateModelSwapImage = async (
  referenceLookImage: string,
  identityReferenceImage: string,
  fetchImpl?: FetchLike,
) =>
  requestGeminiImage(
    `You are an expert fashion identity transfer AI. You will receive two labeled images.

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
8. Return ONLY the final image.`,
    [referenceLookImage, identityReferenceImage],
    fetchImpl,
  );

export const generateVirtualTryOnImage = async (
  modelImage: string,
  garmentImage: string,
  category: GarmentCategory,
  topLength?: TopLengthOption,
  dressLength?: DressLengthOption,
  outerwearLength?: OuterwearLengthOption,
  fetchImpl?: FetchLike
) => requestGeminiImage(buildVirtualTryOnPrompt(category, topLength, dressLength, outerwearLength), [modelImage, garmentImage], fetchImpl);

export const generatePoseVariation = async (tryOnImage: string, poseInstruction: string, fetchImpl?: FetchLike) =>
  requestGeminiImage(`pose:${poseInstruction}`, [tryOnImage], fetchImpl);

export const generateSceneVariation = async (
  baseImage: string,
  scene: string,
  lighting: string,
  mode: string,
  customPrompt?: string,
  fetchImpl?: FetchLike
) =>
  requestGeminiImage(
    buildScenePrompt(scene as never, lighting as never, mode as never, customPrompt),
    [baseImage],
    fetchImpl,
    getSceneModelName(mode as never),
  );

export const __private__ = {
  buildVirtualTryOnPrompt,
  dataUrlToInlinePart,
  extractImageUrl
};
