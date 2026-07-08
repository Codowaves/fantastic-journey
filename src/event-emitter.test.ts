import { describe, it, expect, vi } from "vitest";
import { TypedEventEmitter } from "./event-emitter";

interface TestEvents {
  message: string;
  count: number;
  data: { id: number; name: string };
  noPayload: undefined;
}

describe("TypedEventEmitter", () => {
  it("should emit and receive events (on/emit round-trip)", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("message", listener);
    emitter.emit("message", "hello");

    expect(listener).toHaveBeenCalledWith("hello");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe via returned function", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    const unsubscribe = emitter.on("message", listener);
    emitter.emit("message", "first");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitter.emit("message", "second");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe via off method", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("message", listener);
    emitter.emit("message", "first");
    expect(listener).toHaveBeenCalledTimes(1);

    emitter.off("message", listener);
    emitter.emit("message", "second");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should fire once listeners exactly once", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.once("count", listener);
    emitter.emit("count", 1);
    emitter.emit("count", 2);
    emitter.emit("count", 3);

    expect(listener).toHaveBeenCalledWith(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should handle re-entrant emit from inside a once listener", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: number[] = [];

    emitter.once("count", (n) => {
      calls.push(n);
      if (n === 1) {
        emitter.emit("count", 2);
      }
    });

    emitter.emit("count", 1);
    emitter.emit("count", 3);

    expect(calls).toEqual([1]);
  });

  it("should call listeners in registration order", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: string[] = [];

    emitter.on("message", () => calls.push("first"));
    emitter.on("message", () => calls.push("second"));
    emitter.on("message", () => calls.push("third"));

    emitter.emit("message", "test");

    expect(calls).toEqual(["first", "second", "third"]);
  });

  it("should not block remaining listeners when one throws", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: number[] = [];

    emitter.on("count", () => calls.push(1));
    emitter.on("count", () => {
      calls.push(2);
      throw new Error("Test error");
    });
    emitter.on("count", () => calls.push(3));

    expect(() => emitter.emit("count", 42)).toThrow("Test error");
    expect(calls).toEqual([1, 2, 3]);
  });

  it("should throw first error when multiple listeners throw", () => {
    const emitter = new TypedEventEmitter<TestEvents>();

    emitter.on("count", () => {
      throw new Error("First error");
    });
    emitter.on("count", () => {
      throw new Error("Second error");
    });

    expect(() => emitter.emit("count", 42)).toThrow("First error");
  });

  it("should apply removal-during-emit on next emit, not current", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: string[] = [];
    let unsubscribeB: (() => void) | null = null;

    emitter.on("message", () => {
      calls.push("A");
      if (unsubscribeB) unsubscribeB();
    });
    unsubscribeB = emitter.on("message", () => calls.push("B"));
    emitter.on("message", () => calls.push("C"));

    emitter.emit("message", "first");
    expect(calls).toEqual(["A", "B", "C"]);

    calls.length = 0;
    emitter.emit("message", "second");
    expect(calls).toEqual(["A", "C"]);
  });

  it("should return correct listener count", () => {
    const emitter = new TypedEventEmitter<TestEvents>();

    expect(emitter.listenerCount("message")).toBe(0);

    const unsub1 = emitter.on("message", () => {});
    expect(emitter.listenerCount("message")).toBe(1);

    const unsub2 = emitter.on("message", () => {});
    expect(emitter.listenerCount("message")).toBe(2);

    emitter.on("count", () => {});
    expect(emitter.listenerCount("message")).toBe(2);
    expect(emitter.listenerCount("count")).toBe(1);

    unsub1();
    expect(emitter.listenerCount("message")).toBe(1);

    unsub2();
    expect(emitter.listenerCount("message")).toBe(0);
  });

  it("should handle multiple events independently", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const messageCalls: string[] = [];
    const countCalls: number[] = [];

    emitter.on("message", (msg) => messageCalls.push(msg));
    emitter.on("count", (n) => countCalls.push(n));

    emitter.emit("message", "hello");
    emitter.emit("count", 42);

    expect(messageCalls).toEqual(["hello"]);
    expect(countCalls).toEqual([42]);
  });

  it("should handle complex payloads", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("data", listener);
    emitter.emit("data", { id: 1, name: "test" });

    expect(listener).toHaveBeenCalledWith({ id: 1, name: "test" });
  });

  it("should handle undefined payloads", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("noPayload", listener);
    emitter.emit("noPayload", undefined);

    expect(listener).toHaveBeenCalledWith(undefined);
  });

  it("should handle once with unsubscribe before emit", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    const unsubscribe = emitter.once("message", listener);
    unsubscribe();
    emitter.emit("message", "test");

    expect(listener).not.toHaveBeenCalled();
  });

  it("should not fail when emitting to event with no listeners", () => {
    const emitter = new TypedEventEmitter<TestEvents>();

    expect(() => emitter.emit("message", "test")).not.toThrow();
  });

  it("should not fail when removing non-existent listener", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    expect(() => emitter.off("message", listener)).not.toThrow();
  });

  it("should return 0 listenerCount for an event that was never registered", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    expect(emitter.listenerCount("message")).toBe(0);
    expect(emitter.listenerCount("count")).toBe(0);
    expect(emitter.listenerCount("data")).toBe(0);
    expect(emitter.listenerCount("noPayload")).toBe(0);
  });

  it("should not fail when off is called for an event that has no listener set", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    // Never registered any listener for "message"
    expect(() => emitter.off("message", listener)).not.toThrow();
    expect(emitter.listenerCount("message")).toBe(0);
  });

  it("should deduplicate the same listener registered twice", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("message", listener);
    emitter.on("message", listener);

    emitter.emit("message", "hello");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(emitter.listenerCount("message")).toBe(1);
  });

  it("should fire each distinct listener exactly once", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();

    emitter.on("message", a);
    emitter.on("message", b);
    emitter.on("message", a);

    emitter.emit("message", "hello");

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(emitter.listenerCount("message")).toBe(2);
  });

  it("should not affect other listeners when off is called", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    const c = vi.fn();

    emitter.on("message", a);
    emitter.on("message", b);
    emitter.on("message", c);

    emitter.off("message", b);

    emitter.emit("message", "hi");

    expect(a).toHaveBeenCalledWith("hi");
    expect(b).not.toHaveBeenCalled();
    expect(c).toHaveBeenCalledWith("hi");
    expect(emitter.listenerCount("message")).toBe(2);
  });

  it("should not fire listeners added during emit until the next emit", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: string[] = [];

    emitter.on("message", () => {
      calls.push("first");
      emitter.on("message", () => calls.push("late"));
    });

    emitter.emit("message", "one");
    expect(calls).toEqual(["first"]);

    emitter.emit("message", "two");
    expect(calls).toEqual(["first", "first", "late"]);
  });

  it("should allow once listeners to coexist with regular listeners", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const persistent = vi.fn();
    const oneShot = vi.fn();

    emitter.on("message", persistent);
    emitter.once("message", oneShot);

    emitter.emit("message", "first");
    emitter.emit("message", "second");

    expect(persistent).toHaveBeenCalledTimes(2);
    expect(oneShot).toHaveBeenCalledTimes(1);
    expect(oneShot).toHaveBeenCalledWith("first");
    expect(emitter.listenerCount("message")).toBe(1);
  });

  it("should not error when once listener is removed after it already fired", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    const unsubscribe = emitter.once("message", listener);
    emitter.emit("message", "fired");

    expect(() => unsubscribe()).not.toThrow();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should convert a thrown non-Error value into an Error", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    emitter.on("count", () => {
      throw "string-thrown";
    });

    expect(() => emitter.emit("count", 1)).toThrow(Error);
    expect(() => emitter.emit("count", 1)).toThrow("string-thrown");
  });

  it("should not call any listener when emitting an event with no registered Set", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    // Register and then unsubscribe everything
    const unsub = emitter.on("message", listener);
    unsub();

    expect(emitter.listenerCount("message")).toBe(0);
    expect(() => emitter.emit("message", "hello")).not.toThrow();
    expect(listener).not.toHaveBeenCalled();
  });

  it("should handle a long chain of many listeners", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: number[] = [];
    const total = 100;

    for (let i = 0; i < total; i++) {
      emitter.on("count", () => calls.push(i));
    }

    emitter.emit("count", 0);

    expect(calls.length).toBe(total);
    expect(calls[0]).toBe(0);
    expect(calls[total - 1]).toBe(total - 1);
    expect(emitter.listenerCount("count")).toBe(total);
  });

  it("should make once listener idempotent across rapid emit cycles", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.once("count", listener);

    expect(listener).toHaveBeenCalledTimes(0);
    emitter.emit("count", 1);
    expect(listener).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 5; i++) {
      emitter.emit("count", i + 2);
    }
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it("should not throw when listenerCount is called after all listeners removed", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const unsub = emitter.on("message", () => {});
    expect(emitter.listenerCount("message")).toBe(1);

    unsub();
    expect(emitter.listenerCount("message")).toBe(0);

    // Re-register and verify count returns to 1
    emitter.on("message", () => {});
    expect(emitter.listenerCount("message")).toBe(1);
  });

  it("should handle emit with payload of falsy values", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const messageListener = vi.fn();
    const countListener = vi.fn();

    emitter.on("message", messageListener);
    emitter.on("count", countListener);

    expect(() => emitter.emit("message", "")).not.toThrow();
    expect(() => emitter.emit("count", 0)).not.toThrow();

    expect(messageListener).toHaveBeenCalledWith("");
    expect(countListener).toHaveBeenCalledWith(0);
  });
});
