import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  authenticate,
} from "./old-hash.js";

describe("hashPassword", () => {
  it("produces a non-empty hex string with salt:key format", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
  });

  it("produces different salts for same password", async () => {
    const hash1 = await hashPassword("hunter2");
    const hash2 = await hashPassword("hunter2");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", async () => {
    const hash = await hashPassword("hunter2");
    await expect(verifyPassword("hunter2", hash)).resolves.toBe(true);
  });

  it("returns false for incorrect password", async () => {
    const hash = await hashPassword("hunter2");
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });

  it("returns false for tampered hash", async () => {
    const hash = await hashPassword("hunter2");
    const [salt, key] = hash.split(":");
    if (!salt || !key) throw new Error("invalid hash format");
    await expect(
      verifyPassword("hunter2", `${salt}:${key.slice(1)}x`),
    ).resolves.toBe(false);
  });

  it("returns false for invalid stored format", async () => {
    await expect(verifyPassword("hunter2", "not-valid")).resolves.toBe(
      false,
    );
  });
});

describe("authenticate", () => {
  it("returns true for matching token", async () => {
    await expect(
      authenticate("my-secret-token", "my-secret-token"),
    ).resolves.toBe(true);
  });

  it("returns false for non-matching token", async () => {
    await expect(
      authenticate("wrong-token", "my-secret-token"),
    ).resolves.toBe(false);
  });

  it("returns false for mismatched token lengths", async () => {
    await expect(
      authenticate("short", "much-longer-secret"),
    ).resolves.toBe(false);
  });
});