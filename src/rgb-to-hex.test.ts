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

  describe("upper-clamp branch (value > 255)", () => {
    it("clamps a single channel above 255", () => {
      expect(rgbToHex(256, 0, 0)).toBe("#ff0000");
    });

    it("clamps a very large positive value", () => {
      expect(rgbToHex(1_000_000, 0, 0)).toBe("#ff0000");
    });

    it("clamps all three channels above 255", () => {
      expect(rgbToHex(999, 888, 777)).toBe("#ffffff");
    });

    it("clamps when only green exceeds 255", () => {
      expect(rgbToHex(0, 300, 0)).toBe("#00ff00");
    });

    it("clamps when only blue exceeds 255", () => {
      expect(rgbToHex(0, 0, 500)).toBe("#0000ff");
    });
  });

  describe("lower-clamp branch (value < 0)", () => {
    it("clamps a single negative channel to 0", () => {
      expect(rgbToHex(-1, 0, 0)).toBe("#000000");
    });

    it("clamps a very large negative value", () => {
      expect(rgbToHex(-1_000_000, 0, 0)).toBe("#000000");
    });

    it("clamps all three negative channels", () => {
      expect(rgbToHex(-50, -50, -50)).toBe("#000000");
    });

    it("clamps when only green is negative", () => {
      expect(rgbToHex(255, -10, 255)).toBe("#ff00ff");
    });

    it("clamps when only blue is negative", () => {
      expect(rgbToHex(255, 255, -1)).toBe("#ffff00");
    });
  });

  describe("rounding fallback branch (fractional inputs)", () => {
    it("rounds .5 values up", () => {
      expect(rgbToHex(0.5, 1.5, 2.5)).toBe("#010203");
    });

    it("rounds values just below a whole number down", () => {
      expect(rgbToHex(15.4, 127.4, 255.4)).toBe("#0f7fff");
    });

    it("rounds values just above a whole number up", () => {
      expect(rgbToHex(15.6, 127.6, 255.6)).toBe("#1080ff");
    });

    it("clamps and rounds when a fractional value exceeds 255", () => {
      expect(rgbToHex(254.6, 0, 0)).toBe("#ff0000");
    });

    it("clamps and rounds when a fractional value is negative", () => {
      expect(rgbToHex(-0.4, -0.4, -0.4)).toBe("#000000");
    });
  });

  describe("NaN inputs (error-path through clamp)", () => {
    it("renders NaN for a NaN red channel without throwing", () => {
      expect(rgbToHex(Number.NaN, 0, 0)).toBe("#NaN0000");
    });

    it("renders NaN for a NaN green channel without throwing", () => {
      expect(rgbToHex(0, Number.NaN, 0)).toBe("#00NaN00");
    });

    it("renders NaN for a NaN blue channel without throwing", () => {
      expect(rgbToHex(0, 0, Number.NaN)).toBe("#0000NaN");
    });

    it("renders NaN for all NaN channels without throwing", () => {
      expect(rgbToHex(Number.NaN, Number.NaN, Number.NaN)).toBe("#NaNNaNNaN");
    });

    it("does not throw on NaN inputs", () => {
      expect(() => rgbToHex(Number.NaN, 0, 0)).not.toThrow();
      expect(() => rgbToHex(Number.NaN, Number.NaN, Number.NaN)).not.toThrow();
    });
  });

  describe("Infinity inputs (error-path through clamp)", () => {
    it("clamps positive Infinity on the red channel to 255", () => {
      expect(rgbToHex(Number.POSITIVE_INFINITY, 0, 0)).toBe("#ff0000");
    });

    it("clamps positive Infinity on the green channel to 255", () => {
      expect(rgbToHex(0, Number.POSITIVE_INFINITY, 0)).toBe("#00ff00");
    });

    it("clamps positive Infinity on the blue channel to 255", () => {
      expect(rgbToHex(0, 0, Number.POSITIVE_INFINITY)).toBe("#0000ff");
    });

    it("clamps negative Infinity on the red channel to 0", () => {
      expect(rgbToHex(Number.NEGATIVE_INFINITY, 0, 0)).toBe("#000000");
    });

    it("clamps all three channels at Infinity", () => {
      expect(
        rgbToHex(
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY,
        ),
      ).toBe("#ff00ff");
    });

    it("does not throw on Infinity inputs", () => {
      expect(() => rgbToHex(Number.POSITIVE_INFINITY, 0, 0)).not.toThrow();
      expect(() => rgbToHex(Number.NEGATIVE_INFINITY, 0, 0)).not.toThrow();
      expect(() =>
        rgbToHex(
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY,
        ),
      ).not.toThrow();
    });
  });

  describe("non-finite / type-confused inputs", () => {
    it("treats undefined as NaN and renders 'NaN' for the channel", () => {
      expect(rgbToHex(undefined as unknown as number, 0, 0)).toBe("#NaN0000");
    });

    it("treats null as 0 and clamps", () => {
      expect(rgbToHex(null as unknown as number, 0, 0)).toBe("#000000");
    });

    it("does not throw on undefined or null channel values", () => {
      expect(() =>
        rgbToHex(undefined as unknown as number, 0, 0),
      ).not.toThrow();
      expect(() => rgbToHex(null as unknown as number, 0, 0)).not.toThrow();
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on normal inputs", () => {
      expect(() => rgbToHex(0, 0, 0)).not.toThrow();
      expect(() => rgbToHex(255, 255, 255)).not.toThrow();
      expect(() => rgbToHex(128, 64, 32)).not.toThrow();
    });

    it("does not throw on degenerate numeric inputs", () => {
      expect(() => rgbToHex(Number.NaN, Number.NaN, Number.NaN)).not.toThrow();
      expect(() =>
        rgbToHex(
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY,
        ),
      ).not.toThrow();
    });

    it("always returns a string of length 7", () => {
      expect(rgbToHex(0, 0, 0)).toHaveLength(7);
      expect(rgbToHex(255, 255, 255)).toHaveLength(7);
      expect(rgbToHex(15.7, 15.3, 200.6)).toHaveLength(7);
      expect(rgbToHex(-50, 999, 128)).toHaveLength(7);
    });

    it("always begins with '#'", () => {
      expect(rgbToHex(0, 0, 0).startsWith("#")).toBe(true);
      expect(rgbToHex(255, 255, 255).startsWith("#")).toBe(true);
      expect(rgbToHex(-50, 999, 128).startsWith("#")).toBe(true);
    });
  });
});
