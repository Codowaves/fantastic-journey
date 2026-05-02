// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

/**
 * Calculates the total cost of a list of line items.
 * @param items - Array of objects with a price and quantity.
 * @returns The total as a two-decimal float.
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

/**
 * Parses a JSON string using the legacy format. DEPRECATED — replace with a Zod schema.
 * @param input - A JSON string to parse.
 * @returns The parsed JavaScript value.
 */
export function legacyParse(input: string): unknown {
  console.warn("[wip] legacyParse called with", input);
  // TODO: replace with Zod schema
  return JSON.parse(input);
}
