import { describe, it, expect } from "vitest";
import {
  hashPasswordAsync,
  verifyPassword,
  authenticate,
} from "./old-hash";

describe("legacy auth helpers", () => {
  describe("hashPasswordAsync", () => {
    it("produces a non-empty hash and salt", async () => {
      const result = await hashPasswordAsync("s3cr3t");
      expect(result.hash).not.toBe("");
      expect(result.salt).not.toBe("");
      expect(result.hash.length).toBeGreaterThan(0);
      expect(result.salt.length).toBeGreaterThan(0);
    });

    it("produces different salts for same password", async () => {
      const result1 = await hashPasswordAsync("s3cr3t");
      const result2 = await hashPasswordAsync("s3cr3t");
      expect(result1.salt).not.toBe(result2.salt);
      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe("verifyPassword", () => {
    it("returns true for correct password", async () => {
      const { hash, salt } = await hashPasswordAsync("correct-password");
      const valid = await verifyPassword("correct-password", hash, salt);
      expect(valid).toBe(true);
    });

    it("returns false for wrong password", async () => {
      const { hash, salt } = await hashPasswordAsync("correct-password");
      const invalid = await verifyPassword("wrong-password", hash, salt);
      expect(invalid).toBe(false);
    });

    it("returns false for mismatched hash length", async () => {
      const result = await verifyPassword("password", "nothex", "salt");
      expect(result).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("returns true for correct token", async () => {
      const { hash, salt } = await hashPasswordAsync("my-token");
      const ok = await authenticate("my-token", hash, salt);
      expect(ok).toBe(true);
    });

    it("returns false for wrong token", async () => {
      const { hash, salt } = await hashPasswordAsync("my-token");
      const ok = await authenticate("wrong-token", hash, salt);
      expect(ok).toBe(false);
    });

    it("returns false when hash and salt do not match", async () => {
      const ok = await authenticate("token", "a".repeat(128), "salt");
      expect(ok).toBe(false);
    });
  });
});