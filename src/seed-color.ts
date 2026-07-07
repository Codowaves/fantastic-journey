/**
 * Lightens a hex color by adding a given amount to each RGB channel.
 *
 * @param hex - A hex color string in the form `#RRGGBB` (without alpha).
 * @param amt - Non-negative integer amount to add to each channel; values are clamped to 255.
 * @returns A `#RRGGBB` hex string representing the lightened color.
 */
export function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt),
    g = Math.min(255, ((n >> 8) & 255) + amt),
    b = Math.min(255, (n & 255) + amt);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}
