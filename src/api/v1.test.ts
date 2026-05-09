import { describe, it, expect, beforeEach } from "vitest";
import { createOrder, confirmOrder, getOrderStatus, type Order } from "./v1.js";
import { createCustomer } from "../customer.js";

describe("api/v1", () => {
  let customerId: string;

  beforeEach(() => {
    const customer = createCustomer("test@example.com", "Test User");
    customerId = customer.id;
  });

  describe("createOrder", () => {
    it("creates an order with valid customerId", () => {
      const order = createOrder(customerId, [
        { id: "item1", qty: 2 },
        { id: "item2", qty: 1 },
      ]);
      expect(order).toMatchObject({
        id: expect.stringMatching(/^ord_/),
        customerId,
        total: 2,
        status: "pending",
      });
    });

    it("throws error for invalid customerId", () => {
      expect(() => {
        createOrder("invalid_id", [{ id: "item1", qty: 1 }]);
      }).toThrow("Invalid customerId: invalid_id");
    });
  });

  describe("confirmOrder", () => {
    it("updates order status to confirmed", () => {
      const order: Order = {
        id: "ord_123",
        customerId,
        total: 100,
        status: "pending",
      };
      const confirmed = confirmOrder(order);
      expect(confirmed.status).toBe("confirmed");
      expect(confirmed.id).toBe(order.id);
    });
  });

  describe("getOrderStatus", () => {
    it("returns pending for non-empty orderId", async () => {
      const status = await getOrderStatus("ord_123");
      expect(status).toBe("pending");
    });

    it("returns null for empty orderId", async () => {
      const status = await getOrderStatus("");
      expect(status).toBeNull();
    });
  });
});
