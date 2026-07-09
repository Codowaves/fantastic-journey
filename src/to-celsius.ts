/**
 * Converts a temperature from Fahrenheit to Celsius.
 * @param f - Temperature in degrees Fahrenheit.
 * @returns Equivalent temperature in degrees Celsius.
 *
 * @example
 * toCelsius(32);
 * // 0
 * toCelsius(212);
 * // 100
 * toCelsius(-40);
 * // -40
 */
export function toCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
