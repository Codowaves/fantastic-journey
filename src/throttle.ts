export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  if (!Number.isFinite(waitMs) || waitMs < 0) {
    throw new RangeError("waitMs must be a non-negative finite number");
  }

  let lastCallTime: number | undefined;
  let pendingArgs: A | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (...args: A) {
    const now = Date.now();

    // First call or window has passed - invoke immediately (leading edge)
    if (lastCallTime === undefined || now - lastCallTime >= waitMs) {
      lastCallTime = now;
      fn(...args);
      pendingArgs = undefined;

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    } else {
      // Inside throttle window - save args for potential trailing call
      pendingArgs = args;

      // Schedule trailing call if not already scheduled
      if (timeoutId === undefined) {
        timeoutId = setTimeout(
          () => {
            if (pendingArgs !== undefined) {
              fn(...pendingArgs);
              pendingArgs = undefined;
            }
            lastCallTime = undefined;
            timeoutId = undefined;
          },
          waitMs - (now - lastCallTime),
        );
      }
    }
  };
}
