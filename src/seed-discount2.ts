/**
 * Computes a discounted price by subtracting a percentage from the original price.
 *
 * @param p - The original price before discount.
 * @param pct - The discount percentage to apply (e.g. `10` for 10% off).
 * @returns The price after the percentage discount has been applied.
 */
// BUG: forgets to divide by 100
export function discountedPrice(p: number, pct: number) {
  return p - (p * pct) / 100;
}
