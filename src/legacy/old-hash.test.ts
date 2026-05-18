import { describe, it, expect } from "vitest";
import { hashPassword, authenticate, timingSafeCompare } from "./old-hash";

describe("hashPassword", () => {
  it("produces a non-empty hex string", async () => {
    const hash = await hashPassword("password");
    expect(hash.length).greaterThan(0);
  });

  it("produces unique salts per call", async () => {
    const hash1 = await hashPassword("password");
    const hash2 = await hashPassword("password");
    expect(hash1).not.equal(hash2);
  });

  it("uses provided salt", async () => {
    const hash = await hashPassword("password", "固定盐");
    expect(hash.startsWith("固定盐:")).toBe(true);
  });
});

describe("authenticate", () => {
  it("returns true for correct password", async () => {
    const hash = await hashPassword("correct-password");
    const ok = await authenticate("correct-password", hash);
    expect(ok).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const ok = await authenticate("wrong-password", hash);
    expect(ok).toBe(false);
  });

  it("returns false for tampered hash", async () => {
    const hash = await hashPassword("correct-password");
    const tampered = hash.replace(/^.{2}/, "xx");
    const ok = await authenticate("correct-password", tampered);
    expect(ok).toBe(false);
  });

  it("returns false for hash without separator", async () => {
    const ok = await authenticate("token", "invalidsuffix");
    expect(ok).toBe(false);
  });
});

describe("timingSafeCompare", () => {
  it("returns true for equal strings", async () => {
    const ok = await timingSafeCompare("abc", "abc");
    expect(ok).toBe(true);
  });

  it("returns false for different strings", async () => {
    const ok = await timingSafeCompare("abc", "def");
    expect(ok).toBe(false);
  });

  it("returns false for different lengths", async () => {
    const ok = await timingSafeCompare("short", "muchlonger");
    expect(ok).toBe(false);
  });
});