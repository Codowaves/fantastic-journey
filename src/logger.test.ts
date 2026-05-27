import { describe, expect, it } from "vitest";

import { createLogger } from "./logger";
import { runWithRequestContext } from "./requestContext";

describe("logger", () => {
  it("includes the current request ID inside a request context", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    runWithRequestContext(
      () => logger.info("loaded account", { accountId: "acct_1" }),
      { reqId: "req_123" },
    );

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({
      level: "info",
      message: "loaded account",
      accountId: "acct_1",
      reqId: "req_123",
      timestamp: expect.any(String),
    });
  });

  it("omits reqId outside a request context", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    logger.warn("cache miss");

    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(entry).toMatchObject({
      level: "warn",
      message: "cache miss",
      timestamp: expect.any(String),
    });
    expect(entry).not.toHaveProperty("reqId");
  });
});
