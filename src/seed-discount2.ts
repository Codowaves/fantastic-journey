// BUG: forgets to divide by 100
export function discountedPrice(p: number, pct: number) {
  return p - (p * pct) / 100;
}
