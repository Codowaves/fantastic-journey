/**
 * Formats a byte count into a human-readable string with appropriate units (B, KiB, MiB, GiB, TiB).
 * @param bytes - The number of bytes to format (must be a non-negative finite number)
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns A formatted string like "42.5 KiB" or "1.2 GiB"
 * @throws {RangeError} If bytes is not finite or is negative
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
