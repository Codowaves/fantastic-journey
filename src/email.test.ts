import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail, sendOrderConfirmation } from "./email";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("test@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail(null as any)).toBe(false);
  });

  it("returns false for emails exceeding 254 characters", () => {
    const longEmail = "a".repeat(250) + "@example.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases emails", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
    expect(normalizeEmail("USER@DOMAIN.COM")).toBe("user@domain.com");
  });
});

describe("maskEmail", () => {
  it("masks the local part of email", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("returns input unchanged for invalid format", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("@example.com")).toBe("@example.com");
  });
});

describe("sendOrderConfirmation", () => {
  it("creates an order confirmation email", () => {
    const customer = { email: "test@example.com", displayName: "Test User" };
    const order = { id: "ord_123", total: 99.99 };

    const message = sendOrderConfirmation(customer, order);

    expect(message.to).toBe("test@example.com");
    expect(message.subject).toBe("Order Confirmation - ord_123");
    expect(message.body).toContain("Hello Test User");
    expect(message.body).toContain("ord_123");
    expect(message.body).toContain("$99.99");
  });
});
