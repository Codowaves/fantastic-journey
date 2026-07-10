import {
  celsiusToFahrenheit as celsiusToFahrenheitRaw,
  fahrenheitToCelsius as fahrenheitToCelsiusRaw,
} from "../temperature";

/**
 * Converts a temperature from Celsius to Fahrenheit.
 * @param c Temperature in degrees Celsius.
 * @returns Equivalent temperature in degrees Fahrenheit.
 * @throws {TypeError} If `c` is null, undefined, or NaN.
 */
export function celsiusToFahrenheit(c: number): number {
  if (c === null || c === undefined || Number.isNaN(c)) {
    throw new TypeError("c must be a number");
  }
  return celsiusToFahrenheitRaw(c);
}

/**
 * Converts a temperature from Fahrenheit to Celsius.
 * @param f Temperature in degrees Fahrenheit.
 * @returns Equivalent temperature in degrees Celsius.
 * @throws {TypeError} If `f` is null, undefined, or NaN.
 */
export function fahrenheitToCelsius(f: number): number {
  if (f === null || f === undefined || Number.isNaN(f)) {
    throw new TypeError("f must be a number");
  }
  return fahrenheitToCelsiusRaw(f);
}
