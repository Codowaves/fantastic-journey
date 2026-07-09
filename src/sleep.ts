/**
 * Returns a promise that resolves after `ms` milliseconds.
 *
 * @param ms - The number of milliseconds to wait before resolving.
 * @returns A promise that resolves with `undefined` once the timer fires.
 *
 * @example
 * await sleep(1000);
 * // resolves after approximately 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
