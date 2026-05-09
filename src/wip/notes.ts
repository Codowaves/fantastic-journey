// Utility functions for WIP features

/**
 * Rounds a monetary value to 2 decimal places
 */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates the total cost of items
 * Note: All prices must be in the same currency
 * @throws {Error} if any item has negative quantity
 */
export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    if (item.qty < 0) {
      throw new Error(`Invalid quantity: ${item.qty}. Quantity must be non-negative.`);
    }
    total += item.price * item.qty;
  }
  return roundMoney(total);
}

/**
 * Parses JSON input with basic validation
 * @throws {Error} if input is not valid JSON or is empty
 */
export function legacyParse(input: string): unknown {
  if (!input || input.trim() === '') {
    throw new Error('Input cannot be empty');
  }
  return JSON.parse(input);
}
