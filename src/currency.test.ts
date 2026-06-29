import { describe, expect, it } from "vitest";

import { formatEur, formatGbp } from "./currency";

describe("formatEur", () => {
  it("formats whole euros with two decimals", () => {
    expect(formatEur(100)).toBe("€1.00");
  });

  it("formats euros and cents", () => {
    expect(formatEur(1234)).toBe("€12.34");
  });

  it("formats zero as €0.00", () => {
    expect(formatEur(0)).toBe("€0.00");
  });

  it("formats large values", () => {
    expect(formatEur(100000000)).toBe("€1000000.00");
  });

  it("pads single-digit cents with a leading zero", () => {
    expect(formatEur(105)).toBe("€1.05");
  });
});

describe("formatGbp", () => {
  it("formats whole pounds with two decimals", () => {
    expect(formatGbp(100)).toBe("£1.00");
  });

  it("formats pounds and pence", () => {
    expect(formatGbp(1234)).toBe("£12.34");
  });

  it("formats zero as £0.00", () => {
    expect(formatGbp(0)).toBe("£0.00");
  });

  it("formats large values", () => {
    expect(formatGbp(100000000)).toBe("£1000000.00");
  });

  it("pads single-digit pence with a leading zero", () => {
    expect(formatGbp(105)).toBe("£1.05");
  });
});
