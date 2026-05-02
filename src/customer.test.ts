import { describe, it, expect } from "vitest";
import { createCustomer } from "./customer.js";

describe("createCustomer", () => {
  it("creates a customer with id, email, and displayName", () => {
    const customer = createCustomer("test@example.com", "Test User");
    expect(customer.id).toMatch(/^cust_/);
    expect(customer.email).toBe("test@example.com");
    expect(customer.displayName).toBe("Test User");
  });
});