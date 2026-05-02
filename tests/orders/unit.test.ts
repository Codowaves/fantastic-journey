import { describe, it, expect } from "vitest";
import {
  validateOrderItem,
  validateOrderInput,
} from "../../src/orders/types.js";

describe("Order Validation", () => {
  describe("validateOrderItem", () => {
    it("validates a valid item", () => {
      const result = validateOrderItem({ id: "item_1", qty: 5 });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual({ id: "item_1", qty: 5 });
      }
    });

    it("rejects item with empty id", () => {
      const result = validateOrderItem({ id: "", qty: 5 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("non-empty string");
      }
    });

    it("rejects item with missing id", () => {
      const result = validateOrderItem({ qty: 5 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("id");
      }
    });

    it("rejects item with non-positive qty", () => {
      const result = validateOrderItem({ id: "item_1", qty: 0 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("positive integer");
      }
    });

    it("rejects item with negative qty", () => {
      const result = validateOrderItem({ id: "item_1", qty: -1 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("positive integer");
      }
    });

    it("rejects item with non-integer qty", () => {
      const result = validateOrderItem({ id: "item_1", qty: 1.5 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("positive integer");
      }
    });

    it("rejects null item", () => {
      const result = validateOrderItem(null);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("required");
      }
    });

    it("rejects undefined item", () => {
      const result = validateOrderItem(undefined);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("required");
      }
    });
  });

  describe("validateOrderInput", () => {
    it("validates a valid order input", () => {
      const result = validateOrderInput({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual({
          customerId: "cust_123",
          items: [{ id: "item_1", qty: 2 }],
        });
      }
    });

    it("validates input with idempotency key", () => {
      const result = validateOrderInput({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "idem_123",
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data?.idempotencyKey).toBe("idem_123");
      }
    });

    it("rejects empty customerId", () => {
      const result = validateOrderInput({
        customerId: "",
        items: [{ id: "item_1", qty: 2 }],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("customerId");
      }
    });

    it("rejects missing customerId", () => {
      const result = validateOrderInput({
        items: [{ id: "item_1", qty: 2 }],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("customerId");
      }
    });

    it("rejects empty items array", () => {
      const result = validateOrderInput({
        customerId: "cust_123",
        items: [],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("non-empty array");
      }
    });

    it("rejects missing items", () => {
      const result = validateOrderInput({
        customerId: "cust_123",
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("items");
      }
    });

    it("rejects input with invalid item", () => {
      const result = validateOrderInput({
        customerId: "cust_123",
        items: [{ id: "", qty: 2 }],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("items[0]");
      }
    });

    it("rejects null input", () => {
      const result = validateOrderInput(null);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("object");
      }
    });

    it("rejects non-object input", () => {
      const result = validateOrderInput("not an object");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("object");
      }
    });

    it("validates multiple items", () => {
      const result = validateOrderInput({
        customerId: "cust_123",
        items: [
          { id: "item_1", qty: 2 },
          { id: "item_2", qty: 3 },
        ],
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data?.items).toHaveLength(2);
      }
    });
  });
});
