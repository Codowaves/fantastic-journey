import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./old-hash.js";

describe("bcrypt password hashing", () => {
  it("produces a valid bcrypt hash", async () => {
    const password = "test-password-123";
    const hash = await hashPassword(password);

    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("hashes the same password to different values (per-user salt)", async () => {
    const password = "same-password";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    // Each hash should be unique due to per-user salt
    expect(hash1).not.toBe(hash2);
  });

  it("successfully verifies correct password (round-trip)", async () => {
    const password = "my-secure-password";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const correctPassword = "correct-password";
    const incorrectPassword = "wrong-password";
    const hash = await hashPassword(correctPassword);

    const isValid = await verifyPassword(incorrectPassword, hash);
    expect(isValid).toBe(false);
  });

  it("rejects password with slight variation", async () => {
    const password = "MyPassword123";
    const hash = await hashPassword(password);

    // Case sensitivity check
    const isValid = await verifyPassword("mypassword123", hash);
    expect(isValid).toBe(false);
  });

  it("rejects empty password when hash is non-empty", async () => {
    const password = "non-empty-password";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword("", hash);
    expect(isValid).toBe(false);
  });

  it("handles special characters in password", async () => {
    const password = "p@ssw0rd!#$%^&*()";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("handles unicode characters in password", async () => {
    const password = "пароль密码🔐";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });
});
