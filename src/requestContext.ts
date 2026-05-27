import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export interface RequestContext {
  reqId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

export function createRequestContext(): RequestContext {
  return { reqId: randomUUID() };
}

export function runWithRequestContext<T>(
  callback: () => T,
  context: RequestContext = createRequestContext(),
): T {
  return requestContext.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function getReqId(): string | undefined {
  return getRequestContext()?.reqId;
}
