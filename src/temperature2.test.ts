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
