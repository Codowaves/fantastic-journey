import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/** Per-request context propagated through `AsyncLocalStorage` for the lifetime of a request. */
export interface RequestContext {
  reqId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

/** Builds a {@link RequestContext}, generating a UUID for `reqId` when one is not supplied. */
export function createRequestContext(reqId?: string): RequestContext {
  return { reqId: reqId ?? randomUUID() };
}

/** Runs `callback` inside an `AsyncLocalStorage` scope bound to `context`, so nested async work can read the same context. */
export function runWithRequestContext<T>(
  callback: () => T,
  context: RequestContext = createRequestContext(),
): T {
  return requestContext.run(context, callback);
}

/** Returns the {@link RequestContext} active in the current async scope, or `undefined` if called outside one. */
export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/** Returns the `reqId` of the current request context, or `undefined` if there is no active context. */
export function getReqId(): string | undefined {
  return getRequestContext()?.reqId;
}
