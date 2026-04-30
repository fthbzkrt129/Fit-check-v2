import { getServerEnv } from "@/lib/env";
import type { LightingOption, SceneOption } from "@/lib/kombin/types";

type FetchLike = typeof fetch;
type FalQueueSubmission = {
  request_id: string;
  status_url?: string;
  response_url?: string;
};

const MAX_ATTEMPTS = 2;
const MAX_QUEUE_STATUS_POLLS = 60;
const MAX_PRO_SCENE_QUEUE_STATUS_POLLS = 180;
const QUEUE_STATUS_POLL_INTERVAL_MS = 1000;
const FAL_WAN_EDIT_ENDPOINT = "https://queue.fal.run/fal-ai/wan/v2.7/edit";
const FAL_GPT_IMAGE_2_EDIT_ENDPOINT = "https://queue.fal.run/openai/gpt-image-2/edit";

const sceneDescriptions: Record<SceneOption, string> = {
  studio: "a clean premium fashion studio set with a minimal editorial backdrop",
  cafe: "an upscale lifestyle cafe interior with tasteful decor and depth",
  street: "a modern urban fashion street scene with premium editorial energy",
  "luxury room": "an elegant luxury interior reminiscent of a designer suite",
};

const lightingDescriptions: Record<LightingOption, string> = {
  "soft daylight": "soft balanced daylight with flattering natural skin tones",
  "golden hour": "warm golden hour lighting with a premium lifestyle glow",
  dramatic: "directional dramatic lighting with contrast and fashion depth",
  editorial: "high-end editorial fashion lighting with polished highlights and controlled shadows",
};

export const buildGptScenePrompt = (scene: string, lighting: string, customPrompt?: string) => {
  const knownScene = scene as SceneOption;
  const knownLighting = lighting as LightingOption;
  const sceneDirection = customPrompt?.trim()
    ? `a ${customPrompt.trim()} environment`
    : sceneDescriptions[knownScene] ?? scene;
  const lightingDirection = lightingDescriptions[knownLighting] ?? lighting;

  return `You are a world-class fashion editorial photographer and luxury campaign art director.

Use the input image as the exact subject reference. Preserve the model identity, face, body proportions, outfit, garment colors, silhouette, fit, accessories, and styling. This is NOT a virtual try-on task. Do not replace, redesign, or reinterpret any clothing.

Pose and placement direction:
Keep the original pose broadly recognizable, but make tasteful natural stance adjustments so the model must physically belong to the location. You may refine foot placement, weight distribution, shoulder angle, hand relaxation, and head direction if needed for a realistic full-body editorial photograph. The posture should feel confident, grounded, balanced, and photographed in the scene, not pasted onto it.

Lighting and integration direction:
Relight the subject to match the environment. The model, skin, hair, and outfit must share the same light direction, shadow softness, color temperature, contrast, and ambient bounce as the selected scene. Add realistic contact shadows under both feet, natural ground contact, subtle rim light, environmental color spill on skin/hair/fabric, and lens-consistent depth and contrast. The final image must look captured in-camera, not composited.

Create a new premium fashion editorial photograph featuring the same model and outfit in this environment:
Scene direction: ${sceneDirection}.
Lighting direction: ${lightingDirection}.

Photographic direction:
Shoot it like a high-end luxury fashion campaign with polished editorial composition, confident model presence, premium lens rendering, natural environmental shadows, subtle reflections, and cohesive color grading. Aim for glamorous fashion-photographer energy, similar in mood to Mario Testino-style luxury editorial lighting and composition, without copying any specific existing photograph.

Return ONLY the final image.`;
};

const normalizeFalError = (status: number, detail?: string) => {
  if (status === 401 || status === 403) {
    return new Error("fal.ai kimlik dogrulamasi basarisiz.");
  }

  return new Error(detail || "fal.ai deneysel kombin istegi tamamlanamadi.");
};

const normalizeFalResult = (result: unknown): string => {
  const payload = result as {
    imageUrl?: unknown;
    images?: unknown[];
    data?: {
      images?: unknown[];
      image?: unknown;
    };
  };
  const firstImage = (payload.data?.images?.[0] ?? payload.images?.[0]) as { url?: unknown } | string | undefined;

  if (typeof payload.imageUrl === "string") {
    return payload.imageUrl;
  }

  if (typeof firstImage === "string") {
    return firstImage;
  }

  if (typeof firstImage?.url === "string") {
    return firstImage.url;
  }

  if (typeof payload.data?.image === "string") {
    return payload.data.image;
  }

  const imageObject = payload.data?.image as { url?: unknown } | undefined;
  if (typeof imageObject?.url === "string") {
    return imageObject.url;
  }

  throw new Error("fal.ai sonucu gorsel dondurmedi.");
};

const isFalQueueSubmission = (result: unknown): result is FalQueueSubmission => {
  const payload = result as { request_id?: unknown };
  return typeof payload.request_id === "string";
};

