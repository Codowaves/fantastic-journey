import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { createApiV1Handler, type ApiV1Dependencies } from "./api/v1";

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value.join(", ") : value;
}

function createRequest(message: IncomingMessage): Request {
  const host = getHeaderValue(message.headers.host) ?? "localhost";
  const url = new URL(message.url ?? "/", `http://${host}`);

  return new Request(url, {
    method: message.method,
    headers: new Headers(
      Object.entries(message.headers).flatMap(([name, value]) => {
        const headerValue = getHeaderValue(value);
        return headerValue === undefined ? [] : [[name, headerValue]];
      }),
    ),
  });
}

async function writeResponse(target: ServerResponse, response: Response): Promise<void> {
  target.statusCode = response.status;
  response.headers.forEach((value, name) => target.setHeader(name, value));

  if (response.body === null) {
    target.end();
    return;
  }

  target.end(Buffer.from(await response.arrayBuffer()));
}

export function createApiServer(dependencies: ApiV1Dependencies = {}) {
  const handle = createApiV1Handler(dependencies);

  return createServer((request, response) => {
    handle(createRequest(request))
      .then((apiResponse) => writeResponse(response, apiResponse))
      .catch((error: unknown) => {
        console.error(error);
        response.statusCode = 500;
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ error: "Internal server error" }));
      });
  });
}

if (process.env.NODE_ENV !== "test" && process.argv[1] === new URL(import.meta.url).pathname) {
  const port = Number(process.env.PORT ?? 4000);

  createApiServer().listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}
