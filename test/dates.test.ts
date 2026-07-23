import { describe, it, expect } from 'vitest';
import { isWithinPeriod, daysBetween, monthOf } from '../src/lib/dates';

describe('isWithinPeriod', () => {
  it('includes both range boundaries', () => {
    expect(isWithinPeriod('2024-06-01', '2024-06-01', '2024-06-30')).toBe(true);
    expect(isWithinPeriod('2024-06-30', '2024-06-01', '2024-06-30')).toBe(true);
    expect(isWithinPeriod('2024-06-15', '2024-06-01', '2024-06-30')).toBe(true);
  });

  it('excludes dates outside the range', () => {
    expect(isWithinPeriod('2024-05-31', '2024-06-01', '2024-06-30')).toBe(false);
    expect(isWithinPeriod('2024-07-01', '2024-06-01', '2024-06-30')).toBe(false);
  });
});

describe('daysBetween', () => {
  it('counts whole days', () => {
    expect(daysBetween('2024-06-01', '2024-06-08')).toBe(7);
    expect(daysBetween('2024-06-08', '2024-06-01')).toBe(-7);
    expect(daysBetween('2024-06-01', '2024-06-01')).toBe(0);
  });
});

describe('monthOf', () => {
  it('extracts the YYYY-MM key', () => {
    expect(monthOf('2024-06-15')).toBe('2024-06');
  });
});
