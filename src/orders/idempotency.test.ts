import { describe, it, expect } from "vitest";
import { InMemoryIdempotencyStore, checkIdempotency } from "./idempotency.js";
import type { Order } from "./types.js";

const mockOrder = (id: string): Order => ({
  id,
  customerId: "550e8400-e29b-41d4-a716-446655440000",
  items: [{ id: "i1", name: "Widget", quantity: 1, unitPrice: 10 }],
  total: 10,
  currency: "USD",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("InMemoryIdempotencyStore", () => {
  it("reports has false for unknown key", () => {
    const store = new InMemoryIdempotencyStore();
    expect(store.has("key1")).toBe(false);
  });

  it("reports has true for stored key", () => {
    const store = new InMemoryIdempotencyStore();
    store.set("key1", mockOrder("ord_1"));
    expect(store.has("key1")).toBe(true);
  });

  it("get returns null for unknown key", () => {
    const store = new InMemoryIdempotencyStore();
    expect(store.get("key1")).toBeNull();
  });

  it("get returns stored order", () => {
    const store = new InMemoryIdempotencyStore();
    const order = mockOrder("ord_1");
    store.set("key1", order);
    expect(store.get("key1")).toEqual(order);
  });

  it("set overwrites existing key", () => {
    const store = new InMemoryIdempotencyStore();
    store.set("key1", mockOrder("ord_1"));
    store.set("key1", mockOrder("ord_2"));
    expect(store.get("key1")!.id).toBe("ord_2");
  });
});

describe("checkIdempotency", () => {
  it("returns null when store is empty", () => {
    const store = new InMemoryIdempotencyStore();
    expect(checkIdempotency(store, "key1")).toBeNull();
  });

  it("returns order when found", () => {
    const store = new InMemoryIdempotencyStore();
    const order = mockOrder("ord_1");
    store.set("key1", order);
    expect(checkIdempotency(store, "key1")).toEqual(order);
  });
});
