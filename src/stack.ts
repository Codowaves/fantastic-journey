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
 * const stack = new Stack<number>();
 * stack.push(1);
 * stack.push(2);
 * stack.pop();
 * // 2
 * stack.peek();
 * // 1
 */
export class Stack<T> {
  private items: T[] = [];

  /**
   * Append `x` to the top of the stack.
   *
   * @example
   * const stack = new Stack<string>();
   * stack.push("a");
   * stack.push("b");
   * stack.peek();
   * // "b"
   */
  push(x: T): void {
    this.items.push(x);
  }

  /**
   * Remove and return the top element, or `undefined` if the stack is empty.
   *
   * @example
   * const stack = new Stack<number>();
   * stack.push(1);
   * stack.push(2);
   * stack.pop();
   * // 2
   * stack.pop();
   * // 1
   * stack.pop();
   * // undefined
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Return the top element without removing it, or `undefined` if empty.
   *
   * @example
   * const stack = new Stack<number>();
   * stack.peek();
   * // undefined
   * stack.push(42);
   * stack.peek();
   * // 42
   * stack.size;
   * // 1
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /** Number of elements currently in the stack. */
  get size(): number {
    return this.items.length;
  }

  /**
   * True when the stack contains no elements.
   *
   * @example
   * const stack = new Stack<number>();
   * stack.isEmpty();
   * // true
   * stack.push(1);
   * stack.isEmpty();
   * // false
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
