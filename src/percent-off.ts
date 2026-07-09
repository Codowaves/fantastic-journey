/**
 * Computes a discounted price by subtracting a percentage from the original price.
 *
 * @param price - The original price before discount.
 * @param pct - The discount percentage to apply (e.g. `10` for 10% off).
 * @returns The price after the percentage discount has been applied.
 * @throws {TypeError} If `price` is null, undefined, or NaN.
 * @throws {TypeError} If `pct` is null, undefined, or NaN.
 */
export function percentOff(price: number, pct: number): number {
  if (price === null || price === undefined || Number.isNaN(price)) {
    throw new TypeError("price must be a number");
  }
  if (pct === null || pct === undefined || Number.isNaN(pct)) {
    throw new TypeError("pct must be a number");
  }
  return price - (price * pct) / 100;
}
