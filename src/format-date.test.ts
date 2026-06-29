import { describe, it, expect } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("pads single-digit months and days", () => {
    expect(formatDate(new Date("2024-01-05T00:00:00Z"))).toBe("2024-01-05");
  });

  it("formats a date with two-digit month and day", () => {
    expect(formatDate(new Date("2024-12-31T00:00:00Z"))).toBe("2024-12-31");
  });

  it("formats a mid-year date", () => {
    expect(formatDate(new Date("2026-06-29T00:00:00Z"))).toBe("2026-06-29");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate(new Date("not-a-date"))).toBe("");
  });

  it("formats in UTC even when local timezone differs", () => {
    const date = new Date(Date.UTC(2024, 0, 1, 23, 59, 59));
    expect(formatDate(date)).toBe("2024-01-01");
  });
});
