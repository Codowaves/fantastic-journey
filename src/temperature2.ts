/**
 * Converts a temperature from Kelvin to Celsius.
 * @param k - Temperature in Kelvin.
 * @returns Temperature in Celsius.
 * @throws {TypeError} If `k` is null, undefined, or NaN.
 */
export function kelvinToCelsius(k: number): number {
  if (k === null || k === undefined || Number.isNaN(k)) {
    throw new TypeError("k must be a number");
  }
  return k - 273.15;
}

/**
 * Converts a temperature from Celsius to Kelvin.
 * @param c - Temperature in Celsius.
 * @returns Temperature in Kelvin.
 * @throws {TypeError} If `c` is null, undefined, or NaN.
 */
export function celsiusToKelvin(c: number): number {
  if (c === null || c === undefined || Number.isNaN(c)) {
    throw new TypeError("c must be a number");
  }
  return c + 273.15;
}
