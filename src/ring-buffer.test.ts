import { describe, expect, it } from "vitest";

import { RingBuffer } from "./ring-buffer";

describe("RingBuffer", () => {
  it("starts empty", () => {
    const rb = new RingBuffer<number>(3);
    expect(rb.length).toBe(0);
    expect(rb.toArray()).toEqual([]);
  });

  it("grows up to capacity and reports the correct length", () => {
    const rb = new RingBuffer<number>(3);
    rb.add(1);
    expect(rb.length).toBe(1);
    rb.add(2);
    expect(rb.length).toBe(2);
    rb.add(3);
    expect(rb.length).toBe(3);
    expect(rb.toArray()).toEqual([1, 2, 3]);
  });

  it("keeps the most recent items when capacity is exceeded, evicting the oldest first", () => {
    const rb = new RingBuffer<number>(3);
    rb.add(1);
    rb.add(2);
    rb.add(3);
    rb.add(4);
    expect(rb.toArray()).toEqual([2, 3, 4]);
    rb.add(5);
    expect(rb.toArray()).toEqual([3, 4, 5]);
  });

  it("does not evict when add does not exceed capacity", () => {
    const rb = new RingBuffer<number>(5);
    rb.add(10);
    rb.add(20);
    rb.add(30);
    expect(rb.toArray()).toEqual([10, 20, 30]);
    expect(rb.length).toBe(3);
  });

  it("returns a copy from toArray, not the internal buffer", () => {
    const rb = new RingBuffer<number>(3);
    rb.add(1);
    rb.add(2);
    const arr = rb.toArray();
    arr.push(99);
    expect(rb.toArray()).toEqual([1, 2]);
    expect(rb.length).toBe(2);
  });

  it("preserves insertion order in toArray", () => {
    const rb = new RingBuffer<string>(4);
    rb.add("a");
    rb.add("b");
    rb.add("c");
    rb.add("d");
    rb.add("e");
    rb.add("f");
    expect(rb.toArray()).toEqual(["c", "d", "e", "f"]);
  });

  it("supports complex object types", () => {
    type Item = { id: number; name: string };
    const rb = new RingBuffer<Item>(2);
    rb.add({ id: 1, name: "a" });
    rb.add({ id: 2, name: "b" });
    rb.add({ id: 3, name: "c" });
    expect(rb.toArray()).toEqual([
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ]);
    expect(rb.length).toBe(2);
  });

  it("each call to toArray returns an independent array", () => {
    const rb = new RingBuffer<number>(2);
    rb.add(1);
    rb.add(2);
    const a = rb.toArray();
    const b = rb.toArray();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it("length stays bounded by capacity even after many adds", () => {
    const rb = new RingBuffer<number>(2);
    for (let i = 0; i < 100; i++) rb.add(i);
    expect(rb.length).toBe(2);
    expect(rb.toArray()).toEqual([98, 99]);
  });

  it("works with capacity of 1 (only the most recent item is kept)", () => {
    const rb = new RingBuffer<number>(1);
    rb.add(1);
    expect(rb.toArray()).toEqual([1]);
    rb.add(2);
    expect(rb.toArray()).toEqual([2]);
    rb.add(3);
    expect(rb.toArray()).toEqual([3]);
    expect(rb.length).toBe(1);
  });

  it("handles zero-length reads on a never-added buffer of any capacity", () => {
    expect(new RingBuffer<number>(1).toArray()).toEqual([]);
    expect(new RingBuffer<number>(10).toArray()).toEqual([]);
    expect(new RingBuffer<number>(100).length).toBe(0);
  });

  it("can store falsy values without dropping them", () => {
    const rb = new RingBuffer<number>(3);
    rb.add(0);
    rb.add(-0);
    rb.add(NaN);
    const out = rb.toArray();
    expect(out.length).toBe(3);
    expect(out[0]).toBe(0);
    expect(Number.isNaN(out[2])).toBe(true);
  });
});
