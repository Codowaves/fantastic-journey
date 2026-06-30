/**
 * Formats a number of seconds as `H:MM:SS`.
 *
 * @param s - The number of seconds to format.
 * @returns A string in `H:MM:SS` form.
 */
export function secondsToHMS(s: number): string {
  if (!Number.isFinite(s)) {
    throw new RangeError("seconds must be a finite number");
  }
  if (s < 0) {
    throw new RangeError("seconds must be non-negative");
  }

  const totalSeconds = Math.floor(s);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
