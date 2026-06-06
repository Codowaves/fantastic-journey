import { describe, expect, it } from "vitest";

import { createLogger, maskEmail } from "./logger";
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

  it("masks email addresses in log messages", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    logger.info("login attempt for jane.doe@example.com from a new device");

    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(entry.message).toBe("login attempt for j***@example.com from a new device");
  });
});

describe("maskEmail", () => {
  it("masks the local part of a single email", () => {
    expect(maskEmail("contact jane.doe@example.com today")).toBe(
      "contact j***@example.com today",
    );
  });

  it("masks every email in a string with multiple addresses", () => {
    expect(maskEmail("from a@b.com to c@d.org")).toBe("from a***@b.com to c***@d.org");
  });

  it("leaves text without emails unchanged", () => {
    expect(maskEmail("no emails here at all")).toBe("no emails here at all");
  });
});
