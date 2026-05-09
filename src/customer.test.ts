import { describe, it, expect, beforeEach } from "vitest";
import {
  createCustomer,
  getCustomer,
  isValidCustomerId,
  listCustomers,
  type Customer,
} from "./customer.js";

describe("customer", () => {
  let customer: Customer;

  beforeEach(() => {
    customer = createCustomer("alice@example.com", "Alice Wonder");
  });

  describe("createCustomer", () => {
    it("creates a customer with id, email, and displayName", () => {
      expect(customer).toMatchObject({
        id: expect.stringMatching(/^cust_/),
        email: "alice@example.com",
        displayName: "Alice Wonder",
      });
    });

    it("generates unique IDs for different customers", () => {
      const customer2 = createCustomer("bob@example.com", "Bob Builder");
      expect(customer2.id).not.toBe(customer.id);
    });
  });

  describe("getCustomer", () => {
    it("retrieves a customer by ID", () => {
      const retrieved = getCustomer(customer.id);
      expect(retrieved).toEqual(customer);
    });

    it("returns undefined for non-existent ID", () => {
      expect(getCustomer("cust_nonexistent")).toBeUndefined();
    });
  });

  describe("isValidCustomerId", () => {
    it("returns true for existing customer IDs", () => {
      expect(isValidCustomerId(customer.id)).toBe(true);
    });

    it("returns false for non-existent IDs", () => {
      expect(isValidCustomerId("cust_fake")).toBe(false);
    });
  });

  describe("listCustomers", () => {
    it("returns all customers", () => {
      const customer2 = createCustomer("bob@example.com", "Bob Builder");
      const all = listCustomers();
      expect(all).toContainEqual(customer);
      expect(all).toContainEqual(customer2);
      expect(all.length).toBeGreaterThanOrEqual(2);
    });
  });
});
