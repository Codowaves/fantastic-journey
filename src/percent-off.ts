export function percentOff(price: number, pct: number): number {
  return price - (price * pct) / 100;
}
