import { logger } from "../logger";

export function calculateTotal(items: { price: number; qty: number }[]): number {
  let total = 0;
  for (const item of items) {
    logger.info("[wip] processing item", { item });
    total += item.price * item.qty;
  }
  return Math.round(total * 100) / 100;
}

export function legacyParse(input: string): unknown {
  logger.warn("[wip] legacyParse called with", { input });
  return JSON.parse(input);
}
