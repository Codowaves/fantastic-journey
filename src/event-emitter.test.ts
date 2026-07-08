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

  it("should not fail when removing from event that was never registered", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    expect(() => emitter.off("count", listener)).not.toThrow();
    expect(emitter.listenerCount("count")).toBe(0);
  });

  it("should return 0 listenerCount for never-registered event", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    expect(emitter.listenerCount("message")).toBe(0);
    expect(emitter.listenerCount("count")).toBe(0);
  });

  it("should handle empty string payload", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("message", listener);
    emitter.emit("message", "");

    expect(listener).toHaveBeenCalledWith("");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should handle zero numeric payload", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("count", listener);
    emitter.emit("count", 0);

    expect(listener).toHaveBeenCalledWith(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should be safe to call unsubscribe twice", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    const unsubscribe = emitter.on("message", listener);
    unsubscribe();
    expect(() => unsubscribe()).not.toThrow();
    expect(emitter.listenerCount("message")).toBe(0);
  });

  it("should not invoke listener added after emit begins", () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: string[] = [];

    emitter.on("message", () => {
      calls.push("first");
      emitter.on("message", () => calls.push("late"));
    });

    emitter.emit("message", "x");
    expect(calls).toEqual(["first"]);

    emitter.emit("message", "y");
    expect(calls).toEqual(["first", "first", "late"]);
  });

  it("should handle listener throwing non-Error value", () => {
    const emitter = new TypedEventEmitter<TestEvents>();

    emitter.on("count", () => {
      throw "string error";
    });

    expect(() => emitter.emit("count", 1)).toThrow();
  });
});
