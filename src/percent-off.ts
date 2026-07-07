/**
 * Computes a discounted price by subtracting a percentage from the original price.
 *
 * @param price - The original price before discount.
 * @param pct - The discount percentage to apply (e.g. `10` for 10% off).
 * @returns The price after the percentage discount has been applied.
 */
export function percentOff(price: number, pct: number): number {
  return price - (price * pct) / 100;
}
