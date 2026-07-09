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

describe("transpose error/throw paths", () => {
  it("does not throw on an empty matrix", () => {
    expect(() => transpose([])).not.toThrow();
  });

  it("does not throw when transposing a single empty row", () => {
    // m[0] is [] (truthy? no, [] is falsy) so transpose returns the empty branch.
    expect(() => transpose([[]])).not.toThrow();
    expect(transpose([[]])).toEqual([]);
  });

  it("does not throw when transposing a non-rectangular matrix (ragged rows)", () => {
    // transpose does not validate uniform row length; it just maps by index.
    // The first row has 3 elements, the second has 2.
    const ragged: number[][] = [
      [1, 2, 3],
      [4, 5],
    ];
    expect(() => transpose(ragged)).not.toThrow();
  });

  it("returns undefined for missing cells when rows are ragged", () => {
    // transpose uses the second row's r[1] index which is undefined; the
    // `as T` cast suppresses the type error but the runtime value is `undefined`.
    const ragged: (number | undefined)[][] = [
      [1, 2, 3],
      [4, 5],
    ];
    const t = transpose(ragged);
    expect(t).toHaveLength(3);
    expect(t[0]).toEqual([1, 4]);
    // cell at [2][1] would be the second row's index 2 — undefined.
    expect(t[2]?.[1]).toBeUndefined();
  });

  it("does not throw when transposing a matrix with null elements", () => {
    expect(() =>
      transpose([
        [null, null],
        [null, null],
      ]),
    ).not.toThrow();
  });

  it("does not throw when transposing a matrix with undefined elements", () => {
    const m: (number | undefined)[][] = [
      [undefined, 1],
      [2, undefined],
    ];
    expect(() => transpose(m)).not.toThrow();
  });

  it("does not throw when transposing an object-typed matrix", () => {
    const a = { id: 1 };
    const b = { id: 2 };
    expect(() =>
      transpose([
        [a, b],
        [b, a],
      ]),
    ).not.toThrow();
  });

  it("does not throw when transposing a very large matrix", () => {
    const big = Array.from({ length: 500 }, (_, r) =>
      Array.from({ length: 500 }, (_, c) => r * 500 + c),
    );
    expect(() => transpose(big)).not.toThrow();
  });

  it("does not throw when accessing properties off transposed row indices beyond input bounds", () => {
    // transpose uses `r[c]`; r is the row — if a row is sparse, `r[c]` is undefined.
    const sparse: (number | undefined)[][] = [[1]];
    expect(() => transpose(sparse)).not.toThrow();
    // 1 row -> 1 column. Index 0 of the column vector is the original cell [0][0].
    // Index 1+ would index into the second row which doesn't exist.
    const t = transpose(sparse);
    expect(t[0]?.[0]).toBe(1);
  });
});

describe("identity error/throw paths", () => {
  it("does not throw for n=0", () => {
    expect(() => identity(0)).not.toThrow();
  });

  it("does not throw for n=1", () => {
    expect(() => identity(1)).not.toThrow();
  });

  it("does not throw for very large n", () => {
    expect(() => identity(1000)).not.toThrow();
  });

  it("returns the correct shape when n is large", () => {
    const n = 500;
    const m = identity(n);
    expect(m).toHaveLength(n);
    for (let i = 0; i < n; i++) {
      expect(m[i]).toHaveLength(n);
    }
  });

  it("produces only numeric values for large n", () => {
    const m = identity(100);
    for (const row of m) {
      for (const cell of row) {
        expect(typeof cell).toBe("number");
      }
    }
  });

  it("does not throw and returns array literal for n=0", () => {
    const result = identity(0);
    expect(result).toEqual([]);
    // Array literal is a true array, not a typed wrapper
    expect(Array.isArray(result)).toBe(true);
  });

  it("does not throw when identity matrix entries are processed via toString", () => {
    // Each cell is a number — calling toString should always succeed.
    const m = identity(10);
    expect(() => {
      for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i]!.length; j++) {
          String(m[i]![j]!);
        }
      }
    }).not.toThrow();
  });
});
