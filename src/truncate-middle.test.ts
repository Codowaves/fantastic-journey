import { describe, it, expect } from "vitest";
import { truncateMiddle } from "./truncate-middle";

describe("truncateMiddle", () => {
  it("returns short strings unchanged", () => {
    expect(truncateMiddle("hello", 10)).toBe("hello");
  });

  it("returns exact-length strings unchanged", () => {
    expect(truncateMiddle("hello", 5)).toBe("hello");
  });

  it("returns empty string unchanged", () => {
    expect(truncateMiddle("", 5)).toBe("");
  });

  it("returns empty string for maxLength greater than empty", () => {
    expect(truncateMiddle("", 1)).toBe("");
  });

  it("truncates the middle of a long string with an ellipsis", () => {
    const result = truncateMiddle("abcdefghij", 6);
    expect(result).toBe("abc…ij");
    expect(result.length).toBe(6);
  });

  it("truncates asymmetrically to fit the target length exactly", () => {
    const result = truncateMiddle("abcdefghij", 7);
    expect(result.length).toBe(7);
    expect(result).toContain("…");
  });

  it("returns only an ellipsis when maxLength is 1", () => {
    expect(truncateMiddle("hello world", 1)).toBe("…");
  });

  it("preserves the start of the string", () => {
    const result = truncateMiddle("abcdefghij", 6);
    expect(result.startsWith("abc")).toBe(true);
  });

  it("preserves the end of the string", () => {
    const result = truncateMiddle("abcdefghij", 6);
    expect(result.endsWith("ij")).toBe(true);
  });

  it("keeps the result within the maxLength budget", () => {
    for (const len of [1, 2, 3, 4, 5, 6, 7, 8, 10, 20]) {
      const result = truncateMiddle("the quick brown fox jumps over", len);
      expect(result.length).toBeLessThanOrEqual(len);
    }
  });

  it("handles very long strings", () => {
    const longStr = "a".repeat(1000) + "middle" + "b".repeat(1000);
    const result = truncateMiddle(longStr, 10);
    expect(result.length).toBe(10);
    expect(result).toContain("…");
    expect(result.startsWith("aaa")).toBe(true);
    expect(result.endsWith("bbb")).toBe(true);
  });

  it("throws RangeError for non-integer maxLength", () => {
    expect(() => truncateMiddle("hello", 1.5)).toThrow(RangeError);
    expect(() => truncateMiddle("hello", 3.14)).toThrow(RangeError);
  });

  it("throws RangeError for maxLength < 1", () => {
    expect(() => truncateMiddle("hello", 0)).toThrow(RangeError);
    expect(() => truncateMiddle("hello", -5)).toThrow(RangeError);
  });

  it("throws RangeError with descriptive message", () => {
    expect(() => truncateMiddle("hello", 0)).toThrow(
      "maxLength must be an integer >= 1",
    );
  });
});
