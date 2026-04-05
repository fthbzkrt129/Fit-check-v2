import { describe, expect, it } from "vitest";

import { getAuthStatusMessage } from "./messages";

describe("getAuthStatusMessage", () => {
  it("returns a friendly message for email rate limits", () => {
    expect(getAuthStatusMessage("email rate limit exceeded")).toBe(
      "Cok fazla e-posta denemesi yapildi. Lutfen biraz bekleyip tekrar dene."
    );
  });

  it("returns a friendly message for invalid credentials", () => {
    expect(getAuthStatusMessage("Invalid login credentials")).toBe(
      "E-posta veya sifre hatali. Bilgilerini kontrol edip tekrar dene."
    );
  });

  it("falls back to the original message for unknown errors", () => {
    expect(getAuthStatusMessage("unexpected error")).toBe("unexpected error");
  });
});
