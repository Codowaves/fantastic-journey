/**
 * Formats a byte count as a human-readable string with IEC binary units (B, KiB, MiB, GiB, TiB).
 *
 * @param bytes - The non-negative, finite byte count to format.
 * @param decimals - Number of decimal places; trailing zeros are trimmed from the result.
 * @returns A string like `"1.5 MiB"` or `"0 B"`.
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!Number.isFinite(bytes)) {
    throw new RangeError("bytes must be a finite number");
  }
  if (bytes < 0) {
    throw new RangeError("bytes must be non-negative");
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, units.length - 1);

  const value = bytes / Math.pow(k, unitIndex);
  const formatted = value.toFixed(decimals);

  // Trim trailing zeros and decimal point if needed
  const trimmed = formatted.replace(/\.?0+$/, "");

  return `${trimmed} ${units[unitIndex]}`;
}
