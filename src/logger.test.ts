import { describe, expect, it } from "vitest";

import { createLogger, maskEmailsInString } from "./logger";
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

  it("masks email addresses appearing in log output", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    logger.info("sent to jane.doe@example.com for follow-up");

    const entry = JSON.parse(lines[0] ?? "{}") as { message?: string };
    expect(entry.message).toBe("sent to j***@example.com for follow-up");
  });
});

describe("maskEmailsInString", () => {
  it("masks the local part keeping only the first character", () => {
    expect(maskEmailsInString("contact jane.doe@example.com today")).toBe(
      "contact j***@example.com today",
    );
  });

  it("masks short local parts without dropping them", () => {
    expect(maskEmailsInString("write to ab@example.com")).toBe(
      "write to a***@example.com",
    );
  });

  it("leaves strings without emails unchanged", () => {
    expect(maskEmailsInString("no email here")).toBe("no email here");
  });
});
