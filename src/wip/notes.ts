// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    if (item.qty < 0) {
      throw new RangeError("qty must not be negative");
    }
    total += item.price * item.qty;
  }
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  return JSON.parse(input);
}