import { CATEGORIES, type Category } from './money';
import type { NewExpenseInput } from '../types';

export interface FieldError {
  field: string;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
