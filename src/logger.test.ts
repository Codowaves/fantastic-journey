import { describe, expect, it } from "vitest";

import { createLogger, logger, maskEmail, maskEmails } from "./logger";
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

    logger.info("sent magic link to jane.doe@example.com from support@acme.io");

    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(entry.message).toBe(
      "sent magic link to j*******@example.com from s******@acme.io",
    );
  });

  it("writes debug and error entries at the correct level", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    logger.debug("dbg", { k: 1 });
    logger.error("boom", { k: 2 });

    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({
      level: "debug",
      message: "dbg",
      k: 1,
    });
    expect(JSON.parse(lines[1] ?? "{}")).toMatchObject({
      level: "error",
      message: "boom",
      k: 2,
    });
  });

  it("strips a caller-supplied reqId field and uses the ambient one", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    runWithRequestContext(
      () => logger.info("event", { reqId: "caller_supplied", accountId: "a" }),
      { reqId: "ambient_123" },
    );

    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(entry.reqId).toBe("ambient_123");
    expect(entry.accountId).toBe("a");
  });

  it("omits reqId when caller supplies one outside a request context", () => {
    const lines: string[] = [];
    const logger = createLogger((line) => lines.push(line));

    logger.info("event", { reqId: "caller_supplied" });

    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(entry).not.toHaveProperty("reqId");
  });

  it("propagates JSON.stringify failures for non-serializable fields", () => {
    const logger = createLogger();
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;

    expect(() => logger.info("event", circular)).toThrow(TypeError);
  });

  it("writes a JSON-formatted line through the process-wide logger", () => {
    const originalLog = console.log;
    const captured: string[] = [];
    console.log = (line: string) => {
      captured.push(line);
    };
    try {
      logger.info("hello");
    } finally {
      console.log = originalLog;
    }

    expect(captured).toHaveLength(1);
    const entry = JSON.parse(captured[0] ?? "{}") as Record<string, unknown>;
    expect(entry).toMatchObject({
      level: "info",
      message: "hello",
      timestamp: expect.any(String),
    });
  });
});

describe("maskEmail", () => {
  it("keeps the first character of the local part and masks the rest", () => {
    expect(maskEmail("jane.doe@example.com")).toBe("j*******@example.com");
  });

  it("masks a single-character local part entirely", () => {
    expect(maskEmail("j@example.com")).toBe("*@example.com");
  });

  it("leaves non-email strings unchanged", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });

  it("returns an empty string unchanged", () => {
    expect(maskEmail("")).toBe("");
  });

  it("returns strings with no local part unchanged", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
  });
});

describe("maskEmails", () => {
  it("masks every email address in a string", () => {
    expect(maskEmails("from a@x.com to b@y.com")).toBe(
      "from *@x.com to *@y.com",
    );
  });

  it("leaves strings without emails unchanged", () => {
    expect(maskEmails("no addresses here")).toBe("no addresses here");
  });

  it("returns an empty string unchanged", () => {
    expect(maskEmails("")).toBe("");
  });

  it("masks emails adjacent to punctuation", () => {
    expect(maskEmails("Contact a@x.com, or b@y.com.")).toBe(
      "Contact *@x.com, or *@y.com.",
    );
  });
});
