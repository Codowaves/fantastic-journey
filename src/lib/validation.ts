import { CATEGORIES, type Category } from './money';
import type { NewExpenseInput } from '../types';

export interface FieldError {
  field: string;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Largest expense the service accepts: $1,000,000. */
export const MAX_CENTS = 100_000_000;

/** Today as `YYYY-MM-DD` (UTC). */
const todayIso = (): string => new Date().toISOString().slice(0, 10);

/** A single field check: returns the problem it found, or null when happy. */
type Check = (input: NewExpenseInput) => FieldError | null;

const checkEmployee: Check = ({ employee }) =>
  typeof employee !== 'string' || employee.trim() === ''
    ? { field: 'employee', message: 'employee is required' }
    : null;

const checkCategory: Check = ({ category }) =>
  typeof category !== 'string' || !CATEGORIES.includes(category as Category)
    ? { field: 'category', message: `category must be one of: ${CATEGORIES.join(', ')}` }
    : null;

const checkAmount: Check = ({ amountCents }) => {
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents)) {
    return { field: 'amountCents', message: 'amountCents must be an integer' };
  }
  if (amountCents < 0 || amountCents > MAX_CENTS) {
    return { field: 'amountCents', message: `amountCents must be between 1 and ${MAX_CENTS}` };
  }
  return null;
};

const checkDate: Check = ({ date }) => {
  if (typeof date !== 'string' || !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    return { field: 'date', message: 'date must be a valid ISO date (YYYY-MM-DD)' };
  }
  // ISO dates sort lexicographically, so a string compare is a correct future check.
  if (date > todayIso()) {
    return { field: 'date', message: 'date must not be in the future' };
  }
  return null;
};

const CHECKS: Check[] = [checkEmployee, checkCategory, checkAmount, checkDate];

/**
 * Validate a raw create-expense body. Returns one {field, message} per problem
 * (empty array = valid). Performs no I/O; only reads today's date.
 */
export function validateExpense(input: NewExpenseInput): FieldError[] {
  return CHECKS.map((check) => check(input)).filter((e): e is FieldError => e !== null);
}
