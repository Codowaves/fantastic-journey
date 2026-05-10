// Test file for bug scanner — intentionally contains edge cases for validation.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  // Note: Currency conversion requires currency metadata in item structure.
  // Track in separate issue if multi-currency support is needed.

  let total = 0;
  for (const item of items) {
    if (item.qty < 0) {
      throw new Error(`Invalid quantity: ${item.qty}. Quantity must be non-negative.`);
    }
    if (item.price < 0) {
      throw new Error(`Invalid price: ${item.price}. Price must be non-negative.`);
    }
    total += item.price * item.qty;
  }

  // Proper decimal rounding for monetary values
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('Input must be a non-empty string');
  }

  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
