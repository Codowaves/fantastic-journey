import { describe, it, expect, beforeEach } from "vitest";
import { checkIdempotency, recordIdempotency, clearIdempotencyStore } from "./idempotency.js";
import type { Order } from "./types.js";

const mockOrder: Order = {
  id: "ord_123",
  customerId: "cust_abc",
  items: [{ id: "item_1", qty: 2 }],
  total: 2,
  currency: "USD",
  status: "pending",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("idempotency", () => {
  beforeEach(() => {
    clearIdempotencyStore();
  });

  it("returns null for unknown key", () => {
    expect(checkIdempotency("unknown")).toBeNull();
  });

  it("returns order for known key", () => {
    recordIdempotency("idem_123", mockOrder);
    expect(checkIdempotency("idem_123")).toEqual(mockOrder);
  });

  it("returns null after clear", () => {
    recordIdempotency("idem_123", mockOrder);
    clearIdempotencyStore();
    expect(checkIdempotency("idem_123")).toBeNull();
  });
});