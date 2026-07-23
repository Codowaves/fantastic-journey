import type { Budget, Expense } from '../types';
import { monthOf } from './dates';
import { sumCents } from './money';

/** Where one budgeted category stands for a single month. */
export interface BudgetStatus {
  category: string;
  limitCents: number;
  spentCents: number;
  /** Negative once spending has passed the limit. */
  remainingCents: number;
  overBudget: boolean;
}

/**
 * Status of every budgeted category for `month` (`YYYY-MM`). Spend is the gross
 * expense amount, not the reimbursable share. Pure; performs no I/O.
 */
export function budgetStatuses(
  budgets: Budget[],
  expenses: Expense[],
  month: string,
): BudgetStatus[] {
  const spentByCategory = new Map<string, number[]>();
  for (const expense of expenses) {
    if (monthOf(expense.date) !== month) continue;
    const amounts = spentByCategory.get(expense.category) ?? [];
    amounts.push(expense.amountCents);
    spentByCategory.set(expense.category, amounts);
  }

  return budgets.map(({ category, limitCents }) => {
    const spentCents = sumCents(spentByCategory.get(category) ?? []);
    return {
      category,
      limitCents,
      spentCents,
      remainingCents: limitCents - spentCents,
      overBudget: spentCents > limitCents,
    };
  });
}
