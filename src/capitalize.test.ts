import { describe, it, expect } from "vitest";
import { capitalize } from "./capitalize";

describe("capitalize", () => {
  it("capitalizes a normal word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("leaves already capitalized string unchanged", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("handles string starting with a digit", () => {
    expect(capitalize("9lives")).toBe("9lives");
  });

  it("only capitalizes first character, leaves rest untouched", () => {
    expect(capitalize("hello world")).toBe("Hello world");
  });

  it("throws on null", () => {
    // @ts-expect-error - testing runtime guard
    expect(() => capitalize(null)).toThrow(TypeError);
  });

  it("throws on undefined", () => {
    // @ts-expect-error - testing runtime guard
    expect(() => capitalize(undefined)).toThrow(TypeError);
  });

  it("throws on NaN", () => {
    // @ts-expect-error - testing runtime guard
    expect(() => capitalize(NaN)).toThrow(TypeError);
  });
});
