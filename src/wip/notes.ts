// Intentionally-scoped WIP helpers — production use only after review.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  // Round to 2 decimal places using banker's rounding
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  return JSON.parse(input);
}
