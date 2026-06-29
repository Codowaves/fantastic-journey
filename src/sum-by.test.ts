import { describe, expect, it } from "vitest";

import { sumBy } from "./sum-by";

describe("sumBy", () => {
  it("returns 0 for an empty array", () => {
    expect(sumBy([], (n: number) => n)).toBe(0);
  });

  it("sums a property extracted from objects", () => {
    const items = [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }];
    expect(sumBy(items, (x) => x.n)).toBe(10);
  });

  it("applies the transform function before adding", () => {
    expect(sumBy([1, 2, 3, 4], (n) => n * 10)).toBe(100);
  });

  it("returns 0 when fn always returns 0", () => {
    expect(sumBy([1, 2, 3], () => 0)).toBe(0);
  });

  it("handles negative values", () => {
    expect(sumBy([-1, 2, -3, 4], (n) => n)).toBe(2);
  });
});
