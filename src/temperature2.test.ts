import { describe, it, expect } from "vitest";
import { kelvinToCelsius, celsiusToKelvin } from "./temperature2";

describe("kelvinToCelsius", () => {
  it("converts absolute zero", () => {
    expect(kelvinToCelsius(0)).toBeCloseTo(-273.15);
  });

  it("converts freezing point", () => {
    expect(kelvinToCelsius(273.15)).toBeCloseTo(0);
  });

  it("converts boiling point", () => {
    expect(kelvinToCelsius(373.15)).toBeCloseTo(100);
  });

  it("converts body temperature", () => {
    expect(kelvinToCelsius(310.15)).toBeCloseTo(37);
  });
});

describe("celsiusToKelvin", () => {
  it("converts absolute zero (celsius)", () => {
    expect(celsiusToKelvin(-273.15)).toBeCloseTo(0);
  });

  it("converts freezing point", () => {
    expect(celsiusToKelvin(0)).toBeCloseTo(273.15);
  });

  it("converts boiling point", () => {
    expect(celsiusToKelvin(100)).toBeCloseTo(373.15);
  });

  it("converts body temperature", () => {
    expect(celsiusToKelvin(37)).toBeCloseTo(310.15);
  });
});

describe("error/edge-case paths", () => {
  describe("negative Kelvin (physically below absolute zero)", () => {
    it("kelvinToCelsius returns a value below -273.15 for negative Kelvin input", () => {
      // The function does not validate; it just subtracts. We lock that in
      // rather than letting it silently pass: negative Kelvin should produce
      // a sub-absolute-zero Celsius without throwing.
      expect(kelvinToCelsius(-1)).toBeCloseTo(-274.15);
    });

    it("kelvinToCelsius does not throw for negative Kelvin input", () => {
      expect(() => kelvinToCelsius(-50)).not.toThrow();
    });
  });

  describe("negative Celsius (below freezing)", () => {
    it("celsiusToKelvin returns a value below 273.15 for negative Celsius", () => {
      expect(celsiusToKelvin(-100)).toBeCloseTo(173.15);
    });

    it("celsiusToKelvin returns a value below 0 for Celsius below absolute zero", () => {
      // Below absolute zero on the Celsius side; the function does not clamp.
      expect(celsiusToKelvin(-300)).toBeCloseTo(-26.85);
    });

    it("celsiusToKelvin does not throw for extreme negative input", () => {
      expect(() => celsiusToKelvin(-1000)).not.toThrow();
    });
  });

  describe("NaN / Infinity", () => {
    it("kelvinToCelsius returns NaN for NaN input", () => {
      expect(Number.isNaN(kelvinToCelsius(Number.NaN))).toBe(true);
    });

    it("celsiusToKelvin returns NaN for NaN input", () => {
      expect(Number.isNaN(celsiusToKelvin(Number.NaN))).toBe(true);
    });

    it("kelvinToCelsius returns Infinity for Infinity input", () => {
      expect(kelvinToCelsius(Number.POSITIVE_INFINITY)).toBe(
        Number.POSITIVE_INFINITY,
      );
      expect(kelvinToCelsius(Number.NEGATIVE_INFINITY)).toBe(
        Number.NEGATIVE_INFINITY,
      );
    });

    it("celsiusToKelvin returns Infinity for Infinity input", () => {
      expect(celsiusToKelvin(Number.POSITIVE_INFINITY)).toBe(
        Number.POSITIVE_INFINITY,
      );
      expect(celsiusToKelvin(Number.NEGATIVE_INFINITY)).toBe(
        Number.NEGATIVE_INFINITY,
      );
    });

    it("does not throw on NaN", () => {
      expect(() => kelvinToCelsius(Number.NaN)).not.toThrow();
      expect(() => celsiusToKelvin(Number.NaN)).not.toThrow();
    });

    it("does not throw on Infinity", () => {
      expect(() => kelvinToCelsius(Number.POSITIVE_INFINITY)).not.toThrow();
      expect(() => kelvinToCelsius(Number.NEGATIVE_INFINITY)).not.toThrow();
      expect(() => celsiusToKelvin(Number.POSITIVE_INFINITY)).not.toThrow();
      expect(() => celsiusToKelvin(Number.NEGATIVE_INFINITY)).not.toThrow();
    });
  });

  describe("zero inputs", () => {
    it("kelvinToCelsius(0) returns the absolute-zero Celsius", () => {
      expect(kelvinToCelsius(0)).toBeCloseTo(-273.15);
    });

    it("celsiusToKelvin(0) returns the freezing-point Kelvin", () => {
      expect(celsiusToKelvin(0)).toBeCloseTo(273.15);
    });

    it("handles -0 without throwing and treats it as 0", () => {
      // -0 === 0 numerically, so the result should match the 0 case.
      expect(kelvinToCelsius(-0)).toBeCloseTo(-273.15);
      expect(celsiusToKelvin(-0)).toBeCloseTo(273.15);
    });
  });

  describe("round-trip identity", () => {
    it("kelvinToCelsius then celsiusToKelvin returns the original Kelvin value", () => {
      const samples = [0, 1, 100, 273.15, 310.15, 373.15, 500, 1000];
      for (const k of samples) {
        expect(celsiusToKelvin(kelvinToCelsius(k))).toBeCloseTo(k);
      }
    });

    it("celsiusToKelvin then kelvinToCelsius returns the original Celsius value", () => {
      const samples = [-273.15, -100, -40, 0, 25, 37, 100, 500];
      for (const c of samples) {
        expect(kelvinToCelsius(celsiusToKelvin(c))).toBeCloseTo(c);
      }
    });
  });

  describe("large values", () => {
    it("kelvinToCelsius handles very large Kelvin inputs without overflow", () => {
      // Surface of the Sun ~ 5778 K; core ~ 1.5e7 K; lock in that the
      // function does not throw and returns a finite, scaled result.
      expect(kelvinToCelsius(1.5e7)).toBeCloseTo(1.5e7 - 273.15);
      expect(kelvinToCelsius(5778)).toBeCloseTo(5778 - 273.15);
    });

    it("celsiusToKelvin handles very large Celsius inputs without overflow", () => {
      expect(celsiusToKelvin(1e7)).toBeCloseTo(1e7 + 273.15);
    });

    it("does not throw on large finite inputs", () => {
      expect(() => kelvinToCelsius(1e15)).not.toThrow();
      expect(() => celsiusToKelvin(1e15)).not.toThrow();
    });
  });
});
