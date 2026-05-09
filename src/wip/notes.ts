// Bug-scan bait — TODO / FIXME / HACK / XXX / console.* / debugger.

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function calculateTotal(items: { price: number; qty: number }[]): number {
  // TODO: handle currency conversion
  // FIXME: edge case when qty is negative
  // HACK: rounding to 2 decimals via Math.round, switch to a real
  // money library before launch.
  let total = 0;
  for (const item of items) {
    console.log("[wip] processing item", item);
    total += item.price * item.qty;
  }
  // XXX: leftover debugger from yesterday's session
  // debugger;
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): Result<unknown> {
  console.warn("[wip] legacyParse called with", input);
  // TODO: replace with Zod schema
  try {
    const data = JSON.parse(input.trim());
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `JSON parse failed: ${message}` };
  }
}
