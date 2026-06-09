import { describe, expect, it, vi } from "vitest";

import { EventEmitter } from "./event-emitter";

type TestEvents = {
  hello: [string];
  count: [number, number];
  ping: [];
};

describe("EventEmitter", () => {
  it("calls a registered listener with the provided arguments", () => {
    const ee = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    ee.on("hello", listener);

    ee.emit("hello", "world");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("world");
  });

  it("supports multiple arguments in order", () => {
    const ee = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    ee.on("count", listener);

    ee.emit("count", 3, 7);

    expect(listener).toHaveBeenCalledWith(3, 7);
  });

  it("supports zero-argument events", () => {
    const ee = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    ee.on("ping", listener);

    ee.emit("ping");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith();
  });

  it("invokes multiple listeners in registration order", () => {
    const ee = new EventEmitter<TestEvents>();
    const order: string[] = [];

    ee.on("hello", () => order.push("first"));
    ee.on("hello", () => order.push("second"));
    ee.on("hello", () => order.push("third"));

    ee.emit("hello", "x");

    expect(order).toEqual(["first", "second", "third"]);
  });

  it("returns true when emit has listeners, false when none", () => {
    const ee = new EventEmitter<TestEvents>();
    expect(ee.emit("hello", "nobody")).toBe(false);

    ee.on("hello", () => {});
    expect(ee.emit("hello", "someone")).toBe(true);
  });

  it("off removes a specific listener", () => {
    const ee = new EventEmitter<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();

    ee.on("hello", a);
    ee.on("hello", b);
    ee.off("hello", a);

    ee.emit("hello", "x");

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("off is a no-op for unknown events or unregistered listeners", () => {
    const ee = new EventEmitter<TestEvents>();
    const a = vi.fn();
    ee.on("hello", a);

    // Unknown event
    expect(() => ee.off("count", () => {})).not.toThrow();
    // Listener not registered for this event
    expect(() => ee.off("hello", () => {})).not.toThrow();
    // Original listener still works
    ee.emit("hello", "y");
    expect(a).toHaveBeenCalledWith("y");
  });

  it("once fires only on the first emit, then auto-removes", () => {
    const ee = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    ee.once("hello", listener);

    ee.emit("hello", "first");
    ee.emit("hello", "second");
    ee.emit("hello", "third");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("first");
  });

  it("once listener that was removed does not block the second once listener", () => {
    const ee = new EventEmitter<TestEvents>();
    const first = vi.fn();
    const second = vi.fn();

    ee.once("hello", first);
    ee.once("hello", second);

    ee.emit("hello", "a");

    expect(first).toHaveBeenCalledWith("a");
    expect(second).toHaveBeenCalledWith("a");

    ee.emit("hello", "b");

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("a listener can remove itself during emit without skipping later listeners", () => {
    const ee = new EventEmitter<TestEvents>();
    const order: string[] = [];

    const self = () => {
      order.push("self");
      ee.off("hello", self);
    };
    const keep = () => order.push("keep");
    const after = () => order.push("after");

    ee.on("hello", self);
    ee.on("hello", keep);
    ee.on("hello", after);

    ee.emit("hello", "x");

    expect(order).toEqual(["self", "keep", "after"]);

    order.length = 0;
    ee.emit("hello", "y");

    expect(order).toEqual(["keep", "after"]);
  });

  it("a listener can remove a later listener during emit, but the rest still run", () => {
    const ee = new EventEmitter<TestEvents>();
    const order: string[] = [];

    const killer = () => {
      order.push("killer");
      ee.off("hello", victim);
    };
    const victim = () => order.push("victim");
    const tail = () => order.push("tail");

    ee.on("hello", killer);
    ee.on("hello", victim);
    ee.on("hello", tail);

    ee.emit("hello", "x");

    expect(order).toEqual(["killer", "victim", "tail"]);

    order.length = 0;
    ee.emit("hello", "y");

    expect(order).toEqual(["killer", "tail"]);
  });

  it("a once listener removes itself before invoking, preventing recursion", () => {
    const ee = new EventEmitter<TestEvents>();
    const calls: string[] = [];

    const recursive = vi.fn(() => {
      calls.push("recursive");
      if (recursive.mock.calls.length < 3) {
        ee.emit("hello", "inner");
      }
    });

    ee.once("hello", recursive);
    ee.emit("hello", "outer");

    expect(recursive).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["recursive"]);
  });

  it("re-adding the same listener after off works", () => {
    const ee = new EventEmitter<TestEvents>();
    const listener = vi.fn();

    ee.on("hello", listener);
    ee.off("hello", listener);
    ee.on("hello", listener);

    ee.emit("hello", "again");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("again");
  });

  it("returns this from on/off/once for chaining", () => {
    const ee = new EventEmitter<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    const c = vi.fn();

    const result = ee
      .on("hello", a)
      .once("hello", b)
      .off("hello", a)
      .on("count", c);

    expect(result).toBe(ee);

    ee.emit("hello", "x");
    ee.emit("count", 1, 2);

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith("x");
    expect(c).toHaveBeenCalledWith(1, 2);
  });
});
