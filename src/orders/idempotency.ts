import type { Order } from "./types.js";

interface IdempotencyEntry {
  order: Order;
  timestamp: number;
}

const store = new Map<string, IdempotencyEntry>();

export function checkIdempotency(key: string): Order | null {
  const entry = store.get(key);
  if (entry) {
    return entry.order;
  }
  return null;
}

export function recordIdempotency(key: string, order: Order): void {
  store.set(key, { order, timestamp: Date.now() });
}

export function clearIdempotencyStore(): void {
  store.clear();
}