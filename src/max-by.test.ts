import { describe, expect, it } from "vitest";

import { maxBy } from "./max-by";

describe("maxBy", () => {
  it("returns the element with the largest key", () => {
    const people = [
      { name: "Ada", age: 36 },
      { name: "Bob", age: 24 },
      { name: "Cleo", age: 51 },
    ];
    expect(maxBy(people, (p) => p.age)).toEqual({ name: "Cleo", age: 51 });
  });

  it("returns the first element on a tie", () => {
    const items = [
      { id: "a", score: 5 },
      { id: "b", score: 5 },
      { id: "c", score: 5 },
    ];
    expect(maxBy(items, (i) => i.score)).toEqual({ id: "a", score: 5 });
  });

  it("returns undefined for an empty array", () => {
    expect(maxBy([], (n: number) => n)).toBeUndefined();
  });

  it("returns the only element of a single-item array", () => {
    expect(maxBy([42], (n) => n)).toBe(42);
  });

  it("handles negative keys", () => {
    expect(maxBy([-3, -7, -1, -10], (n) => n)).toBe(-1);
  });
});
