import { describe, it, expect } from "vitest";
import { celsiusToFahrenheit, fahrenheitToCelsius } from "./temperature";

describe("celsiusToFahrenheit", () => {
  it("converts boiling point", () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it("converts freezing point", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it("converts body temperature", () => {
    expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6);
  });

  it("converts negative temperatures", () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it("throws on NaN", () => {
    expect(() => celsiusToFahrenheit(Number.NaN)).toThrow(TypeError);
  });

  it("throws on null", () => {
    expect(() => celsiusToFahrenheit(null as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws on undefined", () => {
    expect(() => celsiusToFahrenheit(undefined as unknown as number)).toThrow(
      TypeError,
    );
  });
});

describe("fahrenheitToCelsius", () => {
  it("converts freezing point", () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
  });

  it("converts boiling point", () => {
    expect(fahrenheitToCelsius(212)).toBe(100);
  });

  it("converts body temperature", () => {
    expect(fahrenheitToCelsius(98.6)).toBeCloseTo(37);
  });

  it("converts the crossover point", () => {
    expect(fahrenheitToCelsius(-40)).toBe(-40);
  });

  it("throws on NaN", () => {
    expect(() => fahrenheitToCelsius(Number.NaN)).toThrow(TypeError);
  });

  it("throws on null", () => {
    expect(() => fahrenheitToCelsius(null as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws on undefined", () => {
    expect(() => fahrenheitToCelsius(undefined as unknown as number)).toThrow(
      TypeError,
    );
  });
});
