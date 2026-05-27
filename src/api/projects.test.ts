import { describe, expect, it } from "vitest";

import { handleRequest } from "./v1";

describe("projects controller", () => {
  it("returns 200 with empty items array when no projects exist", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/projects"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [] });
  });
});
