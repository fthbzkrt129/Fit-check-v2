import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getServerEnv: vi.fn()
}));

import { getServerEnv } from "@/lib/env";

import { __private__, generateVirtualTryOnImage } from "./providers/geminiServer";
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
      json: async () => ({ imageUrl: "generated-image" })
    });

    expect(__private__.buildVirtualTryOnPrompt("top")).toContain("virtual-try-on");
    await expect(generateVirtualTryOnImage("model", "garment", "top", fetchImpl as typeof fetch)).resolves.toBe(
      "generated-image"
    );
    expect(fetchImpl).toHaveBeenCalled();
    expect(getServerEnv).toHaveBeenCalled();
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
});
