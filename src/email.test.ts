import { describe, it, expect, beforeEach } from "vitest";
import {
  isValidEmail,
  normalizeEmail,
  maskEmail,
  sendOrderConfirmation,
} from "./email.js";
import { createCustomer, type Customer } from "./customer.js";
import type { Order } from "./api/v1.js";

describe("email", () => {
  describe("isValidEmail", () => {
    it("accepts valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("alice+tag@domain.co.uk")).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    it("rejects non-string inputs", () => {
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
    });

    it("rejects overly long emails", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("trims and lowercases email addresses", () => {
      expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    });
  });

  describe("maskEmail", () => {
    it("masks the local part of the email", () => {
      expect(maskEmail("alice@example.com")).toBe("al***@example.com");
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });

    it("returns input unchanged if no @ present", () => {
      expect(maskEmail("notanemail")).toBe("notanemail");
    });
  });

  describe("sendOrderConfirmation", () => {
    let customer: Customer;
    let order: Order;

    beforeEach(() => {
      customer = createCustomer("alice@example.com", "Alice Wonder");
      order = {
        id: "ord_123",
        customerId: customer.id,
        total: 250,
        status: "confirmed",
      };
    });

    it("creates a confirmation email with customer and order details", () => {
      const email = sendOrderConfirmation(customer, order);
      expect(email).toEqual({
        to: "alice@example.com",
        subject: "Order Confirmation #ord_123",
        body: expect.stringContaining("Alice Wonder"),
      });
      expect(email.body).toContain("ord_123");
      expect(email.body).toContain("confirmed");
      expect(email.body).toContain("250");
    });

    it("throws error for invalid customer email", () => {
      const invalidCustomer = { ...customer, email: "not-valid" };
      expect(() => {
        sendOrderConfirmation(invalidCustomer, order);
      }).toThrow("Invalid customer email: not-valid");
    });
  });
});
