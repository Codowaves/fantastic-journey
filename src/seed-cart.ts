/**
 * A single cart line item pairing a per-unit price with the quantity ordered.
 */
export interface Line {
  price: number;
  qty: number;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && !Number.isNaN(n);
}

function lineTotal(l: Line) {
  return l.price * l.qty;
}

/**
 * Sums the `price * qty` of each line in the cart.
 *
 * @param ls - The cart lines to total. An empty array returns 0.
 * @returns The cumulative cart subtotal across all lines.
 * @throws {TypeError} If `ls` is null/undefined or contains a line with a
 *   non-finite price or quantity (null, undefined, or NaN).
 */
export function subtotal(ls: Line[]) {
  if (ls === null || ls === undefined) {
    throw new TypeError("ls must be an array of lines");
  }
  for (const l of ls) {
    if (l === null || l === undefined) {
      throw new TypeError("line must be a Line object");
    }
    if (!isFiniteNumber(l.price)) {
      throw new TypeError("line.price must be a finite number");
    }
    if (!isFiniteNumber(l.qty)) {
      throw new TypeError("line.qty must be a finite number");
    }
  }
  return ls.reduce((s, l) => s + lineTotal(l), 0);
}

/**
 * Applies a percentage discount to a total, clamping the result to a minimum of 0.
 *
 * @param total - The pre-discount total amount.
 * @param pct - The discount percentage (e.g. `20` for 20% off).
 * @returns The discounted total, or 0 if the discount would otherwise go negative.
 * @throws {TypeError} If either argument is null, undefined, or NaN.
 */
export function applyCoupon(total: number, pct: number) {
  if (total === null || total === undefined || Number.isNaN(total)) {
    throw new TypeError("total must be a number");
  }
  if (pct === null || pct === undefined || Number.isNaN(pct)) {
    throw new TypeError("pct must be a number");
  }
  return Math.max(0, total - (total * pct) / 100);
}
