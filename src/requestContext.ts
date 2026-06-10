import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/** Ambient per-request state propagated through async call chains via AsyncLocalStorage. */
export interface RequestContext {
  /** Unique identifier for the current request, used for correlation in logs and errors. */
  reqId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Builds a new [[RequestContext]], generating a UUID for `reqId` when none is supplied.
 *
 * @param reqId - Optional caller-supplied request id; pass one to preserve an id that originated upstream (e.g. an HTTP header).
 * @returns A [[RequestContext]] carrying either the supplied or freshly generated `reqId`.
 */
export function createRequestContext(reqId?: string): RequestContext {
  return { reqId: reqId ?? randomUUID() };
}

/**
 * Runs `callback` inside an async-local scope where [[getRequestContext]] and [[getReqId]] resolve to `context`.
 *
 * @param callback - The function to execute within the context scope.
 * @param context - The context to install; defaults to a fresh one from [[createRequestContext]].
 * @returns The value returned by `callback`.
 */
export function runWithRequestContext<T>(
  callback: () => T,
  context: RequestContext = createRequestContext(),
): T {
  return requestContext.run(context, callback);
}

/**
 * Returns the [[RequestContext]] active on the current async call chain, or `undefined` if none is installed.
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function getReqId(): string | undefined {
  return getRequestContext()?.reqId;
}
