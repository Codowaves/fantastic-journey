import { describe, expect, it } from "vitest";

import { pluck } from "./pluck";

describe("pluck", () => {
  it("returns the values of the given key from each element", () => {
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Carol" },
    ];
    expect(pluck(users, "id")).toEqual([1, 2, 3]);
    expect(pluck(users, "name")).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(pluck([] as { id: number }[], "id")).toEqual([]);
  });

  it("preserves the element type for the extracted value", () => {
    const items = [{ v: "a" }, { v: "b" }];
    const result: string[] = pluck(items, "v");
    expect(result).toEqual(["a", "b"]);
  });
});
