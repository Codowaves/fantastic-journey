import { describe, expect, it } from "vitest";

import { handleRequest } from "./v1";

describe("api v1 route handler", () => {
  it("returns healthy JSON for GET /healthz", async () => {
    const response = handleRequest(new Request("https://example.com/healthz"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      uptimeSeconds: expect.any(Number),
    });
  });

  it("returns healthy JSON for GET /health alias", async () => {
    const response = handleRequest(new Request("https://example.com/health"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      uptimeSeconds: expect.any(Number),
    });
  });
});
