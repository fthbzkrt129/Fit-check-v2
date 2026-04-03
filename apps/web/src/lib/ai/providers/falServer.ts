import { getServerEnv } from "@/lib/env";

type FetchLike = typeof fetch;

const MAX_ATTEMPTS = 2;

const normalizeFalError = (status: number, detail?: string) => {
  if (status === 401 || status === 403) {
    return new Error("fal.ai kimlik dogrulamasi basarisiz.");
  }

  return new Error(detail || "fal.ai deneysel kombin istegi tamamlanamadi.");
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
      const data = (await response.json()) as { imageUrl?: string };
      if (!data.imageUrl) {
        throw new Error("fal.ai sonucu gorsel dondurmedi.");
      }

      return data.imageUrl;
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
