const DAY_MS = 86_400_000;

/** True when `date` falls in the inclusive range [from, to]. ISO dates only. */
export function isWithinPeriod(date: string, from: string, to: string): boolean {
  // ISO `YYYY-MM-DD` strings sort lexicographically, so string comparison is
  // a correct (and cheap) inclusive range check.
  return date >= from && date <= to;
}

/** Whole calendar days from `a` to `b` (negative if `b` precedes `a`). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
}

/** The `YYYY-MM` month key for an ISO date. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}
