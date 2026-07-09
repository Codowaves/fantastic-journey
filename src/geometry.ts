/**
 * Computes the area of a circle given its radius.
 *
 * @param radius - The radius of the circle. Must be non-negative.
 * @returns The area of the circle.
 */
export function circleArea(radius: number): number {
  if (radius === null || radius === undefined || Number.isNaN(radius)) {
    throw new TypeError("radius must be a number");
  }
  if (radius < 0) {
    throw new RangeError("radius must be non-negative");
  }
  return Math.PI * radius * radius;
}

/**
 * Computes the area of a rectangle given its width and height.
 *
 * @param width - The width of the rectangle. Must be non-negative.
 * @param height - The height of the rectangle. Must be non-negative.
 * @returns The area of the rectangle.
 */
export function rectArea(width: number, height: number): number {
  if (width === null || width === undefined || Number.isNaN(width)) {
    throw new TypeError("width must be a number");
  }
  if (height === null || height === undefined || Number.isNaN(height)) {
    throw new TypeError("height must be a number");
  }
  if (width < 0 || height < 0) {
    throw new RangeError("width and height must be non-negative");
  }
  return width * height;
}
