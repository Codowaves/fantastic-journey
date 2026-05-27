import type { IncomingMessage, ServerResponse } from "node:http";

import { describe, expect, it } from "vitest";

import { createApiServer } from "./server";

interface CapturedResponse {
  body: string;
  headers: Record<string, string | number | readonly string[]>;
  statusCode: number;
}

function createRequest(path: string): IncomingMessage {
  return {
    headers: { host: "example.com" },
    method: "GET",
    url: path,
  } as IncomingMessage;
}

function createResponse() {
  const headers: CapturedResponse["headers"] = {};

  let response: ServerResponse;
  const done = new Promise<CapturedResponse>((resolve) => {
    response = {
      statusCode: 200,
      setHeader(name: string, value: number | string | readonly string[]) {
        headers[name.toLowerCase()] = value;
        return response;
      },
      end(chunk?: Uint8Array | string) {
        resolve({
          body: chunk ? Buffer.from(chunk).toString("utf8") : "",
          headers,
          statusCode: response.statusCode,
        });
        return response;
      },
    } as ServerResponse;
  });

  return { done, response: response! };
}

describe("api server", () => {
  it("returns an empty project list over HTTP when no projects exist", async () => {
    const server = createApiServer({
      database: {
        query: () => Promise.resolve({ rows: null }),
      },
    });
    const { done, response } = createResponse();

    server.emit("request", createRequest("/api/projects"), response);
    const result = await done;

    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(result.body)).toEqual({ items: [] });
  });
});
