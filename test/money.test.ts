import { describe, it, expect } from 'vitest';
import {
  reimbursableCents,
  reimbursableForCategory,
  sumCents,
  formatUsd,
  REIMBURSEMENT_RATES,
} from '../src/lib/money';

describe('reimbursableCents', () => {
  it('reimburses the full amount at 100%', () => {
    expect(reimbursableCents(10000, 100)).toBe(10000);
  });

  it('reimburses nothing at 0%', () => {
    expect(reimbursableCents(10000, 0)).toBe(0);
  });

  it('reimburses half at 50% for an evenly divisible amount', () => {
    expect(reimbursableCents(10000, 50)).toBe(5000);
  });

  it('rounds a fractional cent to the nearest cent', () => {
    expect(reimbursableCents(999, 50)).toBe(500); // 499.5 rounds up
    expect(reimbursableCents(997, 50)).toBe(499); // 498.5 rounds up
    expect(reimbursableCents(333, 75)).toBe(250); // 249.75 rounds up
    expect(reimbursableCents(101, 75)).toBe(76); // 75.75 rounds up
    expect(reimbursableCents(103, 75)).toBe(77); // 77.25 rounds down
  });
});

describe('reimbursableForCategory', () => {
  it('uses the category policy rate', () => {
    expect(reimbursableForCategory(10000, 'travel')).toBe(10000);
    expect(reimbursableForCategory(10000, 'meals')).toBe(5000);
  });

  it('reimburses 0 for an unknown category', () => {
    expect(reimbursableForCategory(10000, 'bribes')).toBe(0);
  });

  it('publishes a rate for every known category', () => {
    expect(REIMBURSEMENT_RATES.travel).toBe(100);
    expect(REIMBURSEMENT_RATES.meals).toBe(50);
  });
});

describe('sumCents / formatUsd', () => {
  it('sums a list of cent amounts', () => {
    expect(sumCents([100, 200, 50])).toBe(350);
    expect(sumCents([])).toBe(0);
  });

  it('formats cents as USD', () => {
    expect(formatUsd(12345)).toBe('$123.45');
    expect(formatUsd(0)).toBe('$0.00');
  });
});
