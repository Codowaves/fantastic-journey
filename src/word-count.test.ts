import { describe, it, expect } from "vitest";
import { wordCount } from "./word-count";
describe("wordCount", () => {
  it("empty is 0", () => expect(wordCount("")).toBe(0));
  it("collapses spaces", () => expect(wordCount("a  b   c")).toBe(3));
  it("counts words", () => expect(wordCount("one two")).toBe(2));
  it("whitespace-only returns 0", () => expect(wordCount("   \t\n  ")).toBe(0));
  it("trims leading/trailing whitespace", () =>
    expect(wordCount("  hello world  ")).toBe(2));
  it("throws TypeError when input is null", () => {
    expect(() => wordCount(null as unknown as string)).toThrow(TypeError);
  });
  it("throws TypeError when input is undefined", () => {
    expect(() => wordCount(undefined as unknown as string)).toThrow(TypeError);
  });
  it("throws TypeError when input is NaN", () => {
    expect(() => wordCount(Number.NaN as unknown as string)).toThrow(TypeError);
  });
});
