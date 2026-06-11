import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/**
 * Request context that tracks a unique request ID through the application.
 */
export interface RequestContext {
  reqId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Creates a new request context with the given or auto-generated request ID.
 * @param reqId - Optional request ID; if omitted, a new UUID is generated.
 * @returns A new RequestContext instance.
 */
export function createRequestContext(reqId?: string): RequestContext {
  return { reqId: reqId ?? randomUUID() };
}

/**
 * Runs a callback within a request context scope using AsyncLocalStorage.
 * @param callback - The function to execute within the request context.
 * @param context - The request context to use; defaults to a new context.
 * @returns The result of the callback.
 */
export function runWithRequestContext<T>(
  callback: () => T,
  context: RequestContext = createRequestContext(),
): T {
  return requestContext.run(context, callback);
}

/**
 * Retrieves the current request context from AsyncLocalStorage.
 * @returns The current RequestContext, or undefined if not running within a request context.
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/**
 * Retrieves the request ID from the current request context.
 * @returns The current request ID, or undefined if not running within a request context.
 */
export function getReqId(): string | undefined {
  return getRequestContext()?.reqId;
}
