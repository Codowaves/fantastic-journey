import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/**
 * Request context that tracks a unique request ID through the application.
 * The context is propagated implicitly across async boundaries via
 * `AsyncLocalStorage`, so downstream code can read the current request ID
 * without threading it through every function signature.
 */
export interface RequestContext {
  reqId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Creates a new request context with the given or auto-generated request ID.
 *
 * @param reqId - Optional request ID. If omitted (or `undefined`), a new
 *   v4 UUID is generated. If an empty string is provided, it is kept as-is
 *   (the caller is asserting that empty is a valid ID for that flow).
 * @returns A new {@link RequestContext} instance.
 *
 * @example
 * // Auto-generate a request ID (typical server entry point).
 * const ctx = createRequestContext();
 * console.log(ctx.reqId); // → "9f1c6a3e-…"
 *
 * @example
 * // Reuse an ID supplied by an upstream caller (e.g. a load balancer
 * // or a client correlation header).
 * const ctx = createRequestContext(req.headers["x-request-id"]);
 */
export function createRequestContext(reqId?: string): RequestContext {
  return { reqId: reqId ?? randomUUID() };
}

/**
 * Runs a callback within a request context scope using `AsyncLocalStorage`.
 * The context is available to `callback` and to any async work it awaits,
 * and is automatically torn down when the callback resolves or throws.
 *
 * @param callback - The function to execute within the request context.
 * @param context - The request context to use; defaults to a freshly created
 *   one (auto-generated `reqId`).
 * @returns Whatever `callback` returns, passed through unchanged.
 *
 * @example
 * // Wrap a request handler so downstream code can call getReqId().
 * export async function handle(req: Request) {
 *   return runWithRequestContext(async () => {
 *     const user = await authenticate(req);
 *     return listOrders(user);
 *   });
 * }
 *
 * @example
 * // Nesting: the inner context shadows the outer one for the duration
 * // of its callback, then the outer context is restored.
 * await runWithRequestContext(() => "outer");
 * await runWithRequestContext(async () => {
 *   console.log(getReqId()); // inner
 *   await runWithRequestContext(async () => {
 *     console.log(getReqId()); // innermost
 *   });
 *   console.log(getReqId()); // inner again
 * });
 */
export function runWithRequestContext<T>(
  callback: () => T,
  context: RequestContext = createRequestContext(),
): T {
  return requestContext.run(context, callback);
}

/**
 * Retrieves the current request context from `AsyncLocalStorage`.
 *
 * @returns The active {@link RequestContext}, or `undefined` when called
 *   outside any `runWithRequestContext` scope (e.g. from top-level
 *   startup code, a stray `setTimeout`, or a non-async callback).
 *
 * @example
 * // Inside an active scope: returns the context.
 * runWithRequestContext(() => {
 *   const ctx = getRequestContext();
 *   if (!ctx) throw new Error("unreachable");
 * });
 *
 * @example
 * // At the top level (no scope): returns undefined — do not assume
 * // a context exists.
 * getRequestContext(); // → undefined
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/**
 * Retrieves the request ID from the current request context.
 *
 * @returns The current `reqId`, or `undefined` when no context is active
 *   (see {@link getRequestContext}). Useful for log correlation and for
 *   attaching a request ID to outgoing calls.
 *
 * @example
 * // Typical use in a logger.
 * const reqId = getReqId() ?? "no-req-id";
 * log.info({ reqId }, "processing order");
 *
 * @example
 * // Propagating the ID to a downstream service.
 * const headers = { "x-request-id": getReqId() ?? randomUUID() };
 */
export function getReqId(): string | undefined {
  return getRequestContext()?.reqId;
}
