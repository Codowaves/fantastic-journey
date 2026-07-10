/**
 * Converts a positive integer to its ordinal string form (e.g. 1 -> "1st").
 *
 * @param n - A positive integer.
 * @returns The ordinal representation of `n`.
 */
export function toOrdinal(n: number): string {
  if (n === null || n === undefined || Number.isNaN(n)) {
    throw new TypeError("n must be a number");
  }
  const abs = Math.abs(Math.trunc(n));
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${n}th`;
  }
  switch (abs % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
