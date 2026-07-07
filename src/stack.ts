// Seed: shipped without tests.

/**
 * A last-in, first-out (LIFO) stack of values backed by a plain array.
 *
 * Standard stack operations are exposed (`push`/`pop`/`peek`) along with
 * `size` and `isEmpty` accessors. Items are not de-duplicated or capped.
 */
export class Stack<T> {
  private items: T[] = [];

  /** Append `x` to the top of the stack. */
  push(x: T): void {
    this.items.push(x);
  }

  /** Remove and return the top element, or `undefined` if the stack is empty. */
  pop(): T | undefined {
    return this.items.pop();
  }

  /** Return the top element without removing it, or `undefined` if empty. */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /** Number of elements currently in the stack. */
  get size(): number {
    return this.items.length;
  }

  /** True when the stack contains no elements. */
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
