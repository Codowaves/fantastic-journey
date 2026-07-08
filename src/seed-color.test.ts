import { describe, expect, it } from "vitest";

import { lighten } from "./seed-color";

describe("lighten", () => {
  it("adds the amount to each channel of a mid-range color", () => {
    expect(lighten("#101010", 10)).toBe("#1a1a1a");
  });

  it("lightens pure red by a small amount", () => {
    expect(lighten("#ff0000", 1)).toBe("#ff0101");
  });

  it("clamps each channel at 255 when amount overflows", () => {
    expect(lighten("#ffffff", 50)).toBe("#ffffff");
  });

  it("clamps a near-white channel that would otherwise exceed 255", () => {
    expect(lighten("#f0f0f0", 20)).toBe("#ffffff");
  });

  it("returns the same color when amount is zero", () => {
    expect(lighten("#abcdef", 0)).toBe("#abcdef");
  });

  it("returns a lowercase hex string", () => {
    expect(lighten("#FF8800", 10)).toBe("#ff920a");
  });

  it("zero-pads the result to six hex digits", () => {
    expect(lighten("#000001", 1)).toBe("#010102");
  });

  it("lightens pure black by the given amount", () => {
    expect(lighten("#000000", 32)).toBe("#202020");
  });

  it("handles large amounts that overflow every channel", () => {
    expect(lighten("#123456", 1000)).toBe("#ffffff");
  });

  it("falls back to a zero color when hex contains non-hex characters", () => {
    // parseInt("@…", 16) is NaN; NaN propagated through << and | yields 0.
    expect(lighten("#@@@@@@", 0)).toBe("#000000");
  });

  it("falls back to a zero color when hex omits the leading #", () => {
    // slice(1) of "zzzzzz" → "zzzzz"; parseInt → NaN → 0.
    expect(lighten("zzzzzz", 0)).toBe("#000000");
  });

  it("falls back to a zero color when amt is NaN", () => {
    // NaN added to each channel; Math.min(255, NaN) is NaN; bitwise ops on NaN yield 0.
    expect(lighten("#808080", Number.NaN)).toBe("#000000");
  });

  it("throws TypeError when hex is null", () => {
    expect(() => lighten(null as unknown as string, 0)).toThrow(TypeError);
  });

  it("throws TypeError when hex is undefined", () => {
    expect(() => lighten(undefined as unknown as string, 0)).toThrow(TypeError);
  });

  it("parses a hex string shorter than seven characters as a single integer", () => {
    // "#fff" → slice(1) → "ff" → 255 → r=0, g=0, b=255 → "#000fff"
    expect(lighten("#fff", 0)).toBe("#000fff");
  });

  it("subtracts when amt is negative", () => {
    expect(lighten("#202020", -10)).toBe("#161616");
  });
});
