/**
 * Converts a temperature from Fahrenheit to Celsius.
 * @param f Temperature in degrees Fahrenheit.
 * @returns Equivalent temperature in degrees Celsius.
 */
export function toCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
