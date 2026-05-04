import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail, sendOrderConfirmation } from "./email";
import { createCustomer } from "./customer";
import { createOrder } from "./api/v1";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });
  it("returns false for invalid emails", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases email", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });
});

describe("maskEmail", () => {
  it("masks all but first two characters", () => {
    expect(maskEmail("test@example.com")).toBe("te**@example.com");
  });
});

describe("sendOrderConfirmation", () => {
  it("returns a confirmation string with customer email and order id", () => {
    const customer = createCustomer("test@example.com", "Test User");
    const order = createOrder(customer, [{ id: "item1", qty: 1 }]);
    const result = sendOrderConfirmation(customer, order);
    expect(result).toContain(order.id);
    expect(result).toContain(customer.email);
  });
});
