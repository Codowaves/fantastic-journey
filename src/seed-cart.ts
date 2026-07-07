/**
 * A single cart line item pairing a per-unit price with the quantity ordered.
 */
export interface Line {
  price: number;
  qty: number;
}
function lineTotal(l: Line) {
  return l.price * l.qty;
}
/**
 * Sums the `price * qty` of each line in the cart.
 *
 * @param ls - The cart lines to total. An empty array returns 0.
 * @returns The cumulative cart subtotal across all lines.
 */
export function subtotal(ls: Line[]) {
  return ls.reduce((s, l) => s + lineTotal(l), 0);
}
/**
 * Applies a percentage discount to a total, clamping the result to a minimum of 0.
 *
 * @param total - The pre-discount total amount.
 * @param pct - The discount percentage (e.g. `20` for 20% off).
 * @returns The discounted total, or 0 if the discount would otherwise go negative.
 */
export function applyCoupon(total: number, pct: number) {
  return Math.max(0, total - (total * pct) / 100);
}
