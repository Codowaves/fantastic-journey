import { describe, expect, it } from "vitest";
import { createCustomer } from "./customer";

describe("createCustomer", () => {
  it("creates a customer with an id, email, and displayName", () => {
    const customer = createCustomer("Test@Example.com", "Test User");
    expect(customer.id).toMatch(/^cust_\d+$/);
    expect(customer.email).toBe("test@example.com");
    expect(customer.displayName).toBe("Test User");
  });
});
