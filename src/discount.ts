/**
 * Returns the price after subtracting `percent` percent of the original amount.
 *
 * Edge cases:
 * - `percent` of `0` returns `price` unchanged (no discount applied).
 * - `percent` of `100` returns `0` (full discount).
 * - Negative `percent` increases the price (subtracts a negative percentage).
 * - `percent` greater than `100` yields a negative result.
 * - `NaN` inputs propagate as `NaN`.
 *
 * @param price The original price.
 * @param percent The discount percentage to subtract (e.g., `20` for 20% off).
 * @returns The discounted price.
 *
 * @example
 * applyDiscount(100, 20);
 * // 80
 * applyDiscount(50, 0);
 * // 50
 * applyDiscount(100, 100);
 * // 0
 */
export function applyDiscount(price: number, percent: number): number {
  if (!Number.isFinite(price)) {
    throw new RangeError(`price must be a finite number, got ${price}`);
  }
  if (!Number.isFinite(percent)) {
    throw new RangeError(`percent must be a finite number, got ${percent}`);
  }
  return price - (price * percent) / 100;
}
