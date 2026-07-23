import { describe, it, expect } from 'vitest';
import { validateExpense, MAX_CENTS } from '../src/lib/validation';

const valid = {
  employee: 'Ada Lovelace',
  category: 'travel',
  amountCents: 4200,
  date: '2024-06-15',
};

const fieldsWithErrors = (input: Record<string, unknown>): string[] =>
  validateExpense(input).map((e) => e.field);

describe('validateExpense', () => {
  it('accepts a well-formed expense', () => {
    expect(validateExpense(valid)).toEqual([]);
  });

  it('rejects a missing or empty employee', () => {
    expect(fieldsWithErrors({ ...valid, employee: undefined })).toContain('employee');
    expect(fieldsWithErrors({ ...valid, employee: '   ' })).toContain('employee');
  });

  it('rejects an unknown category', () => {
    expect(fieldsWithErrors({ ...valid, category: 'bribes' })).toContain('category');
  });

  it('rejects a negative amount', () => {
    expect(fieldsWithErrors({ ...valid, amountCents: -100 })).toContain('amountCents');
  });

  it('rejects a non-integer amount', () => {
    expect(fieldsWithErrors({ ...valid, amountCents: 10.5 })).toContain('amountCents');
  });

  it('rejects an amount over the maximum', () => {
    expect(fieldsWithErrors({ ...valid, amountCents: MAX_CENTS + 1 })).toContain('amountCents');
  });

  it('rejects a malformed date', () => {
    expect(fieldsWithErrors({ ...valid, date: 'not-a-date' })).toContain('date');
  });

  it('rejects a future-dated expense', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    expect(fieldsWithErrors({ ...valid, date: tomorrow })).toContain('date');
    expect(validateExpense({ ...valid, date: tomorrow })).toEqual([
      { field: 'date', message: 'date must not be in the future' },
    ]);
  });

  it('accepts an expense dated today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(validateExpense({ ...valid, date: today })).toEqual([]);
  });
});
