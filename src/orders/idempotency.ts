import type { Order } from "./types.js";

export class IdempotencyError extends Error {
  public readonly existingOrder: Order;
  public readonly key: string;

  constructor(key: string, existingOrder: Order) {
    super(`Order with idempotency key '${key}' already exists`);
    this.name = "IdempotencyError";
    this.key = key;
    this.existingOrder = existingOrder;
  }
}

export interface IdempotencyStore {
  has(key: string): boolean;
  get(key: string): Order | null;
  set(key: string, order: Order): void;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, Order>();

  has(key: string): boolean {
    return this.store.has(key);
  }

  get(key: string): Order | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, order: Order): void {
    this.store.set(key, order);
  }
}

export function checkIdempotency(
  store: IdempotencyStore,
  key: string,
): Order | null {
  return store.get(key);
}
