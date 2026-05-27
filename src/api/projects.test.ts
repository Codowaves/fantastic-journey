import { describe, expect, it } from "vitest";

import { handleRequest } from "./v1";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("projects controller", () => {
  it("returns 200 with empty items array when no projects exist", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/projects"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Request-Id")).toMatch(UUID_PATTERN);
    await expect(response.json()).resolves.toEqual({ items: [] });
  });
});
