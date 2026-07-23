import { CATEGORIES, type Category } from './money';
import type { NewBudgetInput, NewExpenseInput } from '../types';

export interface FieldError {
  field: string;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** True when `value` is a well-formed `YYYY-MM` month key. */
export function isIsoMonth(value: unknown): value is string {
  return typeof value === 'string' && ISO_MONTH.test(value);
}

/** Largest expense the service accepts: $1,000,000. */
export const MAX_CENTS = 100_000_000;

/**
 * Validate a raw create-expense body. Returns one {field, message} per problem
 * (empty array = valid). Pure; performs no I/O.
 */
export function validateExpense(input: NewExpenseInput): FieldError[] {
  const errors: FieldError[] = [];

  if (typeof input.employee !== 'string' || input.employee.trim() === '') {
    errors.push({ field: 'employee', message: 'employee is required' });
  }

  if (typeof input.category !== 'string' || !CATEGORIES.includes(input.category as Category)) {
    errors.push({
      field: 'category',
      message: `category must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

  if (typeof input.amountCents !== 'number' || !Number.isInteger(input.amountCents)) {
    errors.push({ field: 'amountCents', message: 'amountCents must be an integer' });
  } else if (input.amountCents < 0 || input.amountCents > MAX_CENTS) {
    errors.push({
      field: 'amountCents',
      message: `amountCents must be between 1 and ${MAX_CENTS}`,
    });
  }

  if (
    typeof input.date !== 'string' ||
    !ISO_DATE.test(input.date) ||
    Number.isNaN(Date.parse(input.date))
  ) {
    errors.push({ field: 'date', message: 'date must be a valid ISO date (YYYY-MM-DD)' });
  }

  return errors;
}

/**
 * Validate a raw set-budget request: the category from the path plus the body.
 * Returns one {field, message} per problem (empty array = valid). Pure.
 */
export function validateBudget(category: unknown, input: NewBudgetInput): FieldError[] {
  const errors: FieldError[] = [];

  if (typeof category !== 'string' || !CATEGORIES.includes(category as Category)) {
    errors.push({
      field: 'category',
      message: `category must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

  if (typeof input.limitCents !== 'number' || !Number.isInteger(input.limitCents)) {
    errors.push({ field: 'limitCents', message: 'limitCents must be an integer' });
  } else if (input.limitCents < 0 || input.limitCents > MAX_CENTS) {
    errors.push({
      field: 'limitCents',
      message: `limitCents must be between 0 and ${MAX_CENTS}`,
    });
  }

  return errors;
}
