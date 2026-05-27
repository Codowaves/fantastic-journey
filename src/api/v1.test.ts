import { describe, expect, it } from "vitest";

import { authService } from "../auth";
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

  it("serves owner-only sessions UI and revokes sessions", async () => {
    authService.seedSession({
      id: "sess_route_test",
      workspaceId: "workspace_route_test",
      userId: "user@example.com",
      email: "user@example.com",
      ip: "203.0.113.10",
      userAgent: "Vitest",
      startedAt: new Date("2026-05-27T12:00:00.000Z"),
      lastSeenAt: new Date("2026-05-27T12:05:00.000Z"),
      revokedAt: null,
    });

    const memberResponse = handleRequest(
      new Request("https://example.com/settings/security/sessions", {
        headers: { "x-workspace-id": "workspace_route_test" },
      }),
    );
    expect(memberResponse.status).toBe(403);

    const ownerResponse = handleRequest(
      new Request("https://example.com/settings/security/sessions", {
        headers: {
          "x-workspace-id": "workspace_route_test",
          "x-workspace-role": "owner",
        },
      }),
    );
    expect(ownerResponse.status).toBe(200);
    await expect(ownerResponse.text()).resolves.toContain("sess_route_test");

    const revokeResponse = handleRequest(
      new Request(
        "https://example.com/settings/security/sessions/sess_route_test",
        {
          method: "DELETE",
          headers: {
            "x-workspace-id": "workspace_route_test",
            "x-workspace-role": "owner",
            "x-user-id": "owner@example.com",
          },
        },
      ),
    );
    expect(revokeResponse.status).toBe(200);
    expect(authService.listActiveSessions("workspace_route_test", "owner")).toEqual(
      [],
    );
  });
});
