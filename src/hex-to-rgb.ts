/**
 * Converts a `#rrggbb` hex color string to an `{ r, g, b }` object.
 *
 * Throws when `hex` is `null`, `undefined`, or not a string, or when any
 * parsed channel is `NaN` (e.g. due to a malformed hex string).
 *
 * @param hex - A 7-character hex color string beginning with `#`.
 * @returns An object containing the `r`, `g`, and `b` channels (0–255).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (hex === null || hex === undefined) {
    throw new TypeError(
      `hexToRgb: hex must be a string, got ${hex === null ? "null" : "undefined"}`,
    );
  }
  if (typeof hex !== "string") {
    throw new TypeError(`hexToRgb: hex must be a string, got ${typeof hex}`);
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    throw new TypeError(
      `hexToRgb: hex must be a valid #rrggbb string, got ${JSON.stringify(hex)}`,
    );
  }

  return { r, g, b };
}
