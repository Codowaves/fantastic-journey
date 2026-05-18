import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  timingSafeCompare,
  authenticate,
} from "./old-hash";

describe("hashPassword", () => {
  it("produces a salted hash with colon separator", async () => {
    const hashed = await hashPassword("password123");
    const [salt, hash] = hashed.split(":");
    expect(salt).toHaveLength(64);
    expect(hash).toHaveLength(128);
  });

  it("produces different hashes for same plaintext", async () => {
    const h1 = await hashPassword("same");
    const h2 = await hashPassword("same");
    expect(h1).not.toBe(h2);
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", async () => {
    const hashed = await hashPassword("correct-password");
    expect(await verifyPassword("correct-password", hashed)).toBe(true);
  });

  it("returns false for incorrect password", async () => {
    const hashed = await hashPassword("correct-password");
    expect(await verifyPassword("wrong-password", hashed)).toBe(false);
  });

  it("returns false for malformed hash", async () => {
    expect(await verifyPassword("password", "not-a-valid-hash")).toBe(false);
  });
});

describe("timingSafeCompare", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeCompare("abc123", "abc123")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(timingSafeCompare("abc123", "abc456")).toBe(false);
  });

  it("returns false for strings of different lengths", () => {
    expect(timingSafeCompare("short", "much-longer-string")).toBe(false);
  });
});

describe("authenticate", () => {
  it("returns true for matching token and secret", () => {
    expect(authenticate("my-secret-token", "my-secret-token")).toBe(true);
  });

  it("returns false for non-matching token and secret", () => {
    expect(authenticate("token", "different")).toBe(false);
  });

  it("returns false for different length tokens", () => {
    expect(authenticate("short", "much-longer-secret-value")).toBe(false);
  });
});
