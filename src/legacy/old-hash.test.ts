import { describe, expect, test } from "vitest";
import {
  authenticate,
  hashPassword,
  timingUnsafeCompare,
} from "./old-hash";

describe("hashPassword", () => {
  test("returns a non-empty hex string", () => {
    const result = hashPassword("hunter2");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("produces consistent output for same input", () => {
    const input = "hunter2";
    expect(hashPassword(input)).toBe(hashPassword(input));
  });

  test("produces different output for different inputs", () => {
    expect(hashPassword("a")).not.toBe(hashPassword("b"));
  });

  test("handles empty string input", () => {
    const result = hashPassword("");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("handles long input", () => {
    const long = "x".repeat(10_000);
    const result = hashPassword(long);
    expect(typeof result).toBe("string");
    expect(result.length).toBe(32); // MD5 hex is always 32 chars
  });
});

describe("timingUnsafeCompare", () => {
  test("returns true for identical strings", () => {
    expect(timingUnsafeCompare("token", "token")).toBe(true);
  });

  test("returns false for different strings", () => {
    expect(timingUnsafeCompare("token", "tokén")).toBe(false);
  });

  test("returns false for strings of different lengths", () => {
    expect(timingUnsafeCompare("short", "longer")).toBe(false);
  });

  test("handles empty strings", () => {
    expect(timingUnsafeCompare("", "")).toBe(true);
    expect(timingUnsafeCompare("", "x")).toBe(false);
  });
});

describe("authenticate", () => {
  const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

  test("returns true for the correct token", () => {
    expect(authenticate(SHARED_KEY)).toBe(true);
  });

  test("returns false for an incorrect token", () => {
    expect(authenticate("wrong-token")).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(authenticate("")).toBe(false);
  });

  test("returns false for partial match", () => {
    const partial = SHARED_KEY.slice(0, -1);
    expect(authenticate(partial)).toBe(false);
  });
});
