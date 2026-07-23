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

  it('accepts a supported currency and an omitted one', () => {
    expect(validateExpense({ ...valid, currency: 'EUR' })).toEqual([]);
    expect(validateExpense({ ...valid, currency: undefined })).toEqual([]);
  });

  it('rejects an unsupported or non-string currency', () => {
    expect(fieldsWithErrors({ ...valid, currency: 'JPY' })).toContain('currency');
    expect(fieldsWithErrors({ ...valid, currency: 42 })).toContain('currency');
  });

  it('rejects a malformed date', () => {
    expect(fieldsWithErrors({ ...valid, date: 'not-a-date' })).toContain('date');
  });
});
