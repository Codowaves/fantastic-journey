/**
 * Computes the area of a circle given its radius.
 *
 * @param radius - The radius of the circle. Must be a finite, non-negative number.
 * @returns The area of the circle.
 */
export function circleArea(radius: number): number {
  if (radius === null || radius === undefined) {
    throw new TypeError("radius must not be null or undefined");
  }
  if (Number.isNaN(radius)) {
    throw new TypeError("radius must not be NaN");
  }
  if (radius < 0) {
    throw new RangeError("radius must be non-negative");
  }
  return Math.PI * radius * radius;
}

/**
 * Computes the area of a rectangle given its width and height.
 *
 * @param width - The width of the rectangle. Must be a finite, non-negative number.
 * @param height - The height of the rectangle. Must be a finite, non-negative number.
 * @returns The area of the rectangle.
 */
export function rectArea(width: number, height: number): number {
  if (width === null || width === undefined) {
    throw new TypeError("width must not be null or undefined");
  }
  if (height === null || height === undefined) {
    throw new TypeError("height must not be null or undefined");
  }
  if (Number.isNaN(width)) {
    throw new TypeError("width must not be NaN");
  }
  if (Number.isNaN(height)) {
    throw new TypeError("height must not be NaN");
  }
  if (width < 0 || height < 0) {
    throw new RangeError("width and height must be non-negative");
  }
  return width * height;
}
