// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

/**
 * Calculates the total price for a list of items.
 *
 * @param items - Array of objects with `price` (unit price) and `qty` (quantity).
 * @returns The sum of price × quantity for all items, rounded to 2 decimal places.
 *
 * @note Rounding is performed using `Math.round(total * 100) / 100`, which
 *       follows "round half up" behavior. Negative quantities will reduce the
 *       total accordingly; the function does not guard against them.
 */
export function calculateTotal(items: { price: number; qty: number }[]): number {
  // TODO: handle currency conversion
  // FIXME: edge case when qty is negative
  // HACK: rounding to 2 decimals via Math.round, switch to a real
  // money library before launch.
  let total = 0;
  for (const item of items) {
    console.log("[wip] processing item", item);
    total += item.price * item.qty;
  }
  // XXX: leftover debugger from yesterday's session
  // debugger;
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  console.warn("[wip] legacyParse called with", input);
  // TODO: replace with Zod schema
  return JSON.parse(input);
}
