import { describe, expect, it } from "vitest";

import { experimentalRequestSchema, modelRequestSchema, tryOnRequestSchema } from "./contracts";

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

  it('requires a matching length for top, dress, and outerwear try-on requests', () => {
    const topMissingLength = tryOnRequestSchema.safeParse({
      workspaceSlug: 'demo',
      modelImage: 'base64',
      garmentImage: 'base64',
      category: 'top',
    });

    const dressMissingLength = tryOnRequestSchema.safeParse({
      workspaceSlug: 'demo',
      modelImage: 'base64',
      garmentImage: 'base64',
      category: 'dress',
    });

    const outerwearMissingLength = tryOnRequestSchema.safeParse({
      workspaceSlug: 'demo',
      modelImage: 'base64',
      garmentImage: 'base64',
      category: 'outerwear',
    });

    expect(topMissingLength.success).toBe(false);
    expect(dressMissingLength.success).toBe(false);
    expect(outerwearMissingLength.success).toBe(false);
  });

  it('rejects unrelated length fields for the selected category', () => {
    const invalid = tryOnRequestSchema.safeParse({
      workspaceSlug: 'demo',
      modelImage: 'base64',
      garmentImage: 'base64',
      category: 'top',
      topLength: 'hip',
      dressLength: 'midi',
    });

    expect(invalid.success).toBe(false);
  });

  it('rejects malformed image payloads before they reach the provider', () => {
    const invalid = tryOnRequestSchema.safeParse({
      workspaceSlug: 'demo',
      modelImage: 'not-a-data-url',
      garmentImage: 'also-not-a-data-url',
      category: 'top',
      topLength: 'hip',
    });

    expect(invalid.success).toBe(false);
  });

  it('requires workspace scoping for base model generation requests', () => {
    const invalid = modelRequestSchema.safeParse({
      userImage: 'data:image/png;base64,model',
    });

    expect(invalid.success).toBe(false);
  });
});
