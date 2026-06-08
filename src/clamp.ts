export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError("clamp: min must not be greater than max");
  }
  return Math.min(Math.max(value, min), max);
}
