import { describe, expect, it } from "vitest";

import { experimentalRequestSchema, tryOnRequestSchema } from "./contracts";

describe("ai contracts", () => {
  it("rejects invalid garment categories and malformed payloads", () => {
    const invalid = tryOnRequestSchema.safeParse({
      workspaceSlug: "demo",
      modelImage: "base64",
      garmentImage: "base64",
      category: "hat"
    });

    expect(invalid.success).toBe(false);
  });

  it("rejects incomplete experimental bundle payloads", () => {
    const invalid = experimentalRequestSchema.safeParse({
      workspaceSlug: "demo",
      baseModelImage: "base64",
      imageInputs: [],
      garments: [],
      prompt: ""
    });

    expect(invalid.success).toBe(false);
  });
});
