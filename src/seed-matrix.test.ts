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

describe("error/throw paths", () => {
  describe("transpose", () => {
    it("does not throw on an empty matrix", () => {
      expect(() => transpose([])).not.toThrow();
    });

    it("does not throw on a 1x1 matrix", () => {
      expect(() => transpose([[42]])).not.toThrow();
    });

    it("does not throw on a frozen matrix", () => {
      const frozen = Object.freeze([
        [1, 2],
        [3, 4],
      ]) as number[][];
      expect(() => transpose(frozen)).not.toThrow();
      expect(transpose(frozen)).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });

    it("does not throw on a sealed matrix", () => {
      const sealed = Object.seal([
        [1, 2, 3],
        [4, 5, 6],
      ]) as number[][];
      expect(() => transpose(sealed)).not.toThrow();
      expect(transpose(sealed)).toEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ]);
    });

    it("does not throw when rows have different lengths (jagged input)", () => {
      // The implementation uses `r[c] as T` which silently yields undefined
      // for missing cells; this is the expected behavior and must not throw.
      expect(() =>
        transpose([
          [1, 2, 3],
          [4, 5],
        ]),
      ).not.toThrow();
      expect(() => transpose([[1], [2, 3], [4, 5, 6]])).not.toThrow();
    });

    it("returns undefined placeholders for short rows rather than throwing", () => {
      // r[c] is undefined when the source row is shorter than the widest row;
      // the `as T` cast means the result type is preserved at the TS level but
      // the runtime value is undefined.
      const result = transpose([
        [1, 2, 3],
        [4, 5],
      ]);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1, 4]);
      expect(result[1]).toEqual([2, 5]);
      expect(result[2]).toEqual([3, undefined]);
    });

    it("does not throw on a matrix produced by Array constructor", () => {
      const empty = Array(0) as number[][];
      expect(() => transpose(empty)).not.toThrow();
      expect(transpose(empty)).toEqual([]);
    });

    it("does not throw on a matrix with explicit undefined cells", () => {
      expect(() =>
        transpose([
          [1, undefined],
          [2, 3],
        ]),
      ).not.toThrow();
    });
  });

  describe("identity", () => {
    it("does not throw for n=0", () => {
      expect(() => identity(0)).not.toThrow();
    });

    it("does not throw for n=1", () => {
      expect(() => identity(1)).not.toThrow();
    });

    it("does not throw for a large n", () => {
      expect(() => identity(100)).not.toThrow();
    });

    it("does not throw for negative n (Array.from yields [])", () => {
      // Array.from with negative length produces an empty array — this is the
      // implicit fallback branch, not a thrown error.
      expect(() => identity(-1)).not.toThrow();
      expect(() => identity(-100)).not.toThrow();
      expect(identity(-5)).toEqual([]);
    });

    it("does not throw for NaN n", () => {
      // Array.from(NaN) — the length argument is coerced via ToLength, which
      // produces 0; this is the empty-array fallback branch.
      expect(() => identity(Number.NaN)).not.toThrow();
      expect(identity(Number.NaN)).toEqual([]);
    });

    it("throws RangeError for Infinity n", () => {
      // Array.from(Infinity) coerces Infinity via ToLength, but the resulting
      // allocation fails with "Invalid array length" — this is the throw
      // branch the task asks us to cover.
      expect(() => identity(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    });

    it("returns a new array each call (does not mutate frozen inputs)", () => {
      // identity takes a number and returns a fresh array; there is no input
      // array to freeze. Verify it returns distinct references.
      const a = identity(3);
      const b = identity(3);
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });
});
