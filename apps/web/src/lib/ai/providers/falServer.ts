import { getServerEnv } from "@/lib/env";

type FetchLike = typeof fetch;

const MAX_ATTEMPTS = 2;

const normalizeFalError = (status: number, detail?: string) => {
  if (status === 401 || status === 403) {
    return new Error("fal.ai kimlik dogrulamasi basarisiz.");
  }

  return new Error(detail || "fal.ai deneysel kombin istegi tamamlanamadi.");
};

const normalizeFalResult = (result: unknown): string => {
  const payload = result as {
    imageUrl?: unknown;
    data?: {
      images?: unknown[];
      image?: unknown;
    };
  };
  const firstImage = payload.data?.images?.[0] as { url?: unknown } | string | undefined;

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

export const generateExperimentalOutfitImage = async (
  payload: Record<string, unknown>,
  fetchImpl: FetchLike = fetch
) => {
  const { falKey } = getServerEnv();
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    const response = await fetchImpl("https://queue.fal.run/fal-ai/wan/v2.7/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${falKey}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return normalizeFalResult(await response.json());
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
