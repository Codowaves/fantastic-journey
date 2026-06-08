import { describe, expect, it } from "vitest";

import { greeting } from "./greeting";

describe("greeting", () => {
  it("greets the given name", () => {
    expect(greeting("World")).toBe("Hello, World!");
  });

  it("handles an empty string by returning the base greeting", () => {
    expect(greeting("")).toBe("Hello, !");
  });
});
