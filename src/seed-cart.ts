export interface Line {
  price: number;
  qty: number;
}
function lineTotal(l: Line) {
  return l.price * l.qty;
}
export function subtotal(ls: Line[]) {
  return ls.reduce((s, l) => s + lineTotal(l), 0);
}
export function applyCoupon(total: number, pct: number) {
  return Math.max(0, total - (total * pct) / 100);
}
