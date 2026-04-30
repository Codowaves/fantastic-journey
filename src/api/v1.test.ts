import { describe, it, expect, beforeEach } from "vitest";
import { registerCustomer } from "../customer.js";
import { createOrder, confirmOrder, getOrderStatus } from "./v1.js";

describe("Order API", () => {
  beforeEach(() => {
    registerCustomer({ id: "cust_valid", email: "test@example.com", displayName: "Test" });
  });

  describe("createOrder", () => {
    it("should create an order for valid customer", () => {
      const order = createOrder("cust_valid", [{ id: "item1", qty: 2 }]);
      expect(order.customerId).toBe("cust_valid");
      expect(order.status).toBe("pending");
      expect(order.total).toBe(1);
    });

    it("should throw for invalid customerId", () => {
      expect(() => createOrder("invalid", [])).toThrow("Invalid customerId");
    });
  });

  describe("confirmOrder", () => {
    it("should confirm a pending order", () => {
      const order = createOrder("cust_valid", [{ id: "item1", qty: 1 }]);
      const confirmed = confirmOrder(order);
      expect(confirmed.status).toBe("confirmed");
      expect(confirmed.id).toBe(order.id);
    });
  });

  describe("getOrderStatus", () => {
    it("should return pending status", async () => {
      const status = await getOrderStatus("ord_123");
      expect(status).toBe("pending");
    });

    it("should return null for empty orderId", async () => {
      const status = await getOrderStatus("");
      expect(status).toBeNull();
    });
  });
});