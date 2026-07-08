/**
 * Fixed-capacity FIFO buffer that drops the oldest item once `cap` is exceeded.
 *
 * Items are kept in insertion order; once the buffer is full, each new `add`
 * evicts the oldest entry. Useful for retaining "the last N events" (recent
 * log lines, sliding window of measurements, etc.) without unbounded growth.
 *
 * @typeParam T - Element type stored in the buffer.
 *
 * @example
 * const rb = new RingBuffer<number>(3);
 * rb.add(1);
 * rb.add(2);
 * rb.add(3);
 * rb.add(4); // evicts 1
 * rb.toArray(); // [2, 3, 4]
 */
export class RingBuffer<T> {
  private buf: T[] = [];

  /**
   * @param cap - Maximum number of items to retain. Must be a non-negative
   *   integer. A capacity of 0 means every `add` is immediately discarded
   *   (no items are ever retained).
   */
  constructor(private cap: number) {}

  /**
   * Append an item to the buffer. If the buffer is already at capacity,
   * the oldest item is removed before the new one is stored.
   *
   * Edge cases:
   * - Falsy values (`0`, `""`, `false`, `null`, `NaN`) are stored just like
   *   any other value; nothing is filtered or coerced.
   * - Adding to a full buffer is O(n) because of the underlying shift.
   *
   * @param x - The item to append.
   */
  add(x: T): void {
    this.buf.push(x);
    if (this.buf.length > this.cap) this.buf.shift();
  }

  /**
   * Return a shallow copy of the buffer's contents in insertion order
   * (oldest first, most recent last).
   *
   * Mutating the returned array does NOT affect the buffer; each call
   * allocates a fresh array.
   *
   * Edge cases:
   * - Returns `[]` (not `undefined`) when the buffer is empty.
   *
   * @returns A new array containing the retained items.
   */
  toArray(): T[] {
    return [...this.buf];
  }

  /**
   * Current number of items in the buffer. Never exceeds `cap` and never
   * decreases (items are only removed by being evicted on subsequent `add`s).
   */
  get length(): number {
    return this.buf.length;
  }
}
