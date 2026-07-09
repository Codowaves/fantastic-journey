import { describe, expect, it } from "vitest";

import { farewell } from "./farewell";

describe("farewell", () => {
  it("bids farewell to the given name", () => {
    expect(farewell("World")).toBe("Goodbye, World!");
  });

  it("handles an empty string by returning the base farewell", () => {
    expect(farewell("")).toBe("Goodbye, !");
  });

  it("returns the friend fallback for null", () => {
    expect(farewell(null as unknown as string)).toBe("Goodbye, friend!");
  });

  it("returns the friend fallback for undefined", () => {
    expect(farewell(undefined as unknown as string)).toBe("Goodbye, friend!");
  });

  it("returns the friend fallback for NaN", () => {
    expect(farewell(Number.NaN as unknown as string)).toBe("Goodbye, friend!");
  });
});
