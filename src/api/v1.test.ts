import { describe, expect, it } from "vitest";

import { createApiV1Handler, handleRequest } from "./v1";

describe("api v1 route handler", () => {
  it("returns healthy JSON for GET /healthz", async () => {
    const response = await handleRequest(new Request("https://example.com/healthz"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns an empty project list for GET /api/projects with no projects", async () => {
    const response = await handleRequest(new Request("https://example.com/api/projects"), {
      database: {
        query: () => Promise.resolve({ rows: null }),
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [] });
  });

  it("wraps database projects in an items array for GET /api/projects", async () => {
    const projects = [
      { id: "project-1", name: "Migration" },
      { id: "project-2", name: "Reporting" },
    ];

    const response = await handleRequest(new Request("https://example.com/api/projects"), {
      database: {
        query: () => Promise.resolve({ rows: projects }),
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: projects });
  });

  it("preserves static project fallback shape for GET /api/projects", async () => {
    const projects = [{ id: "project-1", name: "Migration" }];

    const response = await handleRequest(new Request("https://example.com/api/projects"), { projects });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: projects });
  });

  it("wires project loading through the reusable API handler", async () => {
    const handle = createApiV1Handler({
      database: {
        query: () => Promise.resolve({ rows: [] }),
      },
    });

    const response = await handle(new Request("https://example.com/api/projects"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [] });
  });

  it("returns not found JSON for unsupported routes", async () => {
    const response = await handleRequest(new Request("https://example.com/api/unknown"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
  });
});
