import { describe, expect, it } from "vitest";

import { farewell } from "./farewell";

describe("farewell", () => {
  it("bids farewell to the given name", () => {
    expect(farewell("World")).toBe("Goodbye, World!");
  });

  it("handles an empty string by returning the base farewell", () => {
    expect(farewell("")).toBe("Goodbye, !");
  });

  it("returns the base farewell when name is null", () => {
    expect(farewell(null as unknown as string)).toBe("Goodbye!");
  });

  it("returns the base farewell when name is undefined", () => {
    expect(farewell(undefined as unknown as string)).toBe("Goodbye!");
  });

  it("returns the base farewell when name is NaN", () => {
    expect(farewell(NaN as unknown as string)).toBe("Goodbye!");
  });
});
