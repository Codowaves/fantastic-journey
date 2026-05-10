// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    // Handle negative quantities by treating them as zero
    const quantity = Math.max(0, item.qty);
    total += item.price * quantity;
  }
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Failed to parse input: ${error instanceof Error ? error.message : String(error)}`);
  }
}
