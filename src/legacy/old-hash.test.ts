import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  timingSafeCompare,
  authenticate,
} from "./old-hash";

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const password = "mySecurePassword123";
    const hash = await hashPassword(password);

    expect(hash).toBeTruthy();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should generate unique salts for same password", async () => {
    const password = "samePassword";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    // bcrypt generates unique salts, so hashes should differ
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("should verify correct password (round-trip)", async () => {
    const password = "correctPassword";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const correctPassword = "correctPassword";
    const wrongPassword = "wrongPassword";
    const hash = await hashPassword(correctPassword);

    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it("should reject password with different casing", async () => {
    const password = "Password123";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword("password123", hash);
    expect(isValid).toBe(false);
  });

  it("should reject empty password when hash is for non-empty", async () => {
    const password = "nonEmpty";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword("", hash);
    expect(isValid).toBe(false);
  });
});

describe("timingSafeCompare", () => {
  it("should return true for identical strings", () => {
    const str = "identicalString";
    expect(timingSafeCompare(str, str)).toBe(true);
  });

  it("should return false for different strings", () => {
    expect(timingSafeCompare("string1", "string2")).toBe(false);
  });

  it("should return false for strings of different lengths", () => {
    expect(timingSafeCompare("short", "longer string")).toBe(false);
  });

  it("should return false for empty vs non-empty", () => {
    expect(timingSafeCompare("", "non-empty")).toBe(false);
  });

  it("should return true for two empty strings", () => {
    expect(timingSafeCompare("", "")).toBe(true);
  });
});

describe("authenticate", () => {
  it("should return true when tokens match", () => {
    const token = "validToken123";
    expect(authenticate(token, token)).toBe(true);
  });

  it("should return false when tokens do not match", () => {
    const token = "validToken123";
    const wrongToken = "invalidToken456";
    expect(authenticate(token, wrongToken)).toBe(false);
  });

  it("should return false for different length tokens", () => {
    expect(authenticate("short", "longerToken")).toBe(false);
  });
});
