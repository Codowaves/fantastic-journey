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

  it("returns an empty string for a non-Date value (string)", () => {
    expect(formatDate("2024-01-05" as unknown as Date)).toBe("");
  });

  it("returns an empty string for a non-Date value (number)", () => {
    expect(formatDate(0 as unknown as Date)).toBe("");
  });

  it("returns an empty string for a non-Date value (null)", () => {
    expect(formatDate(null as unknown as Date)).toBe("");
  });

  it("returns an empty string for a non-Date value (undefined)", () => {
    expect(formatDate(undefined as unknown as Date)).toBe("");
  });

  it("returns an empty string for an empty object", () => {
    expect(formatDate({} as unknown as Date)).toBe("");
  });

  it("formats the earliest representable date (boundary)", () => {
    expect(formatDate(new Date("0001-01-01T00:00:00Z"))).toBe("1-01-01");
  });

  it("formats a leap-day date (boundary)", () => {
    expect(formatDate(new Date("2024-02-29T00:00:00Z"))).toBe("2024-02-29");
  });

  it("returns an empty string for an invalid date string", () => {
    expect(formatDate(new Date(""))).toBe("");
  });
});
