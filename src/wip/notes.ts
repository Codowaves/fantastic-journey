/** Calculates total price for a list of items.
 * @param items - Array of items with price and quantity.
 * @returns The total rounded to 2 decimal places.
 */
export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return Math.round(total * 100) / 100;
}

/** Parses a JSON string into a value.
 * @param input - JSON string to parse.
 * @returns The parsed value.
 */
export function legacyParse(input: string): unknown {
  return JSON.parse(input);
}