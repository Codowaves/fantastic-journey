/**
 * Computes a discounted price by subtracting a percentage from the original price.
 *
 * Throws when `price` or `pct` is `null`, `undefined`, or not a finite number.
 *
 * @param price - The original price before discount.
 * @param pct - The discount percentage to apply (e.g. `10` for 10% off).
 * @returns The price after the percentage discount has been applied.
 */
export function percentOff(price: number, pct: number): number {
  if (price === null || price === undefined || !Number.isFinite(price)) {
    throw new TypeError(
      `percentOff: 'price' must be a finite number, got ${String(price)}`,
    );
  }
  if (pct === null || pct === undefined || !Number.isFinite(pct)) {
    throw new TypeError(
      `percentOff: 'pct' must be a finite number, got ${String(pct)}`,
    );
  }
  return price - (price * pct) / 100;
}
