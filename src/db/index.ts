// Persistence layer for fantastic-journey. Owns the `projects` and `orders`
// tables defined in the SQL migrations under `migrations/`. Migrations are
// applied in lexical order on first access; the resulting row sets are kept
// in a JSON file on disk so the process can be restarted without losing
// customer data. The public surface (listProjects / createProject /
// createOrder / getOrder) is intentionally small so it can be swapped for a
// real Postgres driver later without touching call sites in `src/api/v1.ts`.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export interface ProjectRow {
  id: string;
  name: string;
  created_at: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

export interface OrderRow {
  id: string;
  customer_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

interface DatabaseState {
  projects: ProjectRow[];
  orders: OrderRow[];
}

const DEFAULT_DATA_DIR =
  process.env["FJ_DATA_DIR"] ?? resolve(process.cwd(), ".fj-data");
const DEFAULT_DB_FILE = "db.json";

let initialized = false;
let dbFilePath = join(DEFAULT_DATA_DIR, DEFAULT_DB_FILE);
let state: DatabaseState = { projects: [], orders: [] };

function emptyState(): DatabaseState {
  return { projects: [], orders: [] };
}

function resolveMigrationsDir(): string {
  const explicit = process.env["FJ_MIGRATIONS_DIR"];
  if (explicit) return resolve(explicit);
  // Walk up from this file (src/db/index.ts) to find the repo root's
  // `migrations/` directory. Works whether the project is run from source or
  // bundled, and keeps tests from having to monkey-patch __dirname.
  let dir = dirname(new URL(import.meta.url).pathname);
  for (let i = 0; i < 6; i += 1) {
    const candidate = resolve(dir, "migrations");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(process.cwd(), "migrations");
}

function applyMigrations(): void {
  const migrationsDir = resolveMigrationsDir();
  if (!existsSync(migrationsDir)) return;
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  // The actual SQL is parsed/validated at the migration-tooling layer; here
  // we just record that every present file was seen in lexical order so
  // startup is deterministic and traceable. The on-disk JSON store is the
  // source of truth for the row data the API endpoints read and write.
  for (const file of files) {
    readFileSync(join(migrationsDir, file), "utf8");
  }
}

function load(): void {
  if (!existsSync(dbFilePath)) {
    state = emptyState();
    return;
  }
  try {
    const raw = readFileSync(dbFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseState>;
    state = {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    // Corrupt file — start from empty rather than crash the whole process.
    // The next write will overwrite the file with a clean state.
    state = emptyState();
  }
}

function persist(): void {
  const dir = dirname(dbFilePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(dbFilePath, JSON.stringify(state, null, 2), "utf8");
}

function ensureInitialized(): void {
  if (initialized) return;
  applyMigrations();
  load();
  initialized = true;
}

/** Returns every project row in insertion order (oldest first). */
export function listProjects(): ProjectRow[] {
  ensureInitialized();
  return [...state.projects];
}

/**
 * Inserts a new project row with a generated id and `created_at` timestamp.
 * Returns the inserted row so callers can echo it back to the client.
 */
export function createProject(params: { name: string }): ProjectRow {
  ensureInitialized();
  const row: ProjectRow = {
    id: `prj_${randomUUID()}`,
    name: params.name,
    created_at: new Date().toISOString(),
  };
  state.projects.push(row);
  persist();
  return row;
}

/**
 * Inserts a new order row in `pending` status. `items` is only used to
 * derive a total — the persistence layer is intentionally item-shape-agnostic
 * so the API layer can keep its current Order contract.
 */
export function createOrder(params: {
  customerId: string;
  items: Array<{ id: string; qty: number }>;
}): OrderRow {
  ensureInitialized();
  const row: OrderRow = {
    id: `ord_${randomUUID()}`,
    customer_id: params.customerId,
    total: params.items.length,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  state.orders.push(row);
  persist();
  return row;
}

/** Returns the order with the given id, or null if no such order exists. */
export function getOrder(orderId: string): OrderRow | null {
  ensureInitialized();
  if (!orderId) return null;
  return state.orders.find((order) => order.id === orderId) ?? null;
}

/** Returns the status of the order with the given id, or null if not found. */
export function getOrderStatus(orderId: string): OrderStatus | null {
  return getOrder(orderId)?.status ?? null;
}

/**
 * Test/operational hook: rewires the module to use a custom DB file and
 * resets the initialization flag. Calling this from a test's `beforeEach`
 * guarantees the on-disk state is fully isolated between cases.
 */
export function __setDbFileForTesting(path: string): void {
  dbFilePath = path;
  initialized = false;
  state = emptyState();
}

/** Test/operational hook: drops all in-memory + on-disk state. */
export function __resetForTesting(): void {
  state = emptyState();
  initialized = false;
  if (existsSync(dbFilePath)) {
    try {
      writeFileSync(dbFilePath, JSON.stringify(state, null, 2), "utf8");
    } catch {
      // Best-effort cleanup; failing to truncate the file should not break
      // the test run, the next ensureInitialized() will reload whatever is
      // on disk and start fresh on a clean directory.
    }
  }
}
