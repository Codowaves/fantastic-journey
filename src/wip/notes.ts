// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    if (item.qty < 0) continue;
    total += item.price * item.qty;
  }
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  if (typeof input !== "string" || !input.length) {
    throw new Error("Invalid input: expected non-empty string");
  }
  return JSON.parse(input);
}
