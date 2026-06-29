/** Formats a `Date` as `YYYY-MM-DD` in UTC. Returns an empty string for invalid dates. */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
