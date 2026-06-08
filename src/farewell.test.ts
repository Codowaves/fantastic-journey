import { describe, expect, it } from "vitest";

import { farewell } from "./farewell";

describe("farewell", () => {
  it("bids farewell to the given name", () => {
    expect(farewell("World")).toBe("Goodbye, World!");
  });

  it("handles an empty string by returning the base farewell", () => {
    expect(farewell("")).toBe("Goodbye, !");
  });
});
