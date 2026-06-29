// Seed: shipped without tests.
export class RingBuffer<T> {
  private buf: T[] = [];
  constructor(private cap: number) {}
  add(x: T): void { this.buf.push(x); if (this.buf.length > this.cap) this.buf.shift(); }
  toArray(): T[] { return [...this.buf]; }
  get length(): number { return this.buf.length; }
}
