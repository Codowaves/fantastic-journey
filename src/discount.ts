// Seed file for the Codowave bug-fix scenario.
// BUG: the percentage is not divided by 100, so every discount is wildly wrong.
export function applyDiscount(price: number, percent: number): number {
  return price - price * percent;
}
