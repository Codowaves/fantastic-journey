import { describe, expect, it } from "vitest";

import { rgbToHex } from "./rgb-to-hex";

describe("rgbToHex", () => {
  it("converts pure black", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("converts pure white", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
  });

  it("converts pure red", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
  });

  it("converts a custom color and zero-pads each channel", () => {
    expect(rgbToHex(1, 2, 3)).toBe("#010203");
  });

  it("clamps out-of-range values", () => {
    expect(rgbToHex(300, -50, 128)).toBe("#ff0080");
  });

  it("rounds fractional values", () => {
    expect(rgbToHex(15.7, 15.3, 200.6)).toBe("#100fc9");
  });
});
