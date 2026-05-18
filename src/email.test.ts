import { describe, it, expect } from "vitest";
import { maskEmail } from "./email.js";

describe("maskEmail", () => {
  it("masks single-character local part fully", () => {
    expect(maskEmail("a@example.com")).toBe("*@example.com");
  });

  it("masks two-character local part keeping first char", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("preserves longer local parts with partial masking", () => {
    expect(maskEmail("abc@example.com")).toBe("ab*@example.com");
    expect(maskEmail("john.doe@example.com")).toBe("john.do******@example.com");
  });

  it("passes through invalid inputs unchanged", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("@example.com")).toBe("@example.com");
    expect(maskEmail("local@")).toBe("local@");
  });
});