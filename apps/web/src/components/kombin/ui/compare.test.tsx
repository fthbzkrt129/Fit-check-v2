import { describe, expect, test, vi } from "vitest";

vi.mock("@tsparticles/react", () => {
  throw new Error("tsparticles should not load during Compare module import");
});

vi.mock("@tsparticles/slim", () => {
  throw new Error("tsparticles slim should not load during Compare module import");
});

describe("Compare", () => {
  test("does not load browser-only particle runtime during module import", async () => {
    const module = await import("./compare");

    expect(module.Compare).toBeTypeOf("function");
  });
});
