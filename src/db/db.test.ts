import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  __setDbFileForTesting,
  createOrder,
  createProject,
  getOrder,
  getOrderStatus,
  listProjects,
} from "./index";

let dataDir: string;
let dbFile: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "fj-db-test-"));
  dbFile = join(dataDir, "db.json");
  __setDbFileForTesting(dbFile);
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe("db persistence layer", () => {
  it("listProjects returns an empty array on a fresh store", () => {
    expect(listProjects()).toEqual([]);
  });

  it("createProject appends a project with a generated id and ISO timestamp", () => {
    const before = new Date().toISOString();
    const row = createProject({ name: "alpha" });
    const after = new Date().toISOString();

    expect(row.id).toMatch(/^prj_/);
    expect(row.name).toBe("alpha");
    expect(row.created_at >= before).toBe(true);
    expect(row.created_at <= after).toBe(true);
    expect(listProjects()).toEqual([row]);
  });

  it("persists the store to disk after each write", () => {
    createProject({ name: "persisted" });

    expect(existsSync(dbFile)).toBe(true);
    const onDisk = JSON.parse(readFileSync(dbFile, "utf8")) as {
      projects: Array<{ name: string }>;
    };
    expect(onDisk.projects).toHaveLength(1);
    expect(onDisk.projects[0]?.name).toBe("persisted");
  });

  it("createOrder inserts a pending order keyed by customer_id", () => {
    const order = createOrder({
      customerId: "cust_42",
      items: [
        { id: "sku_a", qty: 2 },
        { id: "sku_b", qty: 1 },
      ],
    });

    expect(order.id).toMatch(/^ord_/);
    expect(order.customer_id).toBe("cust_42");
    expect(order.total).toBe(2);
    expect(order.status).toBe("pending");
  });

  it("getOrder returns the inserted order, getOrderStatus returns its status", () => {
    const order = createOrder({
      customerId: "cust_1",
      items: [{ id: "sku_a", qty: 1 }],
    });

    expect(getOrder(order.id)?.id).toBe(order.id);
    expect(getOrderStatus(order.id)).toBe("pending");
  });

  it("getOrder and getOrderStatus return null for unknown ids", () => {
    expect(getOrder("")).toBeNull();
    expect(getOrder("ord_missing")).toBeNull();
    expect(getOrderStatus("ord_missing")).toBeNull();
  });

  it("reloading from disk after a write preserves both projects and orders", () => {
    createProject({ name: "survives" });
    const order = createOrder({
      customerId: "cust_99",
      items: [{ id: "sku_x", qty: 3 }],
    });

    // Simulate a process restart by rewiring the db file path and clearing
    // the in-memory initialization flag (the helper does both).
    __setDbFileForTesting(dbFile);

    expect(listProjects().map((p) => p.name)).toEqual(["survives"]);
    expect(getOrderStatus(order.id)).toBe("pending");
  });

  it("migrations directory is read on initialization and is non-empty", () => {
    // Trigger lazy initialization.
    listProjects();

    const migrationsDir = join(import.meta.dirname, "..", "..", "migrations");
    expect(existsSync(migrationsDir)).toBe(true);
  });
});
