/**
 * Transposes a 2D matrix, swapping rows and columns.
 *
 * @typeParam T - The element type of the matrix cells.
 * @param m - The input matrix as an array of rows. May be empty.
 * @returns A new matrix where element at [r][c] in the input is at [c][r] in
 *   the output. Returns `[]` when `m` is empty.
 *
 * @example
 * transpose([[1, 2, 3], [4, 5, 6]]);
 * // [[1, 4], [2, 5], [3, 6]]
 *
 * @example
 * // Single-row input becomes a column; single-column input becomes a row.
 * transpose([[1, 2, 3]]);
 * // [[1], [2], [3]]
 *
 * @example
 * // Applying transpose twice returns a matrix structurally equal to the original.
 * const m = [[1, 2], [3, 4]];
 * transpose(transpose(m));
 * // [[1, 2], [3, 4]]
 */
export function transpose<T>(m: T[][]): T[][] {
  return m[0] ? m[0].map((_, c) => m.map((r) => r[c] as T)) : [];
}
/**
 * Builds an n×n identity matrix with ones on the diagonal and zeros elsewhere.
 *
 * @param n - The dimension of the square matrix. Returns `[]` when `n` is 0.
 * @returns An n×n array representing the identity matrix.
 *
 * @example
 * identity(3);
 * // [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
 *
 * @example
 * identity(0);
 * // []
 */
export function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}
