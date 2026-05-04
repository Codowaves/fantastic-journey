import { describe, expect, it } from "vitest";
import { createOrder, confirmOrder } from "./v1";
import { createCustomer } from "../customer";

describe("createOrder", () => {
  it("creates an order for a valid customer", () => {
    const customer = createCustomer("test@example.com", "Test User");
    const order = createOrder(customer, [{ id: "item1", qty: 2 }]);
    expect(order.id).toMatch(/^ord_\d+$/);
    expect(order.customerId).toBe(customer.id);
    expect(order.total).toBe(1);
    expect(order.status).toBe("pending");
  });
});

describe("confirmOrder", () => {
  it("updates order status to confirmed", () => {
    const customer = createCustomer("test@example.com", "Test User");
    const order = createOrder(customer, []);
    const confirmed = confirmOrder(order);
    expect(confirmed.status).toBe("confirmed");
  });
});
