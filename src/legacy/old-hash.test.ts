import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createToken,
  timingSafeCompare,
  authenticate,
} from "./old-hash";

describe("hashPassword", () => {
  it("produces a non-empty hash", async () => {
    const hash = await hashPassword("password123");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("produces different hashes for same plaintext (salted)", async () => {
    const hash1 = await hashPassword("password123");
    const hash2 = await hashPassword("password123");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("correct-password", hash);
    expect(result).toBe(true);
  });

  it("returns false for incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });
});

describe("timingSafeCompare", () => {
  it("returns true for equal strings", async () => {
    const result = await timingSafeCompare("test-token", "test-token");
    expect(result).toBe(true);
  });

  it("returns false for different strings of same length", async () => {
    const result = await timingSafeCompare("test-token", "Test-Token");
    expect(result).toBe(false);
  });

  it("returns false for different length strings", async () => {
    const result = await timingSafeCompare("short", "much-longer-string");
    expect(result).toBe(false);
  });
});

describe("createToken and authenticate", () => {
  it("authenticate returns true for valid token created with same secret", async () => {
    const secret = "my-secret-key";
    const token = await createToken("user-payload", secret);
    const result = await authenticate(token, secret);
    expect(result).toBe(true);
  });

  it("authenticate returns false for wrong secret", async () => {
    const secret = "my-secret-key";
    const token = await createToken("user-payload", secret);
    const result = await authenticate(token, "wrong-secret");
    expect(result).toBe(false);
  });

  it("authenticate returns false for malformed token", async () => {
    const secret = "my-secret-key";
    const result = await authenticate("not-a-valid-token-format", secret);
    expect(result).toBe(false);
  });

  it("authenticate returns false for empty token", async () => {
    const secret = "my-secret-key";
    const result = await authenticate("", secret);
    expect(result).toBe(false);
  });
});