import { describe, it, expect } from "vitest";
import { hashPassword, timingSafeCompare } from "./old-hash.js";

describe("bcrypt password utilities", () => {
  describe("hashPassword", () => {
    it("produces a bcrypt hash that can be verified", async () => {
      const hash = await hashPassword("correct-password");
      const valid = await timingSafeCompare("correct-password", hash);
      expect(valid).toBe(true);
    });

    it("produces different hashes for same password (per-user salt)", async () => {
      const hash1 = await hashPassword("same-password");
      const hash2 = await hashPassword("same-password");
      expect(hash1).not.toBe(hash2);
      const valid1 = await timingSafeCompare("same-password", hash1);
      const valid2 = await timingSafeCompare("same-password", hash2);
      expect(valid1).toBe(true);
      expect(valid2).toBe(true);
    });
  });

  describe("timingSafeCompare", () => {
    it("returns true for correct password", async () => {
      const hash = await hashPassword("my-password");
      const result = await timingSafeCompare("my-password", hash);
      expect(result).toBe(true);
    });

    it("returns false for incorrect password", async () => {
      const hash = await hashPassword("my-password");
      const result = await timingSafeCompare("wrong-password", hash);
      expect(result).toBe(false);
    });

    it("returns false for empty plaintext against a hash", async () => {
      const hash = await hashPassword("my-password");
      const result = await timingSafeCompare("", hash);
      expect(result).toBe(false);
    });

    it("returns false when comparing against an invalid hash", async () => {
      const result = await timingSafeCompare("password", "not-a-valid-bcrypt-hash");
      expect(result).toBe(false);
    });
  });
});