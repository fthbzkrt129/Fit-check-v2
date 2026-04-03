import { getServerEnv } from "@/lib/env";

type FetchLike = typeof fetch;

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

const buildScenePrompt = (scene: string, lighting: string, mode: string, customPrompt?: string) =>
  JSON.stringify({ scene, lighting, mode, customPrompt });

const buildVirtualTryOnPrompt = (category: string) => JSON.stringify({ category, mode: "virtual-try-on" });

const requestGeminiImage = async (prompt: string, images: string[], fetchImpl: FetchLike = fetch) => {
  const { geminiApiKey } = getServerEnv();
  const response = await fetchImpl(`${GEMINI_ENDPOINT}?key=${geminiApiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt, images })
  });

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }

  const payload = (await response.json()) as { imageUrl?: string };
  if (!payload.imageUrl) {
    throw new Error("Gemini did not return an image.");
  }

  return payload.imageUrl;
};

export const generateModelImage = async (userImage: string, fetchImpl?: FetchLike) =>
  requestGeminiImage("generate-model", [userImage], fetchImpl);

export const generateVirtualTryOnImage = async (
  modelImage: string,
  garmentImage: string,
  category: string,
  fetchImpl?: FetchLike
) => requestGeminiImage(buildVirtualTryOnPrompt(category), [modelImage, garmentImage], fetchImpl);

export const generatePoseVariation = async (tryOnImage: string, poseInstruction: string, fetchImpl?: FetchLike) =>
  requestGeminiImage(`pose:${poseInstruction}`, [tryOnImage], fetchImpl);

export const generateSceneVariation = async (
  baseImage: string,
  scene: string,
  lighting: string,
  mode: string,
  customPrompt?: string,
  fetchImpl?: FetchLike
) => requestGeminiImage(buildScenePrompt(scene, lighting, mode, customPrompt), [baseImage], fetchImpl);

export const __private__ = {
  buildScenePrompt,
  buildVirtualTryOnPrompt
};
