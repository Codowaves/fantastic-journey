import { describe, expect, it } from "vitest";

import { sumBy } from "./sum-by";

describe("sumBy", () => {
  it("returns 0 for an empty array", () => {
    expect(sumBy<unknown>([], () => 1)).toBe(0);
  });

  it("sums projected values across multiple items", () => {
    expect(sumBy([{ n: 1 }, { n: 2 }, { n: 3 }], (x) => x.n)).toBe(6);
  });

  it("returns the projected value for a single-element array", () => {
    expect(sumBy([{ n: 42 }], (x) => x.n)).toBe(42);
  });

  it("handles negative and zero projected values", () => {
    expect(sumBy([{ n: -1 }, { n: 0 }, { n: 1 }], (x) => x.n)).toBe(0);
  });
});
