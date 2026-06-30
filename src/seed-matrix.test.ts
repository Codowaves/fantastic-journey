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
