import { describe, expect, it } from "vitest";

import { farewell } from "./farewell";

describe("farewell", () => {
  it("bids farewell to the given name", () => {
    expect(farewell("World")).toBe("Goodbye, World!");
  });

  it("handles an empty string by returning the base farewell", () => {
    expect(farewell("")).toBe("Goodbye, !");
  });

  it("throws TypeError when name is null or undefined", () => {
    expect(() => farewell(null as unknown as string)).toThrow(TypeError);
    expect(() => farewell(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when name is NaN", () => {
    expect(() => farewell(Number.NaN as unknown as string)).toThrow(TypeError);
  });
});
