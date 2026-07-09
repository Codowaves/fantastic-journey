/**
 * Formats a byte count as a human-readable string using IEC binary units (B, KiB, MiB, GiB, TiB).
 * @param bytes - Non-negative finite number of bytes.
 * @param decimals - Number of decimal places to keep in the scaled value (default 1).
 * @returns The formatted size string (e.g. `"1.5 KiB"`); returns `"0 B"` when `bytes` is zero.
 * @example
 * formatBytes(0);             // "0 B"
 * formatBytes(1024);          // "1 KiB"
 * formatBytes(1536, 2);       // "1.5 KiB"
 * formatBytes(1073741824);    // "1 GiB"
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
