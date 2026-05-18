import { describe, it, expect } from "vitest";
import { maskEmail } from "./email";

describe("maskEmail", () => {
  it("masks one-character local part fully", () => {
    expect(maskEmail("a@example.com")).toBe("*@example.com");
  });

  it("keeps first char of two-character local part", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("keeps first char of longer local parts", () => {
    expect(maskEmail("abc@example.com")).toBe("a**@example.com");
    expect(maskEmail("john.doe@example.com")).toBe("j*******@example.com");
  });

  it("passes through invalid inputs", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("missing@")).toBe("missing@");
    expect(maskEmail("@nodomain")).toBe("@nodomain");
  });
});