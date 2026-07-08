import { describe, expect, it } from "vitest";

import { omitBy } from "./omit-by";

describe("omitBy", () => {
  it("omits keys whose value matches the predicate", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    expect(omitBy(obj, (v) => v % 2 === 0)).toEqual({ a: 1, c: 3 });
  });

  it("passes both value and key to the predicate", () => {
    const seen: Array<[unknown, string]> = [];
    const obj = { a: 1, b: 2, c: 3 };
    omitBy(obj, (value, key) => {
      seen.push([value, key]);
      return false;
    });
    expect(seen).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });

  it("does not mutate the source object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const snapshot = { ...obj };
    omitBy(obj, () => true);
    expect(obj).toEqual(snapshot);
  });

  it("returns an empty object when every key matches", () => {
    expect(omitBy({ a: 1, b: 2 }, () => true)).toEqual({});
  });

  it("returns a copy of the object when no key matches", () => {
    const obj = { a: 1, b: 2 };
    expect(omitBy(obj, () => false)).toEqual(obj);
  });

  it("returns an empty object for an empty input", () => {
    expect(omitBy({} as Record<string, number>, () => true)).toEqual({});
  });

  it("throws TypeError when obj is null or undefined", () => {
    expect(() =>
      omitBy(null as unknown as Record<string, number>, () => false),
    ).toThrow(TypeError);
    expect(() =>
      omitBy(undefined as unknown as Record<string, number>, () => false),
    ).toThrow(TypeError);
  });

  it("throws TypeError when obj is NaN", () => {
    expect(() =>
      omitBy(Number.NaN as unknown as Record<string, number>, () => false),
    ).toThrow(TypeError);
  });

  it("throws TypeError when obj is not an object", () => {
    expect(() =>
      omitBy("not an object" as unknown as Record<string, number>, () => false),
    ).toThrow(TypeError);
    expect(() =>
      omitBy(42 as unknown as Record<string, number>, () => false),
    ).toThrow(TypeError);
  });

  it("throws TypeError when pred is null or undefined", () => {
    expect(() =>
      omitBy({ a: 1 }, null as unknown as (v: number) => boolean),
    ).toThrow(TypeError);
    expect(() =>
      omitBy({ a: 1 }, undefined as unknown as (v: number) => boolean),
    ).toThrow(TypeError);
  });

  it("throws TypeError when pred is NaN", () => {
    expect(() =>
      omitBy({ a: 1 }, Number.NaN as unknown as (v: number) => boolean),
    ).toThrow(TypeError);
  });

  it("throws TypeError when pred is not a function", () => {
    expect(() =>
      omitBy({ a: 1 }, "not a function" as unknown as (v: number) => boolean),
    ).toThrow(TypeError);
    expect(() =>
      omitBy({ a: 1 }, 42 as unknown as (v: number) => boolean),
    ).toThrow(TypeError);
  });
});
