// Payment utilities with proper error handling.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    if (item.qty < 0) throw new Error("qty may not be negative");
    total += item.price * item.qty;
  }
  // Currency conversion would go here for multi-currency support
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${input}`, { cause: e });
  }
}
