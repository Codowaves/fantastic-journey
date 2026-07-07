/**
 * Converts a temperature from Celsius to Fahrenheit.
 * @param c Temperature in degrees Celsius.
 * @returns Equivalent temperature in degrees Fahrenheit.
 */
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

/**
 * Converts a temperature from Fahrenheit to Celsius.
 * @param f Temperature in degrees Fahrenheit.
 * @returns Equivalent temperature in degrees Celsius.
 */
export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
