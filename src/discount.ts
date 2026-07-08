/**
 * Returns the price after subtracting `percent` percent of the original amount.
 *
 * @param price The original price.
 * @param percent The discount percentage to subtract (e.g., `20` for 20% off).
 * @returns The discounted price.
 *
 * @example
 * applyDiscount(100, 20); // 80
 * applyDiscount(50, 10);  // 45
 */
export function applyDiscount(price: number, percent: number): number {
  return price - (price * percent) / 100;
}
