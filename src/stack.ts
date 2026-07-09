// Seed: shipped without tests.

/**
 * A last-in, first-out (LIFO) stack of values backed by a plain array.
 *
 * Standard stack operations are exposed (`push`/`pop`/`peek`) along with
 * `size` and `isEmpty` accessors. Items are not de-duplicated or capped.
 *
 * @typeParam T - The element type stored in the stack.
 *
 * @example
 * const s = new Stack<number>();
 * s.push(1);
 * s.push(2);
 * s.peek();   // 2
 * s.pop();    // 2
 * s.size;     // 1
 * s.isEmpty();// false
 */
export class Stack<T> {
  private items: T[] = [];

  /**
   * Append `x` to the top of the stack.
   *
   * @example
   * const s = new Stack<string>();
   * s.push("a");
   * s.push("b");
   * s.size; // 2
   */
  push(x: T): void {
    this.items.push(x);
  }

  /**
   * Remove and return the top element, or `undefined` if the stack is empty.
   *
   * @example
   * const s = new Stack<number>();
   * s.push(1);
   * s.push(2);
   * s.pop(); // 2
   * s.pop(); // 1
   * s.pop(); // undefined
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Return the top element without removing it, or `undefined` if empty.
   *
   * @example
   * const s = new Stack<number>();
   * s.push(7);
   * s.peek(); // 7
   * s.size;   // 1 (peek does not remove)
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Number of elements currently in the stack.
   *
   * @example
   * const s = new Stack<number>();
   * s.size;     // 0
   * s.push(1);
   * s.push(2);
   * s.size;     // 2
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * True when the stack contains no elements.
   *
   * @example
   * const s = new Stack<number>();
   * s.isEmpty(); // true
   * s.push(1);
   * s.isEmpty(); // false
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
