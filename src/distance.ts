/**
 * Computes the Euclidean (L2) distance between two 2D points.
 *
 * @param ax - The x-coordinate of the first point.
 * @param ay - The y-coordinate of the first point.
 * @param bx - The x-coordinate of the second point.
 * @param by - The y-coordinate of the second point.
 * @returns The Euclidean distance between `(ax, ay)` and `(bx, by)`.
 */
export function euclidean(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes the Manhattan (L1) distance between two 2D points.
 *
 * @param ax - The x-coordinate of the first point.
 * @param ay - The y-coordinate of the first point.
 * @param bx - The x-coordinate of the second point.
 * @param by - The y-coordinate of the second point.
 * @returns The Manhattan distance between `(ax, ay)` and `(bx, by)`.
 */
export function manhattan(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}
