import {
  euclidean as euclideanRaw,
  manhattan as manhattanRaw,
} from "../distance";

function ensureCoord(value: number, name: string): number {
  if (value === null || value === undefined) {
    throw new TypeError(
      `geo: ${name} must be a number, got ${value === null ? "null" : "undefined"}`,
    );
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(
      `geo: ${name} must be a finite number, got ${String(value)}`,
    );
  }
  return value;
}

/**
 * Computes the Euclidean (L2) distance between two 2D points.
 *
 * Throws when any coordinate is `null`, `undefined`, or `NaN`.
 *
 * @param ax - The x-coordinate of the first point.
 * @param ay - The y-coordinate of the first point.
 * @param bx - The x-coordinate of the second point.
 * @param by - The y-coordinate of the second point.
 * @returns The Euclidean distance between `(ax, ay)` and `(bx, by)`.
 *
 * @example
 * euclidean(0, 0, 3, 4); // 5
 */
export function euclidean(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return euclideanRaw(
    ensureCoord(ax, "ax"),
    ensureCoord(ay, "ay"),
    ensureCoord(bx, "bx"),
    ensureCoord(by, "by"),
  );
}

/**
 * Computes the Manhattan (L1) distance between two 2D points.
 *
 * Throws when any coordinate is `null`, `undefined`, or `NaN`.
 *
 * @param ax - The x-coordinate of the first point.
 * @param ay - The y-coordinate of the first point.
 * @param bx - The x-coordinate of the second point.
 * @param by - The y-coordinate of the second point.
 * @returns The Manhattan distance between `(ax, ay)` and `(bx, by)`.
 *
 * @example
 * manhattan(0, 0, 3, 4); // 7
 */
export function manhattan(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return manhattanRaw(
    ensureCoord(ax, "ax"),
    ensureCoord(ay, "ay"),
    ensureCoord(bx, "bx"),
    ensureCoord(by, "by"),
  );
}
