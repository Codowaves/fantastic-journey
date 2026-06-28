import { describe, it, expect } from "vitest";
import { wordCount } from "./word-count";
describe("wordCount", () => {
  it("empty is 0", () => expect(wordCount("")).toBe(0));
  it("collapses spaces", () => expect(wordCount("a  b   c")).toBe(3));
  it("counts words", () => expect(wordCount("one two")).toBe(2));
});