const buildFalWanEditInput = (payload: Record<string, unknown>) => {
  const prompt = typeof payload.prompt === "string" ? payload.prompt : "";
  const imageInputs = Array.isArray(payload.imageInputs) ? payload.imageInputs : [];

  return {
    prompt,
    image_urls: imageInputs,
    num_images: 1,
  };
};

const buildFalGptImage2EditInput = (payload: Record<string, unknown>) => {
  const prompt = typeof payload.prompt === "string" ? payload.prompt : "";
  const imageInputs = Array.isArray(payload.imageInputs) ? payload.imageInputs : [];
  const imageSize = payload.imageSize as { width?: unknown; height?: unknown } | undefined;
  const quality = payload.quality === "high" ? "high" : "low";

  return {
    prompt,
    image_urls: imageInputs,
    image_size: {
      width: typeof imageSize?.width === "number" ? imageSize.width : 768,
      height: typeof imageSize?.height === "number" ? imageSize.height : 768,
    },
    quality,
    num_images: 1,
    output_format: "png",
  };
};

const resolveFalEndpoint = (payload: Record<string, unknown>) =>
  payload.provider === "gpt-image-2" ? FAL_GPT_IMAGE_2_EDIT_ENDPOINT : FAL_WAN_EDIT_ENDPOINT;

const buildFalEditInput = (payload: Record<string, unknown>) =>
  payload.provider === "gpt-image-2" ? buildFalGptImage2EditInput(payload) : buildFalWanEditInput(payload);

const resolveQueueStatusPolls = (payload: Record<string, unknown>) =>
  typeof payload.maxQueueStatusPolls === "number" && payload.maxQueueStatusPolls > 0
    ? payload.maxQueueStatusPolls
    : MAX_QUEUE_STATUS_POLLS;

const wait = (durationMs: number) => new Promise((resolve) => setTimeout(resolve, durationMs));

const fetchFalJson = async (fetchImpl: FetchLike, url: string, falKey: string) => {
  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      Authorization: `Key ${falKey}`,
    },
  });

  if (!response.ok) {
    throw normalizeFalError(response.status, await response.text());
  }

  return response.json();
};

const resolveQueuedFalResult = async (
  submission: FalQueueSubmission,
  fetchImpl: FetchLike,
  falKey: string,
  endpointUrl: string,
  maxStatusPolls = MAX_QUEUE_STATUS_POLLS,
) => {
  const statusUrl = submission.status_url ?? `${endpointUrl}/requests/${submission.request_id}/status`;
  const responseUrl = submission.response_url ?? `${endpointUrl}/requests/${submission.request_id}`;

  for (let pollIndex = 0; pollIndex < maxStatusPolls; pollIndex += 1) {
    const statusPayload = await fetchFalJson(fetchImpl, statusUrl, falKey) as { status?: string; response_url?: string; error?: unknown };

    if (statusPayload.status === "COMPLETED") {
      const resultPayload = await fetchFalJson(fetchImpl, statusPayload.response_url ?? responseUrl, falKey);
      return normalizeFalResult(resultPayload);
    }

    if (statusPayload.status === "FAILED" || statusPayload.status === "ERROR") {
      throw new Error(typeof statusPayload.error === "string" ? statusPayload.error : "fal.ai deneysel kombin istegi basarisiz oldu.");
    }

    await wait(QUEUE_STATUS_POLL_INTERVAL_MS);
  }

  throw new Error("fal.ai deneysel kombin istegi zaman asimina ugradi.");
};

export const generateExperimentalOutfitImage = async (
  payload: Record<string, unknown>,
  fetchImpl: FetchLike = fetch
) => {
  const { falKey } = getServerEnv();
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    const endpointUrl = resolveFalEndpoint(payload);
    const response = await fetchImpl(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${falKey}`
      },
      body: JSON.stringify(buildFalEditInput(payload))
    });

    if (response.ok) {
      const result = await response.json();
      return isFalQueueSubmission(result)
        ? resolveQueuedFalResult(result, fetchImpl, falKey, endpointUrl, resolveQueueStatusPolls(payload))
        : normalizeFalResult(result);
    }

    if (attempt === 0 && [408, 409, 425, 429, 500, 502, 503, 504].includes(response.status)) {
      attempt += 1;
      continue;
    }

    const detail = await response.text();
    throw normalizeFalError(response.status, detail);
  }

  throw new Error("fal.ai deneysel kombin istegi tamamlanamadi.");
};

export const generateGptSceneVariation = async (
  baseImage: string,
  scene: string,
  lighting: string,
  mode: string,
  customPrompt?: string,
  fetchImpl: FetchLike = fetch,
) => generateExperimentalOutfitImage(
  {
    provider: "gpt-image-2",
    prompt: buildGptScenePrompt(scene, lighting, customPrompt),
    imageInputs: [baseImage],
    imageSize: { width: 1024, height: 1024 },
    quality: mode === "pro" ? "high" : "low",
    maxQueueStatusPolls: mode === "pro" ? MAX_PRO_SCENE_QUEUE_STATUS_POLLS : MAX_QUEUE_STATUS_POLLS,
  },
  fetchImpl,
);
