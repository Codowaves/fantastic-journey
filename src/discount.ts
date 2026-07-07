/**
 * Returns the price after subtracting `percent` percent of the original amount.
 *
 * @param price The original price.
 * @param percent The discount percentage to subtract (e.g., `20` for 20% off).
 * @returns The discounted price.
 */
export function applyDiscount(price: number, percent: number): number {
  return price - (price * percent) / 100;
}
