import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./old-hash.js";

describe("hashPassword", () => {
  it("produces a hash that verifies correctly", async () => {
    const password = "correct-horse-battery-staple";
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const password = "correct-horse-battery-staple";
    const wrongPassword = "incorrect-password";
    const hash = await hashPassword(password);
    const result = await verifyPassword(wrongPassword, hash);
    expect(result).toBe(false);
  });
});