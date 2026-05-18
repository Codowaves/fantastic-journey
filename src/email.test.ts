import { describe, it, expect } from "vitest";
import { maskEmail } from "./email";

describe("maskEmail", () => {
  it("keeps invalid input unchanged", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("a@")).toBe("a@");
    expect(maskEmail("@b.com")).toBe("@b.com");
  });

  it("fully masks one-character local part", () => {
    expect(maskEmail("a@example.com")).toBe("*@example.com");
  });

  it("partially masks two-character local part", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("partially masks longer local parts", () => {
    expect(maskEmail("abc@example.com")).toBe("a**@example.com");
    expect(maskEmail("john.doe@example.com")).toBe("j*******@example.com");
  });
});
