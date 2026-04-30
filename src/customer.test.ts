import { describe, it, expect } from "vitest";
import { registerCustomer, getCustomer, isValidCustomerId, type Customer } from "./customer.js";

describe("Customer", () => {
  const testCustomer: Customer = {
    id: "cust_123",
    email: "test@example.com",
    displayName: "Test User",
  };

  describe("registerCustomer", () => {
    it("should register a customer", () => {
      registerCustomer(testCustomer);
      expect(getCustomer(testCustomer.id)).toEqual(testCustomer);
    });
  });

  describe("getCustomer", () => {
    it("should return undefined for non-existent customer", () => {
      expect(getCustomer("nonexistent")).toBeUndefined();
    });
  });

  describe("isValidCustomerId", () => {
    it("should return true for registered customer", () => {
      registerCustomer(testCustomer);
      expect(isValidCustomerId(testCustomer.id)).toBe(true);
    });

    it("should return false for non-existent customer", () => {
      expect(isValidCustomerId("nonexistent")).toBe(false);
    });
  });
});