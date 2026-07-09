/**
 * Converts a temperature from Celsius to Fahrenheit.
 * @param c Temperature in degrees Celsius.
 * @returns Equivalent temperature in degrees Fahrenheit.
 */
export function celsiusToFahrenheit(c: number): number {
  if (c === null || c === undefined || Number.isNaN(c)) {
    throw new TypeError("c must be a number");
  }
  return (c * 9) / 5 + 32;
}

/**
 * Converts a temperature from Fahrenheit to Celsius.
 * @param f Temperature in degrees Fahrenheit.
 * @returns Equivalent temperature in degrees Celsius.
 */
export function fahrenheitToCelsius(f: number): number {
  if (f === null || f === undefined || Number.isNaN(f)) {
    throw new TypeError("f must be a number");
  }
  return ((f - 32) * 5) / 9;
}
