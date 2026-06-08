import { describe, expect, it } from "vitest";

import { greeting } from "./greeting";

describe("greeting", () => {
  it("greets a person by name", () => {
    expect(greeting("World")).toBe("Hello, World!");
  });

  it("preserves surrounding whitespace in the name", () => {
    expect(greeting("  Ada  ")).toBe("Hello,   Ada  !");
  });

  it("returns a greeting even when the name is empty", () => {
    expect(greeting("")).toBe("Hello, !");
  });
});
