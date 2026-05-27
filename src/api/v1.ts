// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

export type Project = Record<string, unknown>;

export interface DatabaseClient {
  query(sql: string): Promise<Project[] | { rows?: Project[] | null } | null | undefined>;
}

export interface ProjectRepository {
  listProjects(): Promise<Project[] | null | undefined>;
}

export interface ApiV1Dependencies {
  database?: DatabaseClient;
  projectRepository?: ProjectRepository;
  projects?: Project[] | null;
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

function normalizeProjects(projects: Project[] | null | undefined): Project[] {
  return projects ?? [];
}

function normalizeQueryResult(
  result: Project[] | { rows?: Project[] | null } | null | undefined,
): Project[] {
  if (Array.isArray(result)) {
    return result;
  }

  return normalizeProjects(result?.rows);
}

async function loadProjects(dependencies: ApiV1Dependencies): Promise<Project[]> {
  if (dependencies.projectRepository) {
    return normalizeProjects(await dependencies.projectRepository.listProjects());
  }

  if (dependencies.database) {
    return normalizeQueryResult(await dependencies.database.query("select * from projects order by id"));
  }

  return normalizeProjects(dependencies.projects);
}

export async function handleRequest(
  request: Request,
  dependencies: ApiV1Dependencies = {},
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/healthz") {
    return Response.json({ ok: true }, { status: 200 });
  }

  if (request.method === "GET" && url.pathname === "/api/projects") {
    return Response.json({ items: await loadProjects(dependencies) }, { status: 200 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

export function createApiV1Handler(dependencies: ApiV1Dependencies = {}) {
  return (request: Request): Promise<Response> => handleRequest(request, dependencies);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
