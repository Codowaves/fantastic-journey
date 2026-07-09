import { describe, expect, it } from "vitest";

import { createLogger, maskEmail, maskEmails } from "./logger";
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

  it("throws TypeError when email is null", () => {
    expect(() => maskEmail(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when email is undefined", () => {
    expect(() => maskEmail(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when email is NaN", () => {
    expect(() => maskEmail(Number.NaN as unknown as string)).toThrow(TypeError);
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

  it("throws TypeError when input is null", () => {
    expect(() => maskEmails(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when input is undefined", () => {
    expect(() => maskEmails(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when input is NaN", () => {
    expect(() => maskEmails(Number.NaN as unknown as string)).toThrow(
      TypeError,
    );
  });
});
