import { describe, expect, it } from "vitest";

import { LRUCache } from "./lru-cache";

describe("LRUCache", () => {
  describe("constructor", () => {
    it("rejects negative capacity", () => {
      expect(() => new LRUCache<string, number>(-1)).toThrow(RangeError);
    });

    it("rejects non-integer capacity", () => {
      expect(() => new LRUCache<string, number>(1.5)).toThrow(RangeError);
    });

    it("accepts zero capacity", () => {
      const cache = new LRUCache<string, number>(0);
      expect(cache.size).toBe(0);
    });
  });

  describe("basic operations", () => {
    it("starts empty", () => {
      const cache = new LRUCache<string, number>(3);
      expect(cache.size).toBe(0);
      expect(cache.has("a")).toBe(false);
    });

    it("stores and retrieves values", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      expect(cache.size).toBe(2);
      expect(cache.get("a")).toBe(1);
      expect(cache.get("b")).toBe(2);
    });

    it("returns undefined for missing keys", () => {
      const cache = new LRUCache<string, number>(3);
      expect(cache.get("missing")).toBeUndefined();
    });
  });

  describe("eviction order", () => {
    it("evicts the least-recently-used key when over capacity", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
      expect(cache.size).toBe(2);
    });

    it("get() refreshes recency and prevents eviction", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      expect(cache.get("a")).toBe(1);
      cache.set("c", 3);
      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
      expect(cache.has("c")).toBe(true);
    });

    it("set() on an existing key refreshes recency", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("a", 10);
      cache.set("c", 3);
      expect(cache.has("a")).toBe(true);
      expect(cache.get("a")).toBe(10);
      expect(cache.has("b")).toBe(false);
      expect(cache.has("c")).toBe(true);
    });

    it("get() on a missing key does not affect eviction order", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      expect(cache.get("missing")).toBeUndefined();
      cache.set("c", 3);
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });
  });

  describe("update existing key", () => {
    it("overwrites the value for an existing key", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("a", 2);
      expect(cache.size).toBe(1);
      expect(cache.get("a")).toBe(2);
    });

    it("overwriting does not evict other entries", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("a", 10);
      expect(cache.size).toBe(2);
      expect(cache.get("a")).toBe(10);
      expect(cache.get("b")).toBe(2);
    });
  });

  describe("capacity edge cases", () => {
    it("capacity of 1 always holds the most recent value", () => {
      const cache = new LRUCache<string, number>(1);
      cache.set("a", 1);
      expect(cache.get("a")).toBe(1);
      cache.set("b", 2);
      expect(cache.has("a")).toBe(false);
      expect(cache.get("b")).toBe(2);
    });

    it("capacity of 0 never stores anything", () => {
      const cache = new LRUCache<string, number>(0);
      cache.set("a", 1);
      expect(cache.size).toBe(0);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.has("a")).toBe(false);
    });

    it("handles many insertions past capacity", () => {
      const cache = new LRUCache<number, number>(3);
      for (let i = 0; i < 100; i++) {
        cache.set(i, i * 10);
      }
      expect(cache.size).toBe(3);
      expect(cache.has(99)).toBe(true);
      expect(cache.has(98)).toBe(true);
      expect(cache.has(97)).toBe(true);
      expect(cache.has(96)).toBe(false);
    });
  });

  describe("has()", () => {
    it("does not refresh recency", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      expect(cache.has("a")).toBe(true);
      cache.set("c", 3);
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });
  });

  describe("clear()", () => {
    it("removes all entries", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has("a")).toBe(false);
      expect(cache.get("a")).toBeUndefined();
    });

    it("allows reuse after clearing", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.clear();
      cache.set("c", 3);
      expect(cache.size).toBe(1);
      expect(cache.get("c")).toBe(3);
    });
  });

  describe("non-string keys", () => {
    it("supports numeric keys", () => {
      const cache = new LRUCache<number, string>(2);
      cache.set(1, "one");
      cache.set(2, "two");
      cache.set(3, "three");
      expect(cache.get(1)).toBeUndefined();
      expect(cache.get(2)).toBe("two");
      expect(cache.get(3)).toBe("three");
    });

    it("supports object keys by reference", () => {
      const cache = new LRUCache<object, number>(2);
      const k1 = { id: 1 };
      const k2 = { id: 2 };
      cache.set(k1, 100);
      cache.set(k2, 200);
      expect(cache.get(k1)).toBe(100);
      expect(cache.get(k2)).toBe(200);
    });
  });
});
