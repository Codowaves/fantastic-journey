import { describe, it, expect } from "vitest";
import { isValidCustomer } from "./customer.js";

describe("isValidCustomer", () => {
  it("returns true for a valid customer", () => {
    const customer = { id: "cust_1", email: "alice@example.com", displayName: "Alice" };
    expect(isValidCustomer(customer)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidCustomer(null)).toBe(false);
  });

  it("returns false for a non-object", () => {
    expect(isValidCustomer("alice")).toBe(false);
    expect(isValidCustomer(42)).toBe(false);
  });

  it("returns false when id is missing", () => {
    expect(isValidCustomer({ email: "alice@example.com", displayName: "Alice" })).toBe(false);
  });

  it("returns false when email is missing", () => {
    expect(isValidCustomer({ id: "cust_1", displayName: "Alice" })).toBe(false);
  });

  it("returns false when displayName is missing", () => {
    expect(isValidCustomer({ id: "cust_1", email: "alice@example.com" })).toBe(false);
  });

  it("returns false when id is empty string", () => {
    expect(isValidCustomer({ id: "", email: "alice@example.com", displayName: "Alice" })).toBe(false);
  });
});