import { describe, it, expect } from "vitest";
import { createCustomer, isValidCustomerId } from "./customer";

describe("createCustomer", () => {
  it("creates a customer with valid email and displayName", () => {
    const customer = createCustomer("test@example.com", "Test User");
    expect(customer.id).toMatch(/^cust_\d+$/);
    expect(customer.email).toBe("test@example.com");
    expect(customer.displayName).toBe("Test User");
  });

  it("throws when email is missing", () => {
    expect(() => createCustomer("", "Test User")).toThrow("Email and displayName are required");
  });

  it("throws when displayName is missing", () => {
    expect(() => createCustomer("test@example.com", "")).toThrow(
      "Email and displayName are required"
    );
  });
});

describe("isValidCustomerId", () => {
  it("returns true for valid customer IDs", () => {
    expect(isValidCustomerId("cust_123456")).toBe(true);
    expect(isValidCustomerId("cust_789")).toBe(true);
  });

  it("returns false for invalid customer IDs", () => {
    expect(isValidCustomerId("ord_123")).toBe(false);
    expect(isValidCustomerId("123")).toBe(false);
    expect(isValidCustomerId("")).toBe(false);
  });
});
