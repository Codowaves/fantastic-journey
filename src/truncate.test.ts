import { describe, it, expect } from "vitest";
import { truncate } from "./truncate";

describe("truncate", () => {
  it("returns short strings unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns exact-length strings unchanged", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    const result = truncate("hello world", 8);
    expect(result).toBe("hello w…");
    expect(result.length).toBe(8);
  });

  it("handles single character result", () => {
    const result = truncate("hello", 1);
    expect(result).toBe("…");
    expect(result.length).toBe(1);
  });

  it("throws RangeError for non-integer maxLength", () => {
    expect(() => truncate("hello", 1.5)).toThrow(RangeError);
    expect(() => truncate("hello", 3.14)).toThrow(RangeError);
  });

  it("throws RangeError for maxLength < 1", () => {
    expect(() => truncate("hello", 0)).toThrow(RangeError);
    expect(() => truncate("hello", -5)).toThrow(RangeError);
  });

  it("throws RangeError with descriptive message", () => {
    expect(() => truncate("hello", 0)).toThrow(
      "maxLength must be an integer >= 1",
    );
  });

  it("returns empty string unchanged when input is empty", () => {
    expect(truncate("", 10)).toBe("");
    expect(truncate("", 1)).toBe("");
  });

  it("truncates empty string to ellipsis when maxLength is 1 and input has content", () => {
    // Already covered by single-character test, but reinforce boundary
    expect(truncate("a", 1)).toBe("a");
  });

  it("truncates string longer than maxLength by exactly one character before ellipsis", () => {
    const result = truncate("abcdefghij", 4);
    expect(result).toBe("abc…");
    expect(result.length).toBe(4);
  });

  it("handles maxLength of 1 as a valid lower boundary", () => {
    expect(() => truncate("hello", 1)).not.toThrow();
  });

  it("throws RangeError when maxLength is NaN", () => {
    expect(() => truncate("hello", NaN)).toThrow(RangeError);
  });

  it("throws RangeError for Infinity maxLength", () => {
    expect(() => truncate("hello", Infinity)).toThrow(RangeError);
  });
});
