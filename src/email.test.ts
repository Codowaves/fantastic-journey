import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail, sendOrderConfirmation } from "./email.js";
import type { Customer } from "./customer.js";
import type { Order } from "./api/v1.js";

describe("email utilities", () => {
  describe("isValidEmail", () => {
    it("should return true for valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.org")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("a@b")).toBe(false);
    });

    it("should return false for non-string inputs", () => {
      expect(isValidEmail(null as unknown as string)).toBe(false);
      expect(isValidEmail(undefined as unknown as string)).toBe(false);
    });

    it("should return false for emails over 254 chars", () => {
      expect(isValidEmail("a".repeat(250) + "@b.com")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("should trim and lowercase email", () => {
      expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
    });
  });

  describe("maskEmail", () => {
    it("should mask email properly", () => {
      expect(maskEmail("test@example.com")).toBe("te**@example.com");
    });

    it("should handle short local parts", () => {
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });

    it("should return input for invalid email", () => {
      expect(maskEmail("notanemail")).toBe("notanemail");
    });
  });

  describe("sendOrderConfirmation", () => {
    it("should throw for invalid customer email", () => {
      const customer: Customer = { id: "c1", email: "invalid", displayName: "Test" };
      const order: Order = { id: "o1", customerId: "c1", total: 10, status: "pending" };
      expect(() => sendOrderConfirmation(customer, order)).toThrow("Invalid customer email");
    });

    it("should not throw for valid customer and order", () => {
      const customer: Customer = { id: "c1", email: "test@example.com", displayName: "Test" };
      const order: Order = { id: "o1", customerId: "c1", total: 10, status: "pending" };
      expect(() => sendOrderConfirmation(customer, order)).not.toThrow();
    });
  });
});