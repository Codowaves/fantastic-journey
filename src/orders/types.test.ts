import { describe, it, expect } from "vitest";
import {
  OrderStatusSchema,
  OrderItemSchema,
  OrderSchema,
  CreateOrderInputSchema,
  ValidationError,
  IdempotencyError,
  TransientError,
} from "./types.js";

describe("OrderStatusSchema", () => {
  it("should accept valid order statuses", () => {
    expect(OrderStatusSchema.parse("pending")).toBe("pending");
    expect(OrderStatusSchema.parse("confirmed")).toBe("confirmed");
    expect(OrderStatusSchema.parse("shipped")).toBe("shipped");
    expect(OrderStatusSchema.parse("delivered")).toBe("delivered");
    expect(OrderStatusSchema.parse("failed")).toBe("failed");
  });

  it("should reject invalid order statuses", () => {
    expect(() => OrderStatusSchema.parse("invalid")).toThrow();
  });
});

describe("OrderItemSchema", () => {
  it("should accept valid order items", () => {
    const validItem = {
      id: "item-123",
      qty: 2,
      pricePerUnit: 10.99,
    };
    expect(OrderItemSchema.parse(validItem)).toEqual(validItem);
  });

  it("should reject items with empty id", () => {
    expect(() =>
      OrderItemSchema.parse({
        id: "",
        qty: 1,
        pricePerUnit: 10,
      }),
    ).toThrow();
  });

  it("should reject items with non-positive qty", () => {
    expect(() =>
      OrderItemSchema.parse({
        id: "item-1",
        qty: 0,
        pricePerUnit: 10,
      }),
    ).toThrow();

    expect(() =>
      OrderItemSchema.parse({
        id: "item-1",
        qty: -1,
        pricePerUnit: 10,
      }),
    ).toThrow();
  });

  it("should reject items with negative price", () => {
    expect(() =>
      OrderItemSchema.parse({
        id: "item-1",
        qty: 1,
        pricePerUnit: -10,
      }),
    ).toThrow();
  });
});

describe("CreateOrderInputSchema", () => {
  it("should accept valid create order input", () => {
    const validInput = {
      customerId: "cust-123",
      items: [
        { id: "item-1", qty: 2, pricePerUnit: 10.99 },
        { id: "item-2", qty: 1, pricePerUnit: 5.50 },
      ],
      idempotencyKey: "key-123",
    };
    expect(CreateOrderInputSchema.parse(validInput)).toEqual(validInput);
  });

  it("should accept input without idempotency key", () => {
    const validInput = {
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
    };
    expect(CreateOrderInputSchema.parse(validInput)).toEqual(validInput);
  });

  it("should reject input with empty customer id", () => {
    expect(() =>
      CreateOrderInputSchema.parse({
        customerId: "",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      }),
    ).toThrow();
  });

  it("should reject input with empty items array", () => {
    expect(() =>
      CreateOrderInputSchema.parse({
        customerId: "cust-123",
        items: [],
      }),
    ).toThrow();
  });
});

describe("OrderSchema", () => {
  it("should accept valid order", () => {
    const validOrder = {
      id: "ord-123",
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      total: 10,
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(OrderSchema.parse(validOrder)).toEqual(validOrder);
  });
});

describe("Error classes", () => {
  it("ValidationError should not be retryable", () => {
    const error = new ValidationError("Test error");
    expect(error.retryable).toBe(false);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.name).toBe("ValidationError");
  });

  it("TransientError should be retryable", () => {
    const error = new TransientError("Test error");
    expect(error.retryable).toBe(true);
    expect(error.code).toBe("TRANSIENT_ERROR");
    expect(error.name).toBe("TransientError");
  });

  it("IdempotencyError should contain existing order", () => {
    const existingOrder = {
      id: "ord-123",
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      total: 10,
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const error = new IdempotencyError("Duplicate", existingOrder);
    expect(error.existingOrder).toEqual(existingOrder);
    expect(error.retryable).toBe(false);
    expect(error.code).toBe("IDEMPOTENCY_ERROR");
  });
});
