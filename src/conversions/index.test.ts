import { describe, it, expect } from "vitest";
import { celsiusToFahrenheit, fahrenheitToCelsius } from "./index";

describe("conversions index re-exports", () => {
  it("celsiusToFahrenheit handles the crossover point", () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it("celsiusToFahrenheit handles absolute zero", () => {
    expect(celsiusToFahrenheit(-273.15)).toBeCloseTo(-459.67);
  });

  it("celsiusToFahrenheit handles zero", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it("celsiusToFahrenheit handles empty expression result (0)", () => {
    const input: number = Number("");
    expect(celsiusToFahrenheit(input)).toBe(32);
  });

  it("celsiusToFahrenheit handles NaN input", () => {
    expect(Number.isNaN(celsiusToFahrenheit(Number.NaN))).toBe(true);
  });

  it("celsiusToFahrenheit handles Infinity", () => {
    expect(celsiusToFahrenheit(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(celsiusToFahrenheit(Number.NEGATIVE_INFINITY)).toBe(
      Number.NEGATIVE_INFINITY,
    );
  });

  it("fahrenheitToCelsius handles the crossover point", () => {
    expect(fahrenheitToCelsius(-40)).toBe(-40);
  });

  it("fahrenheitToCelsius handles zero", () => {
    expect(fahrenheitToCelsius(0)).toBeCloseTo(-17.7778, 3);
  });

  it("fahrenheitToCelsius handles absolute zero", () => {
    expect(fahrenheitToCelsius(-459.67)).toBeCloseTo(-273.15);
  });

  it("fahrenheitToCelsius handles NaN input", () => {
    expect(Number.isNaN(fahrenheitToCelsius(Number.NaN))).toBe(true);
  });

  it("fahrenheitToCelsius handles Infinity", () => {
    expect(fahrenheitToCelsius(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(fahrenheitToCelsius(Number.NEGATIVE_INFINITY)).toBe(
      Number.NEGATIVE_INFINITY,
    );
  });

  it("round-trips between functions", () => {
    expect(fahrenheitToCelsius(celsiusToFahrenheit(100))).toBeCloseTo(100);
    expect(fahrenheitToCelsius(celsiusToFahrenheit(-40))).toBeCloseTo(-40);
    expect(celsiusToFahrenheit(fahrenheitToCelsius(32))).toBeCloseTo(32);
  });
});
