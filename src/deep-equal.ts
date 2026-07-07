/**
 * Performs a deep structural comparison of two values.
 *
 * Primitives are compared with Object.is semantics (NaN equals NaN; +0 does not equal -0).
 * Arrays are compared by length and element-wise deep equality.
 * Plain objects are compared by key set and per-key deep equality.
 * Date instances are compared by timestamp.
 * Values of different types are never equal.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns `true` if `a` and `b` are structurally equal, `false` otherwise.
 *
 * Limitations: Does not handle Map, Set, or cyclic structures.
 *
 * @example
 * deepEqual(1, 1); // true
 * deepEqual([1, 2, 3], [1, 2, 3]); // true
 * deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }); // true
 * deepEqual(NaN, NaN); // true
 * deepEqual({ a: 1 }, { a: 2 }); // false
 * deepEqual(null, {}); // false
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Use Object.is for primitive comparison (handles NaN, +0/-0 correctly)
  if (Object.is(a, b)) {
    return true;
  }

  // If either is null or not an object, they're not equal (already checked Object.is)
  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false;
  }

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // One is Date but the other isn't
  if (a instanceof Date || b instanceof Date) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // One is array but the other isn't
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle plain objects
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check all keys exist and values are deeply equal
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
}
