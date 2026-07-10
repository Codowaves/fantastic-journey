import { describe, expect, it } from "vitest";

import { toOrdinal } from "./to-ordinal";

describe("toOrdinal", () => {
  it("uses 'st' for numbers ending in 1 (except 11)", () => {
    expect(toOrdinal(1)).toBe("1st");
    expect(toOrdinal(21)).toBe("21st");
  });

  it("uses 'nd' for numbers ending in 2 (except 12)", () => {
    expect(toOrdinal(2)).toBe("2nd");
    expect(toOrdinal(22)).toBe("22nd");
  });

  it("uses 'rd' for numbers ending in 3 (except 13)", () => {
    expect(toOrdinal(3)).toBe("3rd");
    expect(toOrdinal(23)).toBe("23rd");
  });

  it("uses 'th' for the teens (11, 12, 13)", () => {
    expect(toOrdinal(11)).toBe("11th");
    expect(toOrdinal(12)).toBe("12th");
    expect(toOrdinal(13)).toBe("13th");
  });

  it("uses 'th' for other numbers", () => {
    expect(toOrdinal(4)).toBe("4th");
    expect(toOrdinal(5)).toBe("5th");
    expect(toOrdinal(10)).toBe("10th");
    expect(toOrdinal(100)).toBe("100th");
  });

  it("throws TypeError when n is null or undefined", () => {
    expect(() => toOrdinal(null as unknown as number)).toThrow(TypeError);
    expect(() => toOrdinal(undefined as unknown as number)).toThrow(TypeError);
  });

  it("throws TypeError when n is NaN", () => {
    expect(() => toOrdinal(Number.NaN)).toThrow(TypeError);
  });
});
