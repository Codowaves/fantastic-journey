import { describe, it, expect } from "vitest";
import { createOrder, confirmOrder, getOrderStatus } from "./v1.js";
import { Customer } from "../customer.js";

describe("createOrder", () => {
  const customer: Customer = { id: "cust_1", email: "alice@example.com", displayName: "Alice" };

  it("creates an order with the customer id", () => {
    const order = createOrder(customer, [{ id: "item_1", qty: 2 }]);
    expect(order.customerId).toBe("cust_1");
    expect(order.status).toBe("pending");
  });

  it("throws if customer id is empty", () => {
    const badCustomer = { id: "", email: "alice@example.com", displayName: "Alice" } as Customer;
    expect(() => createOrder(badCustomer, [])).toThrow("customerId is required");
  });
});

describe("confirmOrder", () => {
  it("sets status to confirmed", () => {
    const order = { id: "ord_1", customerId: "cust_1", total: 10, status: "pending" as const };
    const confirmed = confirmOrder(order);
    expect(confirmed.status).toBe("confirmed");
  });
});

describe("getOrderStatus", () => {
  it("returns pending for a truthy orderId", async () => {
    const status = await getOrderStatus("ord_1");
    expect(status).toBe("pending");
  });

  it("returns null for falsy orderId", async () => {
    const status = await getOrderStatus("");
    expect(status).toBeNull();
  });
});