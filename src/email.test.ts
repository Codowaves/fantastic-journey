import { describe, it, expect } from "vitest";
import { maskEmail } from "./email";

describe("maskEmail", () => {
  it("fully masks single-character local part", () => {
    expect(maskEmail("a@example.com")).toBe("*@example.com");
  });

  it("masks two-character local part leaving first char", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("preserves two-char prefix for longer local parts", () => {
    expect(maskEmail("abc@example.com")).toBe("ab*@example.com");
  });

  it("preserves two-char prefix for many-char local parts", () => {
    expect(maskEmail("alice.smith@example.com")).toBe("al*********@example.com");
  });

  it("returns input for invalid emails", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("@example.com")).toBe("@example.com");
  });
});