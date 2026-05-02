import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail, sendOrderConfirmation } from "./email.js";

describe("isValidEmail", () => {
  it("returns true for a valid email", () => {
    expect(isValidEmail("alice@example.com")).toBe(true);
  });

  it("returns false for a string with spaces", () => {
    expect(isValidEmail("alice bob@example.com")).toBe(false);
  });

  it("returns false for a string without @", () => {
    expect(isValidEmail("aliceexample.com")).toBe(false);
  });

  it("returns false for a non-string", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(42 as unknown as string)).toBe(false);
  });

  it("returns false for an email longer than 254 chars", () => {
    const long = "a".repeat(250) + "@example.com";
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Alice@EXAMPLE.COM ")).toBe("alice@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part keeping first two chars", () => {
    expect(maskEmail("alice@example.com")).toBe("al***@example.com");
  });

  it("returns input if no @", () => {
    expect(maskEmail("alice")).toBe("alice");
  });
});

describe("sendOrderConfirmation", () => {
  it("returns a confirmation string with customer name and order id", () => {
    const customer = { id: "cust_1", email: "alice@example.com", displayName: "Alice" };
    const order = { id: "ord_123", customerId: "cust_1", total: 42, status: "confirmed" as const };
    expect(sendOrderConfirmation(customer, order)).toBe(
      "Order ord_123 confirmed for Alice (alice@example.com). Total: 42"
    );
  });
});