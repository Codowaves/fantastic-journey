import { describe, it, expect } from "vitest";
import { secondsToHMS } from "./seconds-to-hms";

describe("secondsToHMS", () => {
  it("formats zero seconds", () => {
    expect(secondsToHMS(0)).toBe("0:00:00");
  });

  it("formats sub-minute values with zero-padded minutes and seconds", () => {
    expect(secondsToHMS(1)).toBe("0:00:01");
    expect(secondsToHMS(9)).toBe("0:00:09");
    expect(secondsToHMS(30)).toBe("0:00:30");
  });

  it("formats one minute exactly", () => {
    expect(secondsToHMS(60)).toBe("0:01:00");
  });

  it("formats under one hour with zero-padded minute", () => {
    expect(secondsToHMS(125)).toBe("0:02:05");
    expect(secondsToHMS(599)).toBe("0:09:59");
  });

  it("formats one hour exactly", () => {
    expect(secondsToHMS(3600)).toBe("1:00:00");
  });

  it("formats hours, minutes, and seconds together", () => {
    expect(secondsToHMS(3661)).toBe("1:01:01");
    expect(secondsToHMS(3725)).toBe("1:02:05");
    expect(secondsToHMS(7325)).toBe("2:02:05");
  });

  it("does not zero-pad the hour segment", () => {
    expect(secondsToHMS(36000)).toBe("10:00:00");
    expect(secondsToHMS(360000)).toBe("100:00:00");
  });

  it("zero-pads minutes and seconds when needed", () => {
    expect(secondsToHMS(3601)).toBe("1:00:01");
    expect(secondsToHMS(3660)).toBe("1:01:00");
  });

  it("truncates fractional seconds", () => {
    expect(secondsToHMS(59.9)).toBe("0:00:59");
    expect(secondsToHMS(60.5)).toBe("0:01:00");
  });

  it("handles large hour values without overflow", () => {
    expect(secondsToHMS(3600 * 24)).toBe("24:00:00");
  });

  it("throws RangeError for negative seconds", () => {
    expect(() => secondsToHMS(-1)).toThrow(RangeError);
    expect(() => secondsToHMS(-1)).toThrow("seconds must be non-negative");
  });

  it("throws RangeError for non-finite seconds", () => {
    expect(() => secondsToHMS(Infinity)).toThrow(RangeError);
    expect(() => secondsToHMS(-Infinity)).toThrow(RangeError);
    expect(() => secondsToHMS(Infinity)).toThrow(
      "seconds must be a finite number",
    );
  });

  it("throws TypeError when s is null", () => {
    expect(() => secondsToHMS(null as unknown as number)).toThrow(TypeError);
    expect(() => secondsToHMS(null as unknown as number)).toThrow(
      "s must be a number",
    );
  });

  it("throws TypeError when s is undefined", () => {
    expect(() => secondsToHMS(undefined as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => secondsToHMS(undefined as unknown as number)).toThrow(
      "s must be a number",
    );
  });

  it("throws TypeError when s is NaN", () => {
    expect(() => secondsToHMS(Number.NaN)).toThrow(TypeError);
    expect(() => secondsToHMS(Number.NaN)).toThrow("s must be a number");
  });
});
