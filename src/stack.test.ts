import { describe, expect, it } from "vitest";

import { Stack } from "./stack";

describe("Stack", () => {
  describe("push", () => {
    it("adds an item to the top of the stack", () => {
      const stack = new Stack<number>();
      stack.push(1);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(1);
    });

    it("adds multiple items in LIFO order", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.size).toBe(3);
      expect(stack.peek()).toBe(3);
    });

    it("works with strings", () => {
      const stack = new Stack<string>();
      stack.push("a");
      stack.push("b");
      expect(stack.peek()).toBe("b");
      expect(stack.size).toBe(2);
    });

    it("works with objects by reference", () => {
      const obj = { id: 1 };
      const stack = new Stack<typeof obj>();
      stack.push(obj);
      expect(stack.peek()).toBe(obj);
      expect(stack.size).toBe(1);
    });

    it("allows pushing the same value multiple times", () => {
      const stack = new Stack<number>();
      stack.push(5);
      stack.push(5);
      stack.push(5);
      expect(stack.size).toBe(3);
      expect(stack.peek()).toBe(5);
    });
  });

  describe("pop", () => {
    it("removes and returns the top item", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.pop()).toBe(2);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(1);
    });

    it("returns undefined when popping from an empty stack", () => {
      const stack = new Stack<number>();
      expect(stack.pop()).toBeUndefined();
    });

    it("returns undefined after the last item is popped", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.pop();
      expect(stack.pop()).toBeUndefined();
      expect(stack.size).toBe(0);
    });

    it("supports repeated pop calls", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
      expect(stack.pop()).toBeUndefined();
    });
  });

  describe("peek", () => {
    it("returns the top item without removing it", () => {
      const stack = new Stack<number>();
      stack.push(42);
      expect(stack.peek()).toBe(42);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(42);
    });

    it("returns undefined when the stack is empty", () => {
      const stack = new Stack<number>();
      expect(stack.peek()).toBeUndefined();
    });

    it("returns undefined after all items are popped", () => {
      const stack = new Stack<string>();
      stack.push("x");
      stack.pop();
      expect(stack.peek()).toBeUndefined();
    });
  });

  describe("size", () => {
    it("starts at 0 for a new stack", () => {
      const stack = new Stack<number>();
      expect(stack.size).toBe(0);
    });

    it("reflects push operations", () => {
      const stack = new Stack<number>();
      stack.push(1);
      expect(stack.size).toBe(1);
      stack.push(2);
      expect(stack.size).toBe(2);
      stack.push(3);
      expect(stack.size).toBe(3);
    });

    it("reflects pop operations", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.pop();
      expect(stack.size).toBe(1);
    });
  });

  describe("isEmpty", () => {
    it("returns true for a new stack", () => {
      const stack = new Stack<number>();
      expect(stack.isEmpty()).toBe(true);
    });

    it("returns false after pushing", () => {
      const stack = new Stack<number>();
      stack.push(1);
      expect(stack.isEmpty()).toBe(false);
    });

    it("returns true after popping the last item", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.pop();
      expect(stack.isEmpty()).toBe(true);
    });

    it("agrees with size === 0", () => {
      const stack = new Stack<number>();
      expect(stack.isEmpty()).toBe(stack.size === 0);
      stack.push(1);
      expect(stack.isEmpty()).toBe(stack.size === 0);
      stack.pop();
      expect(stack.isEmpty()).toBe(stack.size === 0);
    });
  });

  describe("LIFO behavior", () => {
    it("push then pop yields the pushed value", () => {
      const stack = new Stack<number>();
      stack.push(99);
      expect(stack.pop()).toBe(99);
    });

    it("mixed push and pop interleaved", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.pop()).toBe(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(1);
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe("with null and undefined values", () => {
    it("can hold null values", () => {
      const stack = new Stack<number | null>();
      stack.push(null);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBeNull();
      expect(stack.pop()).toBeNull();
      expect(stack.isEmpty()).toBe(true);
    });

    it("can hold undefined values", () => {
      const stack = new Stack<number | undefined>();
      stack.push(undefined);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBeUndefined();
      expect(stack.pop()).toBeUndefined();
      expect(stack.isEmpty()).toBe(true);
    });
  });
});
