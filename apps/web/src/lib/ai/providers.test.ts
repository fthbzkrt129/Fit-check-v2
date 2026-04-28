import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getServerEnv: vi.fn()
}));

import { getServerEnv } from "@/lib/env";

import { __private__, generateModelImage, generateVirtualTryOnImage } from "./providers/geminiServer";
import { generateExperimentalOutfitImage } from "./providers/falServer";

describe("ai providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerEnv).mockReturnValue({
      geminiApiKey: "gemini-secret",
      falKey: "fal-secret",
      supabaseServiceRoleKey: "service-role"
    });
  });

  it("reads server env only and preserves prompt builder behavior", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'generated-image-bytes'
                  }
                }
              ]
            }
          }
        ]
      })
    });

    const prompt = __private__.buildVirtualTryOnPrompt("top", "hip", undefined, undefined);

    expect(prompt).toContain('hip');
    expect(prompt).toContain('Replace only the upper-body garment');
    await expect(generateVirtualTryOnImage("data:image/png;base64,model", "data:image/png;base64,garment", "top", "hip", undefined, undefined, fetchImpl as typeof fetch)).resolves.toBe(
      "data:image/png;base64,generated-image-bytes"
    );
    expect(fetchImpl).toHaveBeenCalled();
    expect(getServerEnv).toHaveBeenCalled();
  });

  it('uses the rich scene prompt and the pro scene model when requested', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'scene-image-bytes',
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    const { generateSceneVariation } = await import('./providers/geminiServer');

    await expect(
      generateSceneVariation('data:image/png;base64,base', 'street', 'golden hour', 'pro', 'rooftop terrace', fetchImpl as typeof fetch),
    ).resolves.toBe('data:image/png;base64,scene-image-bytes');

    const requestUrl = fetchImpl.mock.calls[0]?.[0];
    const requestBody = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);

    expect(String(requestUrl)).toContain('gemini-3.1-flash-image-preview');
    expect(JSON.stringify(requestBody)).toContain('rooftop terrace');
    expect(JSON.stringify(requestBody)).toContain('premium lifestyle glow');
  });

  it('uses the fit-check full-body ecommerce model prompt for initial model generation', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'model-image-bytes',
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    await expect(generateModelImage('data:image/png;base64,base-model', fetchImpl as typeof fetch)).resolves.toBe(
      'data:image/png;base64,model-image-bytes',
    );

    const requestBody = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    const requestPrompt = requestBody.contents[0].parts[1].text;

    expect(requestPrompt).toBe("You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo suitable for an e-commerce website. The background must be a clean, neutral studio backdrop (light gray, #f0f0f0). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.");
  });

  it("keeps bounded retry and normalized fal errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "temporary" })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ imageUrl: "fal-image" }) });

    await expect(generateExperimentalOutfitImage({ prompt: "x" }, fetchImpl as typeof fetch)).resolves.toBe(
      "fal-image"
    );
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('extracts fal image urls from queued result payloads', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          images: [
            {
              url: 'https://fal.example/generated.png',
            },
          ],
        },
      }),
    });

    await expect(generateExperimentalOutfitImage({ prompt: 'x' }, fetchImpl as typeof fetch)).resolves.toBe(
      'https://fal.example/generated.png',
    );
  });
});
