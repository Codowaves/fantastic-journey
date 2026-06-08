import { describe, expect, it } from "vitest";

import { farewell } from "./farewell";

describe("farewell", () => {
  it("returns a friendly goodbye greeting for the given name", () => {
    expect(farewell("Alice")).toBe("Goodbye, Alice!");
  });

  it("handles an empty name", () => {
    expect(farewell("")).toBe("Goodbye, !");
  });

  it("preserves the name exactly as provided", () => {
    expect(farewell("Bob the Builder")).toBe("Goodbye, Bob the Builder!");
  });
});
