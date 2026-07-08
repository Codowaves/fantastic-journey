import { describe, expect, it } from "vitest";

import { lowStock, restock, totalQuantity } from "./inventory";
import type { InventoryItem } from "./inventory";

describe("inventory helpers", () => {
  describe("totalQuantity", () => {
    it("sums the quantities across all items", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 3 },
        { sku: "B", qty: 7 },
        { sku: "C", qty: 10 },
      ];
      expect(totalQuantity(items)).toBe(20);
    });

    it("returns 0 for an empty inventory", () => {
      expect(totalQuantity([])).toBe(0);
    });

    it("treats zero-quantity items as contributing 0", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 0 },
        { sku: "B", qty: 5 },
        { sku: "C", qty: 0 },
      ];
      expect(totalQuantity(items)).toBe(5);
    });
  });

  describe("lowStock", () => {
    const items: InventoryItem[] = [
      { sku: "A", qty: 0 },
      { sku: "B", qty: 2 },
      { sku: "C", qty: 4 },
      { sku: "D", qty: 5 },
      { sku: "E", qty: 10 },
    ];

    it("returns items strictly below the default threshold of 5", () => {
      expect(lowStock(items)).toEqual([
        { sku: "A", qty: 0 },
        { sku: "B", qty: 2 },
        { sku: "C", qty: 4 },
      ]);
    });

    it("supports a custom threshold", () => {
      expect(lowStock(items, 3)).toEqual([
        { sku: "A", qty: 0 },
        { sku: "B", qty: 2 },
      ]);
    });

    it("returns an empty list when every item is at or above the threshold", () => {
      const above: InventoryItem[] = [
        { sku: "A", qty: 3 },
        { sku: "B", qty: 10 },
      ];
      expect(lowStock(above, 3)).toEqual([]);
    });

    it("does not mutate the input array", () => {
      const snapshot = items.map((i) => ({ ...i }));
      lowStock(items, 2);
      expect(items).toEqual(snapshot);
    });
  });

  describe("restock", () => {
    it("returns a new item with quantity increased by the given amount", () => {
      const item: InventoryItem = { sku: "A", qty: 3 };
      expect(restock(item, 7)).toEqual({ sku: "A", qty: 10 });
    });

    it("does not mutate the original item", () => {
      const item: InventoryItem = { sku: "A", qty: 3 };
      const result = restock(item, 7);
      expect(item).toEqual({ sku: "A", qty: 3 });
      expect(result).not.toBe(item);
    });

    it("supports restocking from zero", () => {
      const item: InventoryItem = { sku: "Z", qty: 0 };
      expect(restock(item, 5)).toEqual({ sku: "Z", qty: 5 });
    });

    it("supports negative restock amounts (drawing down stock)", () => {
      const item: InventoryItem = { sku: "A", qty: 10 };
      expect(restock(item, -3)).toEqual({ sku: "A", qty: 7 });
    });

    it("restocks with a zero amount (returns an equivalent item)", () => {
      const item: InventoryItem = { sku: "A", qty: 4 };
      const result = restock(item, 0);
      expect(result).toEqual({ sku: "A", qty: 4 });
      expect(result).not.toBe(item);
    });
  });

  describe("edge cases", () => {
    it("totalQuantity ignores extra properties on items", () => {
      const items = [
        { sku: "A", qty: 2, location: "A1" },
        { sku: "B", qty: 3, location: "B1" },
      ] as unknown as InventoryItem[];
      expect(totalQuantity(items)).toBe(5);
    });

    it("lowStock excludes items exactly at the threshold (exclusive boundary)", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 4 },
        { sku: "B", qty: 5 },
        { sku: "C", qty: 6 },
      ];
      expect(lowStock(items, 5)).toEqual([{ sku: "A", qty: 4 }]);
    });

    it("lowStock returns an empty array when given an empty input", () => {
      expect(lowStock([])).toEqual([]);
    });

    it("lowStock with a threshold of 0 returns only items below zero", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 0 },
        { sku: "B", qty: -1 },
      ];
      expect(lowStock(items, 0)).toEqual([{ sku: "B", qty: -1 }]);
    });

    it("restock handles a negative amount that results in zero quantity", () => {
      const item: InventoryItem = { sku: "A", qty: 5 };
      expect(restock(item, -5)).toEqual({ sku: "A", qty: 0 });
    });
  });

  describe("additional edge cases (batch2)", () => {
    it("totalQuantity returns the single item's quantity for a one-item list", () => {
      expect(totalQuantity([{ sku: "only", qty: 42 }])).toBe(42);
    });

    it("totalQuantity sums an all-zero inventory to 0", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 0 },
        { sku: "B", qty: 0 },
        { sku: "C", qty: 0 },
      ];
      expect(totalQuantity(items)).toBe(0);
    });

    it("totalQuantity sums large quantities accurately", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 1_000_000 },
        { sku: "B", qty: 2_000_000 },
        { sku: "C", qty: 3_000_000 },
      ];
      expect(totalQuantity(items)).toBe(6_000_000);
    });

    it("totalQuantity handles a mix of positive, zero, and negative quantities", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 10 },
        { sku: "B", qty: -3 },
        { sku: "C", qty: 0 },
        { sku: "D", qty: 5 },
      ];
      expect(totalQuantity(items)).toBe(12);
    });

    it("lowStock returns a single matching item when only one is below the threshold", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 0 },
        { sku: "B", qty: 10 },
      ];
      expect(lowStock(items)).toEqual([{ sku: "A", qty: 0 }]);
    });

    it("lowStock with a negative threshold returns only items below that negative value", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: -10 },
        { sku: "B", qty: -2 },
        { sku: "C", qty: 0 },
        { sku: "D", qty: 5 },
      ];
      expect(lowStock(items, -5)).toEqual([{ sku: "A", qty: -10 }]);
    });

    it("lowStock with a very large threshold returns every item", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 1 },
        { sku: "B", qty: 2 },
        { sku: "C", qty: 3 },
      ];
      expect(lowStock(items, Number.MAX_SAFE_INTEGER)).toEqual(items);
    });

    it("lowStock treats duplicate SKUs as independent items", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: 1 },
        { sku: "A", qty: 2 },
        { sku: "B", qty: 3 },
      ];
      expect(lowStock(items, 3)).toEqual([
        { sku: "A", qty: 1 },
        { sku: "A", qty: 2 },
      ]);
    });

    it("lowStock includes items with negative quantities regardless of threshold", () => {
      const items: InventoryItem[] = [
        { sku: "A", qty: -1 },
        { sku: "B", qty: 100 },
      ];
      expect(lowStock(items, 0)).toEqual([{ sku: "A", qty: -1 }]);
    });

    it("restock supports a negative amount that overshoots zero into negative territory", () => {
      const item: InventoryItem = { sku: "A", qty: 2 };
      expect(restock(item, -5)).toEqual({ sku: "A", qty: -3 });
    });

    it("restock from a negative starting quantity increases toward zero", () => {
      const item: InventoryItem = { sku: "A", qty: -10 };
      expect(restock(item, 7)).toEqual({ sku: "A", qty: -3 });
    });

    it("restock preserves the original sku and does not mutate it", () => {
      const item: InventoryItem = { sku: "ORIGINAL-SKU", qty: 1 };
      const result = restock(item, 4);
      expect(item.sku).toBe("ORIGINAL-SKU");
      expect(result.sku).toBe("ORIGINAL-SKU");
      expect(result.qty).toBe(5);
    });

    it("restock handles large restock amounts", () => {
      const item: InventoryItem = { sku: "A", qty: 0 };
      expect(restock(item, 1_000_000)).toEqual({ sku: "A", qty: 1_000_000 });
    });
  });
});
