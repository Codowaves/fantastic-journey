import { describe, expect, it } from "vitest";

import { isEmail, isUrl, isUuid } from "./validators";

describe("isEmail", () => {
  it("accepts a plain local@domain.tld address", () => {
    expect(isEmail("user@example.com")).toBe(true);
  });

  it("accepts addresses with dots, plus-tags, and hyphens in the local part", () => {
    expect(isEmail("first.last+tag@sub.example.co")).toBe(true);
  });

  it("rejects strings without an @ sign", () => {
    expect(isEmail("not-an-email")).toBe(false);
  });

  it("rejects strings without a TLD after the @", () => {
    expect(isEmail("user@example")).toBe(false);
  });

  it("rejects strings containing whitespace", () => {
    expect(isEmail("user @example.com")).toBe(false);
    expect(isEmail("user@example .com")).toBe(false);
  });

  it("rejects the empty string", () => {
    expect(isEmail("")).toBe(false);
  });

  it("rejects a single-character local part with no domain", () => {
    expect(isEmail("a@")).toBe(false);
  });

  it("rejects a string that is just whitespace", () => {
    expect(isEmail("   ")).toBe(false);
  });

  it("rejects an address with multiple @ signs", () => {
    expect(isEmail("a@b@example.com")).toBe(false);
  });

  it("rejects a TLD that is only a dot", () => {
    expect(isEmail("user@example.")).toBe(false);
  });

  it("rejects leading and trailing whitespace", () => {
    expect(isEmail(" user@example.com")).toBe(false);
    expect(isEmail("user@example.com ")).toBe(false);
  });

  it("rejects an address with no local part", () => {
    expect(isEmail("@example.com")).toBe(false);
  });
});

describe("isUrl", () => {
  it("accepts an http:// URL", () => {
    expect(isUrl("http://example.com")).toBe(true);
  });

  it("accepts an https:// URL with path and query", () => {
    expect(isUrl("https://example.com/path?q=1&r=2")).toBe(true);
  });

  it("accepts non-http schemes that start with a letter", () => {
    expect(isUrl("ftp://files.example.com")).toBe(true);
    expect(isUrl("git+ssh://host/repo.git")).toBe(true);
  });

  it("rejects scheme-less paths", () => {
    expect(isUrl("/relative/path")).toBe(false);
    expect(isUrl("example.com")).toBe(false);
  });

  it("rejects schemes that do not begin with a letter", () => {
    expect(isUrl("1http://example.com")).toBe(false);
  });

  it("rejects strings containing whitespace", () => {
    expect(isUrl("http://exa mple.com")).toBe(false);
  });

  it("rejects the empty string", () => {
    expect(isUrl("")).toBe(false);
  });

  it("rejects a single-character scheme without ://", () => {
    expect(isUrl("a:foo")).toBe(false);
  });

  it("rejects a URL with a tab character", () => {
    expect(isUrl("http://example\t.com")).toBe(false);
  });

  it("rejects a URL with a newline character", () => {
    expect(isUrl("http://example\n.com")).toBe(false);
  });

  it("rejects a URL with only a scheme but no authority", () => {
    expect(isUrl("http://")).toBe(false);
  });

  it("accepts an uppercase scheme because the regex uses the i flag", () => {
    expect(isUrl("HTTP://example.com")).toBe(true);
    expect(isUrl("HTTPS://example.com/path")).toBe(true);
  });

  it("rejects a URL that is just whitespace", () => {
    expect(isUrl("   ")).toBe(false);
  });
});

describe("isUuid", () => {
  it("accepts a canonical lowercase v4 UUID", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("accepts uppercase hex digits", () => {
    expect(isUuid("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("accepts other UUID versions (1, 3, 5)", () => {
    expect(isUuid("6fa459ea-ee8a-3ca4-894e-db77e160355e")).toBe(true);
    expect(isUuid("00000000-0000-5000-8000-000000000000")).toBe(true);
  });

  it("rejects UUIDs missing a hyphen", () => {
    expect(isUuid("550e8400e29b41d4a716446655440000")).toBe(false);
  });

  it("rejects UUIDs with the wrong group lengths", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-44665544000")).toBe(false);
  });

  it("rejects UUIDs containing non-hex characters", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-44665544000z")).toBe(false);
  });

  it("rejects braced or urn-prefixed UUIDs", () => {
    expect(isUuid("{550e8400-e29b-41d4-a716-446655440000}")).toBe(false);
    expect(isUuid("urn:uuid:550e8400-e29b-41d4-a716-446655440000")).toBe(false);
  });

  it("rejects the empty string", () => {
    expect(isUuid("")).toBe(false);
  });

  it("rejects a UUID with too many characters", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-4466554400000")).toBe(false);
  });

  it("rejects a UUID where hyphens are misplaced", () => {
    expect(isUuid("550e8400e-29b-41d4-a716-446655440000")).toBe(false);
  });

  it("rejects a UUID with spaces between groups", () => {
    expect(isUuid("550e8400 e29b-41d4-a716-446655440000")).toBe(false);
  });

  it("rejects a UUID with only hex digits but no hyphens at all", () => {
    expect(isUuid("550e8400e29b41d4a716446655440000")).toBe(false);
  });

  it("rejects a UUID string that is just whitespace", () => {
    expect(isUuid("   ")).toBe(false);
  });

  it("rejects a UUID with surrounding whitespace", () => {
    expect(isUuid(" 550e8400-e29b-41d4-a716-446655440000")).toBe(false);
  });

  it("rejects a nil-like but malformed UUID", () => {
    expect(isUuid("00000000-0000-0000-0000-00000000000")).toBe(false);
  });
});
