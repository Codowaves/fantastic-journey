export function applyDiscount(price: number, percent: number): number {
  return price - price * (percent / 100);
}
