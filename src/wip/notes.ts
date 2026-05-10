/**
 * Calculates the total cost of items.
 * Note: All items must use the same currency (no multi-currency support).
 */
export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    if (item.qty < 0) {
      throw new RangeError(`Quantity cannot be negative: ${item.qty}`);
    }
    total += item.price * item.qty;
  }
  return roundToTwoDecimals(total);
}

/**
 * Rounds a number to two decimal places for monetary calculations.
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Parses JSON input with error handling.
 * @throws {SyntaxError} if input is not valid JSON
 */
export function legacyParse(input: string): unknown {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }
  if (input.trim() === "") {
    throw new SyntaxError("Input cannot be empty");
  }
  return JSON.parse(input);
}
