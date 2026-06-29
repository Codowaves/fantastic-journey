import { describe, expect, it } from "vitest";

import { sleep } from "./sleep";

describe("sleep", () => {
  it("resolves after roughly the requested delay", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });

  it("resolves with undefined", async () => {
    await expect(sleep(0)).resolves.toBeUndefined();
  });
});
