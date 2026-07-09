/**
 * Returns a promise that resolves after `ms` milliseconds.
 *
 * @param ms - The number of milliseconds to wait before resolving.
 * @returns A promise that resolves with `undefined` once the timer fires.
 *
 * @example
 * ```ts
 * await sleep(1000);
 * console.log('1 second later');
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
