import {
  celsiusToFahrenheit as celsiusToFahrenheitRaw,
  fahrenheitToCelsius as fahrenheitToCelsiusRaw,
} from "../temperature";

function ensureTemp(value: number, name: string): number {
  if (value === null || value === undefined) {
    throw new TypeError(
      `conversions: ${name} must be a number, got ${value === null ? "null" : "undefined"}`,
    );
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(
      `conversions: ${name} must be a finite number, got ${String(value)}`,
    );
  }
  return value;
}

/**
 * Converts a temperature from Celsius to Fahrenheit.
 *
 * Throws when `c` is `null`, `undefined`, or `NaN`.
 *
 * @param c - Temperature in degrees Celsius.
 * @returns Equivalent temperature in degrees Fahrenheit.
 */
export function celsiusToFahrenheit(c: number): number {
  return celsiusToFahrenheitRaw(ensureTemp(c, "c"));
}

/**
 * Converts a temperature from Fahrenheit to Celsius.
 *
 * Throws when `f` is `null`, `undefined`, or `NaN`.
 *
 * @param f - Temperature in degrees Fahrenheit.
 * @returns Equivalent temperature in degrees Celsius.
 */
export function fahrenheitToCelsius(f: number): number {
  return fahrenheitToCelsiusRaw(ensureTemp(f, "f"));
}
