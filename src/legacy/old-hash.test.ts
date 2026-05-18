import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  timingSafeCompare,
  timingSafeEqualBuffer,
  authenticate,
} from "./old-hash.js";

describe("legacy auth helpers", () => {
  describe("hashPassword / verifyPassword", () => {
    it("verifies a valid password", async () => {
      const hash = await hashPassword("correct-horse-battery");
      expect(await verifyPassword("correct-horse-battery", hash)).toBe(true);
    });

    it("rejects an invalid password", async () => {
      const hash = await hashPassword("correct-horse-battery");
      expect(await verifyPassword("wrong-password", hash)).toBe(false);
    });

    it("produces different hashes for same plaintext (salt)", async () => {
      const h1 = await hashPassword("same");
      const h2 = await hashPassword("same");
      expect(h1).not.toBe(h2);
    });

    it("rejects malformed ciphertext", async () => {
      expect(await verifyPassword("pw", "no-colon-here")).toBe(false);
      expect(await verifyPassword("pw", "")).toBe(false);
    });
  });

  describe("timingSafeCompare", () => {
    it("returns true for equal strings", () => {
      expect(timingSafeCompare("abc", "abc")).toBe(true);
    });

    it("returns false for different lengths", () => {
      expect(timingSafeCompare("abc", "abcd")).toBe(false);
    });

    it("returns false for different strings", () => {
      expect(timingSafeCompare("abc", "xyz")).toBe(false);
    });
  });

  describe("timingSafeEqualBuffer", () => {
    it("returns true for equal hex buffers", () => {
      const a = Buffer.from("deadbeef", "hex");
      const b = Buffer.from("deadbeef", "hex");
      expect(timingSafeEqualBuffer(a.toString("hex"), b.toString("hex"))).toBe(
        true,
      );
    });

    it("returns false for different hex buffers", () => {
      const a = Buffer.from("deadbeef", "hex");
      const b = Buffer.from("cafebabe", "hex");
      expect(timingSafeEqualBuffer(a.toString("hex"), b.toString("hex"))).toBe(
        false,
      );
    });

    it("returns false for mismatched lengths", () => {
      expect(timingSafeEqualBuffer("deadbeef", "cafebabecafe")).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("authenticates a valid password", async () => {
      const hash = await hashPassword("super-secret");
      expect(await authenticate("super-secret", hash)).toBe(true);
    });

    it("rejects an invalid password", async () => {
      const hash = await hashPassword("super-secret");
      expect(await authenticate("wrong-secret", hash)).toBe(false);
    });
  });
});
