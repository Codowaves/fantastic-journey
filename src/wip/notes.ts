// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

/**
 * Calculates the total price of items based on price and quantity.
 * @param items - Array of items with price and quantity
 * @returns The total price rounded to 2 decimal places
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
 * Parses a JSON string into an unknown type.
 * @deprecated This function lacks proper validation. Use a Zod schema instead.
 * @param input - The JSON string to parse
 * @returns The parsed JSON value
 * @throws {SyntaxError} If the input is not valid JSON
 */
export function legacyParse(input: string): unknown {
  console.warn("[wip] legacyParse called with", input);
  // TODO: replace with Zod schema
  return JSON.parse(input);
}
