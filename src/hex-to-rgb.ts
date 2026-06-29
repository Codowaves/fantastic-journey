/**
 * Converts a `#rrggbb` hex color string to an `{ r, g, b }` object.
 *
 * @param hex - A 7-character hex color string beginning with `#`.
 * @returns An object containing the `r`, `g`, and `b` channels (0–255).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}
