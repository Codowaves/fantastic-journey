import { describe, expect, it } from "vitest";
import { identity, transpose } from "./seed-matrix.js";

describe("transpose", () => {
  it("transposes a 2x3 matrix to 3x2", () => {
    expect(
      transpose([
        [1, 2, 3],
        [4, 5, 6],
      ]),
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("transposes a 3x2 matrix to 2x3", () => {
    expect(
      transpose([
        [1, 4],
        [2, 5],
        [3, 6],
      ]),
    ).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("transposes a square matrix", () => {
    expect(
      transpose([
        [1, 2],
        [3, 4],
      ]),
    ).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  it("transposing twice returns the original matrix", () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(transpose(transpose(m))).toEqual(m);
  });

  it("returns an empty array for an empty matrix", () => {
    expect(transpose([])).toEqual([]);
  });

  it("transposes a single-row matrix into a column", () => {
    expect(transpose([[1, 2, 3, 4]])).toEqual([[1], [2], [3], [4]]);
  });

  it("transposes a single-column matrix into a row", () => {
    expect(transpose([[1], [2], [3], [4]])).toEqual([[1, 2, 3, 4]]);
  });

  it("transposes a 1x1 matrix", () => {
    expect(transpose([[42]])).toEqual([[42]]);
  });

  it("preserves generic element types", () => {
    expect(
      transpose<string>([
        ["a", "b"],
        ["c", "d"],
      ]),
    ).toEqual([
      ["a", "c"],
      ["b", "d"],
    ]);
  });
});

describe("transpose error/fallback paths", () => {
  it("returns [] when called with a non-iterable-coerced empty matrix (Array(0))", () => {
    expect(transpose(Array(0))).toEqual([]);
  });

  it("does not throw on an empty matrix", () => {
    expect(() => transpose([])).not.toThrow();
  });

  it("does not throw on a 1x1 matrix", () => {
    expect(() => transpose([[1]])).not.toThrow();
  });

  it("does not throw on a jagged (ragged) matrix", () => {
    // Rows of unequal length exercise the column-wise map() branch with
    // missing trailing slots — the implementation must not throw.
    expect(() =>
      transpose([
        [1, 2, 3],
        [4, 5],
      ]),
    ).not.toThrow();
  });

  it("produces a column vector from a 1xN row", () => {
    expect(transpose([[1, 2, 3, 4, 5]])).toEqual([[1], [2], [3], [4], [5]]);
  });

  it("produces a row vector from an Nx1 column", () => {
    expect(transpose([[1], [2], [3], [4], [5]])).toEqual([[1, 2, 3, 4, 5]]);
  });

  it("transposes a 4x2 matrix to 2x4", () => {
    expect(
      transpose([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ]),
    ).toEqual([
      [1, 3, 5, 7],
      [2, 4, 6, 8],
    ]);
  });

  it("handles matrices of strings without throwing on the empty fallback", () => {
    expect(transpose<string>([])).toEqual([]);
  });

  it("does not throw on a frozen row matrix", () => {
    const frozen = Object.freeze([
      [1, 2, 3],
      [4, 5, 6],
    ]) as number[][];
    expect(() => transpose(frozen)).not.toThrow();
  });

  it("does not throw on a sealed row matrix", () => {
    const sealed = Object.seal([
      [1, 2],
      [3, 4],
    ]) as number[][];
    expect(() => transpose(sealed)).not.toThrow();
  });
});

describe("identity error/fallback paths", () => {
  it("does not throw on n=0", () => {
    expect(() => identity(0)).not.toThrow();
  });

  it("does not throw on n=1", () => {
    expect(() => identity(1)).not.toThrow();
  });

  it("does not throw on a large n", () => {
    expect(() => identity(50)).not.toThrow();
  });

  it("returns an empty outer array for n=0 (fallback branch)", () => {
    const m = identity(0);
    expect(m).toEqual([]);
    expect(m).toHaveLength(0);
  });

  it("returns an n-element array of n-element rows for n>0", () => {
    const n = 6;
    const m = identity(n);
    expect(m).toHaveLength(n);
    for (const row of m) {
      expect(row).toHaveLength(n);
    }
  });

  it("places exactly one `1` per row on the diagonal", () => {
    const n = 5;
    const m = identity(n);
    for (let i = 0; i < n; i++) {
      const row = m[i]!;
      const ones = row.filter((v) => v === 1);
      expect(ones).toHaveLength(1);
      expect(ones[0]).toBe(1);
      expect(row[i]).toBe(1);
    }
  });

  it("produces only numeric 0/1 entries (no NaN, no negatives)", () => {
    const m = identity(4);
    for (const row of m) {
      for (const v of row) {
        expect(Number.isFinite(v)).toBe(true);
        expect([0, 1]).toContain(v);
      }
    }
  });

  it("does not share row references between rows (independent allocations)", () => {
    const m = identity(3);
    expect(m[0]).not.toBe(m[1]);
    expect(m[1]).not.toBe(m[2]);
  });
});

describe("identity", () => {
  it("returns a 1x1 identity", () => {
    expect(identity(1)).toEqual([[1]]);
  });

  it("returns a 2x2 identity", () => {
    expect(identity(2)).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  it("returns a 3x3 identity", () => {
    expect(identity(3)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  it("returns a 5x5 identity", () => {
    expect(identity(5)).toEqual([
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ]);
  });

  it("returns an empty array for n=0", () => {
    expect(identity(0)).toEqual([]);
  });

  it("produces a square matrix of size n", () => {
    const n = 4;
    const m = identity(n);
    expect(m).toHaveLength(n);
    for (const row of m) {
      expect(row).toHaveLength(n);
    }
  });

  it("has ones on the diagonal and zeros elsewhere", () => {
    const n = 4;
    const m = identity(n);
    for (let i = 0; i < n; i++) {
      const row = m[i]!;
      for (let j = 0; j < n; j++) {
        expect(row[j]).toBe(i === j ? 1 : 0);
      }
    }
  });
});
