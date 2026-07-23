import { describe, it, expect } from 'vitest';
import { reportByEmployee } from '../src/lib/report';
import type { Expense } from '../src/types';

const expense = (id: string, employee: string, date: string, amountCents: number): Expense => ({
  id,
  employee,
  category: 'travel',
  amountCents,
  currency: 'USD',
  date,
});

const items: Expense[] = [
  expense('exp_1', 'Ada', '2024-06-01', 1000),
  expense('exp_2', 'Ada', '2024-06-30', 250),
  expense('exp_3', 'Grace', '2024-06-15', 4200),
  expense('exp_4', 'Ada', '2024-05-31', 999),
  expense('exp_5', 'Grace', '2024-07-01', 777),
];

describe('reportByEmployee', () => {
  it('totals and counts per employee within the range', () => {
    expect(reportByEmployee(items, '2024-06-01', '2024-06-30')).toEqual([
      { employee: 'Ada', totalCents: 1250, count: 2 },
      { employee: 'Grace', totalCents: 4200, count: 1 },
    ]);
  });

  it('includes both range endpoints and excludes the days either side', () => {
    expect(reportByEmployee(items, '2024-05-31', '2024-06-01')).toEqual([
      { employee: 'Ada', totalCents: 1999, count: 2 },
    ]);
    expect(reportByEmployee(items, '2024-06-02', '2024-06-29')).toEqual([
      { employee: 'Grace', totalCents: 4200, count: 1 },
    ]);
  });

  it('returns an empty report when nothing falls in the range', () => {
    expect(reportByEmployee(items, '2023-01-01', '2023-12-31')).toEqual([]);
  });
});
