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

  it("throws TypeError when input is null or undefined", () => {
    expect(() => kelvinToCelsius(null as unknown as number)).toThrow(TypeError);
    expect(() => kelvinToCelsius(undefined as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when input is NaN", () => {
    expect(() => kelvinToCelsius(Number.NaN)).toThrow(TypeError);
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

  it("throws TypeError when input is null or undefined", () => {
    expect(() => celsiusToKelvin(null as unknown as number)).toThrow(TypeError);
    expect(() => celsiusToKelvin(undefined as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when input is NaN", () => {
    expect(() => celsiusToKelvin(Number.NaN)).toThrow(TypeError);
  });
});
