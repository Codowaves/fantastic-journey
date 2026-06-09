import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { retry } from "./retry";

describe("retry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the resolved value on the first successful attempt", async () => {
    const fn = vi.fn(async () => "ok");
    const result = await retry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries until the function succeeds and returns the result", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      if (calls < 3) throw new Error("fail");
      return "eventual";
    };

    const promise = retry(fn, { retries: 5, delayMs: 10, factor: 2 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("eventual");
    expect(calls).toBe(3);
  });

  it("retries up to `retries` times and rethrows the last error", async () => {
    let calls = 0;
    const sentinel = new Error("nope");
    const fn = async () => {
      calls++;
      throw sentinel;
    };

    const promise = retry(fn, { retries: 4, delayMs: 1, factor: 1 }).catch(
      (err) => err,
    );
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(calls).toBe(4);
    expect(result).toBe(sentinel);
  });

  it("applies exponential backoff with `factor`", async () => {
    const delays: number[] = [];
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    let calls = 0;
    const fn = async () => {
      calls++;
      if (calls < 3) throw new Error("fail");
      return "ok";
    };

    const promise = retry(fn, { retries: 5, delayMs: 25, factor: 3 });
    await vi.runAllTimersAsync();
    await promise;

    for (const call of setTimeoutSpy.mock.calls) {
      const delay = call[1] as number;
      if (delay === 25 || delay === 75 || delay === 225) {
        delays.push(delay);
      }
    }

    expect(delays).toEqual([25, 75]);
    setTimeoutSpy.mockRestore();
  });

  it("uses default options (retries: 3, delayMs: 50, factor: 2)", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      throw new Error("always fails");
    };

    const promise = retry(fn).catch((err) => err);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(calls).toBe(3);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe("always fails");
  });

  it("does not retry beyond `retries: 1` and throws the original error", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      throw new Error("once");
    };

    const promise = retry(fn, { retries: 1 }).catch((err) => err);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(calls).toBe(1);
    expect((result as Error).message).toBe("once");
  });
});
