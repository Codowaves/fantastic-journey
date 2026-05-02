import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail, sendOrderConfirmation } from "./email.js";

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
    expect(normalizeEmail(" TEST@Example.COM ")).toBe("test@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part keeping first 2 chars", () => {
    expect(maskEmail("test@example.com")).toBe("te**@example.com");
  });
});

describe("sendOrderConfirmation", () => {
  it("returns confirmation message with customer and order info", () => {
    const customer = { email: "test@example.com", displayName: "Test User" };
    const order = { id: "ord_123", customerId: "cust_1", total: 42, status: "pending" as const };
    const msg = sendOrderConfirmation(customer, order);
    expect(msg).toContain("Test User");
    expect(msg).toContain("ord_123");
    expect(msg).toContain("42");
  });
});