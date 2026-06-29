/**
 * Converts an RGB color triple to a `#rrggbb` hex string.
 *
 * Each component is clamped to the `[0, 255]` range and rendered as a
 * two-digit lowercase hex value (zero-padded).
 *
 * @param r - The red component (0-255).
 * @param g - The green component (0-255).
 * @param b - The blue component (0-255).
 * @returns A `#rrggbb` hex color string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
