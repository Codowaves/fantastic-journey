import { describe, it, expect } from "vitest";
import {
  hashPassword,
  timingSafeCompare,
  authenticate,
} from "./old-hash.js";

describe("hashPassword", () => {
  it("produces a hash that is not the plaintext", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
  });

  it("produces different hashes for the same plaintext (per-user salt)", async () => {
    const hash1 = await hashPassword("password123");
    const hash2 = await hashPassword("password123");
    expect(hash1).not.toBe(hash2);
  });
});

describe("timingSafeCompare", () => {
  it("returns true for matching plaintext and hash", async () => {
    const hash = await hashPassword("correct-password");
    const result = await timingSafeCompare("correct-password", hash);
    expect(result).toBe(true);
  });

  it("returns false for incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await timingSafeCompare("wrong-password", hash);
    expect(result).toBe(false);
  });
});

describe("authenticate", () => {
  it("returns true for correct token and hash", async () => {
    const hash = await hashPassword("my-secret-token");
    const result = await authenticate("my-secret-token", hash);
    expect(result).toBe(true);
  });

  it("returns false for incorrect token", async () => {
    const hash = await hashPassword("my-secret-token");
    const result = await authenticate("wrong-token", hash);
    expect(result).toBe(false);
  });
});