/**
 * Fixed-capacity FIFO buffer that drops the oldest item once `cap` is exceeded.
 *
 * @throws {TypeError} If `cap` is null, undefined, or NaN.
 * @throws {RangeError} If `cap` is not a non-negative integer.
 */
export class RingBuffer<T> {
  private buf: T[] = [];
  constructor(private cap: number) {
    if (cap === null || cap === undefined || Number.isNaN(cap)) {
      throw new TypeError("cap must be a number");
    }
    if (!Number.isInteger(cap) || cap < 0) {
      throw new RangeError("cap must be a non-negative integer");
    }
  }
  add(x: T): void {
    this.buf.push(x);
    if (this.buf.length > this.cap) this.buf.shift();
  }
  toArray(): T[] {
    return [...this.buf];
  }
  get length(): number {
    return this.buf.length;
  }
}
