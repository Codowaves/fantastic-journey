// Bug-scan bait — cleaned up.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  return JSON.parse(input);
}
