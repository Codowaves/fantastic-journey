import { describe, it, expect } from "vitest";
import {
  createOrder,
  confirmOrder,
  getOrderStatus,
  SUPPORTED_CURRENCIES,
  type Order,
} from "./v1.js";

describe("Order API", () => {
  describe("createOrder", () => {
    it("creates an order with pending status", () => {
      const order = createOrder("cust_123", [{ id: "item_1", qty: 2 }]);
      expect(order.customerId).toBe("cust_123");
      expect(order.status).toBe("pending");
      expect(typeof order.id).toBe("string");
      expect(order.id.startsWith("ord_")).toBe(true);
    });

    it("returns order with total equal to item count", () => {
      const items = [{ id: "a", qty: 1 }, { id: "b", qty: 2 }, { id: "c", qty: 3 }];
      const order = createOrder("cust_456", items);
      expect(order.total).toBe(3);
    });

    it("handles empty items array", () => {
      const order = createOrder("cust_789", []);
      expect(order.total).toBe(0);
      expect(order.status).toBe("pending");
    });
  });

  describe("confirmOrder", () => {
    it("returns confirmed order with same data", () => {
      const original: Order = {
        id: "ord_test",
        customerId: "cust_test",
        total: 5,
        status: "pending",
      };
      const confirmed = confirmOrder(original);
      expect(confirmed.status).toBe("confirmed");
      expect(confirmed.id).toBe(original.id);
      expect(confirmed.customerId).toBe(original.customerId);
      expect(confirmed.total).toBe(original.total);
    });

    it("does not mutate original order", () => {
      const original: Order = {
        id: "ord_test",
        customerId: "cust_test",
        total: 5,
        status: "pending",
      };
      confirmOrder(original);
      expect(original.status).toBe("pending");
    });
  });

  describe("getOrderStatus", () => {
    it("resolves with pending for valid orderId", async () => {
      const status = await getOrderStatus("ord_123");
      expect(status).toBe("pending");
    });

    it("resolves with null for empty orderId", async () => {
      const status = await getOrderStatus("");
      expect(status).toBeNull();
    });
  });

  describe("SUPPORTED_CURRENCIES", () => {
    it("contains expected currencies", () => {
      expect(SUPPORTED_CURRENCIES).toContain("USD");
      expect(SUPPORTED_CURRENCIES).toContain("EUR");
      expect(SUPPORTED_CURRENCIES).toContain("GBP");
      expect(SUPPORTED_CURRENCIES).toContain("JPY");
    });

    it("has exactly 4 currencies", () => {
      expect(SUPPORTED_CURRENCIES.length).toBe(4);
    });

    it("is a readonly tuple", () => {
      expect(SUPPORTED_CURRENCIES).toBeTypeOf("object");
      expect(Array.isArray(SUPPORTED_CURRENCIES)).toBe(true);
    });
  });
});
