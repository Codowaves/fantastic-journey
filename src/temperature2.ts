/**
 * Converts a temperature from Kelvin to Celsius.
 * @param k - Temperature in Kelvin.
 * @returns Temperature in Celsius.
 */
export function kelvinToCelsius(k: number): number {
  return k - 273.15;
}

/**
 * Converts a temperature from Celsius to Kelvin.
 * @param c - Temperature in Celsius.
 * @returns Temperature in Kelvin.
 */
export function celsiusToKelvin(c: number): number {
  return c + 273.15;
}
