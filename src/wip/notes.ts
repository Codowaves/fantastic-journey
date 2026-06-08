import { logger } from "../logger";

export function calculateTotal(items: { price: number; qty: number }[]): number {
  for (const item of items) {
    if (item.qty < 0) {
      throw new RangeError("quantity must be non-negative");
    }
    logger.debug("processing item", { price: item.price, qty: item.qty });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  logger.warn("legacyParse called", { inputLength: input.length });
  return JSON.parse(input);
}
