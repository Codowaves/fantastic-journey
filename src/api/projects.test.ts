import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { __setDbFileForTesting } from "../db";
import { handleRequest } from "./v1";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "fj-projects-test-"));
  __setDbFileForTesting(join(dataDir, "db.json"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe("projects controller", () => {
  it("returns 200 with empty items array when no projects exist", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/projects"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Request-Id")).toMatch(UUID_PATTERN);
    await expect(response.json()).resolves.toEqual({ items: [] });
  });

  it("persists a project created via POST and returns it on subsequent GETs", async () => {
    const createResponse = await handleRequest(
      new Request("https://example.com/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Acme Migration" }),
      }),
    );

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as {
      id: string;
      name: string;
      created_at: string;
    };
    expect(created.id).toMatch(/^prj_/);
    expect(created.name).toBe("Acme Migration");
    expect(created.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

    const listResponse = await handleRequest(
      new Request("https://example.com/api/projects"),
    );
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toEqual({
      items: [created],
    });
  });

  it("rejects POST without a name with a 400 error", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "name is required",
    });
  });

  it("preserves projects across module re-initialization (process restart)", async () => {
    await handleRequest(
      new Request("https://example.com/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Durable" }),
      }),
    );

    // Simulate a process restart: the db module re-loads from disk.
    __setDbFileForTesting(join(dataDir, "db.json"));

    const response = await handleRequest(
      new Request("https://example.com/api/projects"),
    );
    const body = (await response.json()) as {
      items: Array<{ name: string }>;
    };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.name).toBe("Durable");
  });
});
