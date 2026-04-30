import { describe, it, expect } from "vitest";
import { validateCreateOrderInput, ValidationError } from "./validation.js";

describe("validateCreateOrderInput", () => {
  const validInput = {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    items: [{ id: "item1", name: "Widget", quantity: 2, unitPrice: 10.99 }],
  };

  it("accepts a valid input", () => {
    const result = validateCreateOrderInput(validInput);
    expect(result.customerId).toBe(validInput.customerId);
    expect(result.items).toHaveLength(1);
    expect(result.currency).toBe("USD");
  });

  it("accepts optional currency", () => {
    const result = validateCreateOrderInput({ ...validInput, currency: "EUR" });
    expect(result.currency).toBe("EUR");
  });

  it("accepts optional idempotencyKey", () => {
    const result = validateCreateOrderInput({
      ...validInput,
      idempotencyKey: "key-123",
    });
    expect(result.idempotencyKey).toBe("key-123");
  });

  it("throws for non-object input", () => {
    expect(() => validateCreateOrderInput(null)).toThrow(ValidationError);
    expect(() => validateCreateOrderInput("string")).toThrow(ValidationError);
  });

  it("throws for missing/empty customerId", () => {
    expect(() =>
      validateCreateOrderInput({ ...validInput, customerId: "" }),
    ).toThrow(ValidationError);
    expect(() =>
      validateCreateOrderInput({ ...validInput, customerId: "  " }),
    ).toThrow(ValidationError);
  });

  it("throws for invalid UUID customerId", () => {
    expect(() =>
      validateCreateOrderInput({ ...validInput, customerId: "not-a-uuid" }),
    ).toThrow(ValidationError);
  });

  it("throws for empty items array", () => {
    expect(() =>
      validateCreateOrderInput({ ...validInput, items: [] }),
    ).toThrow(ValidationError);
  });

  it("throws for non-array items", () => {
    expect(() =>
      validateCreateOrderInput({ ...validInput, items: "not-array" }),
    ).toThrow(ValidationError);
  });

  it("throws for item missing id", () => {
    const bad = {
      ...validInput,
      items: [{ name: "x", quantity: 1, unitPrice: 1 }],
    };
    expect(() => validateCreateOrderInput(bad)).toThrow(ValidationError);
  });

  it("throws for item missing name", () => {
    const bad = {
      ...validInput,
      items: [{ id: "x", quantity: 1, unitPrice: 1 }],
    };
    expect(() => validateCreateOrderInput(bad)).toThrow(ValidationError);
  });

  it("throws for non-positive quantity", () => {
    const bad1 = {
      ...validInput,
      items: [{ id: "x", name: "x", quantity: 0, unitPrice: 1 }],
    };
    const bad2 = {
      ...validInput,
      items: [{ id: "x", name: "x", quantity: -1, unitPrice: 1 }],
    };
    expect(() => validateCreateOrderInput(bad1)).toThrow(ValidationError);
    expect(() => validateCreateOrderInput(bad2)).toThrow(ValidationError);
  });

  it("throws for non-integer quantity", () => {
    const bad = {
      ...validInput,
      items: [{ id: "x", name: "x", quantity: 1.5, unitPrice: 1 }],
    };
    expect(() => validateCreateOrderInput(bad)).toThrow(ValidationError);
  });

  it("throws for negative unitPrice", () => {
    const bad = {
      ...validInput,
      items: [{ id: "x", name: "x", quantity: 1, unitPrice: -1 }],
    };
    expect(() => validateCreateOrderInput(bad)).toThrow(ValidationError);
  });

  it("throws for invalid currency type", () => {
    expect(() =>
      validateCreateOrderInput({ ...validInput, currency: 123 }),
    ).toThrow(ValidationError);
  });

  it("throws for empty idempotencyKey", () => {
    expect(() =>
      validateCreateOrderInput({ ...validInput, idempotencyKey: "" }),
    ).toThrow(ValidationError);
  });
});
