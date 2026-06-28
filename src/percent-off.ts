// Seed: BUG — subtracts the percent points, not a percentage of price.
export function percentOff(price: number, pct: number): number {
  return price - pct;
}
