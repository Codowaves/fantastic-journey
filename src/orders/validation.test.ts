import { describe, it, expect } from "vitest";
import { validateCreateOrderInput } from "./validation.js";
import { OrderValidationError } from "./errors.js";

describe("validation", () => {
  it("accepts valid input", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "idem_abc",
      })
    ).not.toThrow();
  });

  it("rejects missing customerId", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "idem_abc",
      })
    ).toThrow(OrderValidationError);
  });

  it("rejects customerId too short", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "ab",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "idem_abc",
      })
    ).toThrow(OrderValidationError);
  });

  it("rejects empty items", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "cust_123",
        items: [],
        idempotencyKey: "idem_abc",
      })
    ).toThrow(OrderValidationError);
  });

  it("rejects invalid item qty", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 0 }],
        idempotencyKey: "idem_abc",
      })
    ).toThrow(OrderValidationError);
  });

  it("rejects invalid currency", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        currency: "XYZ",
        idempotencyKey: "idem_abc",
      })
    ).toThrow(OrderValidationError);
  });

  it("accepts supported currencies", () => {
    for (const currency of ["USD", "EUR", "GBP", "JPY"]) {
      expect(() =>
        validateCreateOrderInput({
          customerId: "cust_123",
          items: [{ id: "item_1", qty: 2 }],
          currency,
          idempotencyKey: "idem_abc",
        })
      ).not.toThrow();
    }
  });

  it("rejects missing idempotencyKey", () => {
    expect(() =>
      validateCreateOrderInput({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "",
      })
    ).toThrow(OrderValidationError);
  });
});