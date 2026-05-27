import { describe, expect, it } from "vitest";

import { handleRequest } from "./v1";

describe("api v1 route handler", () => {
  it("returns healthy JSON for GET /healthz and its /health alias", async () => {
    for (const path of ["/healthz", "/health"]) {
      const response = handleRequest(new Request(`https://example.com${path}`));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        status: "ok",
        uptimeSeconds: expect.any(Number),
      });
    }
  });
});
