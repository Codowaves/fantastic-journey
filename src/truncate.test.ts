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

  it("returns empty string unchanged", () => {
    expect(truncate("", 10)).toBe("");
    expect(truncate("", 1)).toBe("");
  });

  it("throws RangeError for NaN or Infinity maxLength", () => {
    expect(() => truncate("hello", NaN)).toThrow(RangeError);
    expect(() => truncate("hello", Infinity)).toThrow(RangeError);
  });
});
