/**
 * A least-recently-used (LRU) cache of fixed capacity.
 *
 * When the cache is at capacity and a new key is inserted, the
 * least-recently-used entry is evicted. Reads via `get` and writes via
 * `set` both count as uses and refresh the entry's recency.
 *
 * `get`, `set`, `has`, and `clear` are all O(1).
 */
export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly entries: Map<K, V>;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 0) {
      throw new RangeError("capacity must be a non-negative integer");
    }
    this.capacity = capacity;
    this.entries = new Map();
  }

  get size(): number {
    return this.entries.size;
  }

  get(key: K): V | undefined {
    if (!this.entries.has(key)) {
      return undefined;
    }
    const value = this.entries.get(key) as V;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.entries.has(key)) {
      this.entries.delete(key);
    } else if (this.entries.size >= this.capacity) {
      const oldest = this.entries.keys().next().value as K;
      this.entries.delete(oldest);
    }
    if (this.capacity > 0) {
      this.entries.set(key, value);
    }
  }

  has(key: K): boolean {
    return this.entries.has(key);
  }

  clear(): void {
    this.entries.clear();
  }
}
