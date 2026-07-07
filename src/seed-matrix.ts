/**
 * Transposes a 2D matrix, swapping rows and columns.
 * @param m - The input matrix as an array of rows. May be empty.
 * @returns A new matrix where element at [r][c] in the input is at [c][r] in the output. Returns `[]` when `m` is empty.
 */
export function transpose<T>(m: T[][]): T[][] {
  return m[0] ? m[0].map((_, c) => m.map((r) => r[c] as T)) : [];
}
/**
 * Builds an n×n identity matrix with ones on the diagonal and zeros elsewhere.
 * @param n - The dimension of the square matrix. Returns `[]` when `n` is 0.
 * @returns An n×n array representing the identity matrix.
 */
export function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}
