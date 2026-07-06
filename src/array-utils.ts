/**
 * Returns a new array with duplicate values removed, preserving the order
 * of first occurrence.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Returns a new array with the elements shuffled in random order using the
 * Fisher-Yates algorithm. The original array is not modified.
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}
