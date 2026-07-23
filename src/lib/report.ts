import type { Expense } from '../types';
import { isWithinPeriod } from './dates';

export interface EmployeeReportRow {
  employee: string;
  totalCents: number;
  count: number;
}

/**
 * Per-employee totals for the expenses dated in the inclusive range
 * [from, to]. Rows are sorted by employee name. Pure; performs no I/O.
 */
export function reportByEmployee(
  expenses: Expense[],
  from: string,
  to: string,
): EmployeeReportRow[] {
  const rows = new Map<string, EmployeeReportRow>();
  for (const expense of expenses) {
    if (!isWithinPeriod(expense.date, from, to)) continue;
    const row = rows.get(expense.employee) ?? {
      employee: expense.employee,
      totalCents: 0,
      count: 0,
    };
    row.totalCents += expense.amountCents;
    row.count += 1;
    rows.set(expense.employee, row);
  }
  return [...rows.values()].sort((a, b) => a.employee.localeCompare(b.employee));
}
