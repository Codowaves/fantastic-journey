import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app';
import { budgetStatuses } from '../src/lib/budgets';
import { validateBudget } from '../src/lib/validation';
import type { Expense } from '../src/types';

const expense = (over: Partial<Expense>): Expense => ({
  id: 'exp_1',
  employee: 'Ada Lovelace',
  category: 'travel',
  amountCents: 4200,
  currency: 'USD',
  date: '2024-06-15',
  ...over,
});

describe('budgetStatuses', () => {
  const budgets = [{ category: 'travel', limitCents: 10_000 }];

  it('sums only the requested month and category', () => {
    const [status] = budgetStatuses(
      budgets,
      [
        expense({ id: 'exp_1', amountCents: 3000, date: '2024-06-01' }),
        expense({ id: 'exp_2', amountCents: 1500, date: '2024-06-30' }),
        expense({ id: 'exp_3', amountCents: 9999, date: '2024-07-01' }), // other month
        expense({ id: 'exp_4', amountCents: 8888, category: 'meals' }), // other category
      ],
      '2024-06',
    );
    expect(status.spentCents).toBe(4500);
    expect(status.remainingCents).toBe(5500);
    expect(status.overBudget).toBe(false);
  });

  it('reports overspend with a negative remainder', () => {
    const [status] = budgetStatuses(budgets, [expense({ amountCents: 12_500 })], '2024-06');
    expect(status.spentCents).toBe(12_500);
    expect(status.remainingCents).toBe(-2500);
    expect(status.overBudget).toBe(true);
  });

  it('treats spending exactly at the limit as within budget', () => {
    const [status] = budgetStatuses(budgets, [expense({ amountCents: 10_000 })], '2024-06');
    expect(status.remainingCents).toBe(0);
    expect(status.overBudget).toBe(false);
  });

  it('reports zero spend for a budgeted category with no expenses', () => {
    expect(budgetStatuses(budgets, [], '2024-06')).toEqual([
      {
        category: 'travel',
        limitCents: 10_000,
        spentCents: 0,
        remainingCents: 10_000,
        overBudget: false,
      },
    ]);
  });
});

describe('validateBudget', () => {
  const fields = (category: unknown, body: Record<string, unknown>): string[] =>
    validateBudget(category, body).map((e) => e.field);

  it('accepts a known category and an integer limit', () => {
    expect(validateBudget('travel', { limitCents: 50_000 })).toEqual([]);
  });

  it('rejects an unknown category', () => {
    expect(fields('bribes', { limitCents: 1 })).toContain('category');
  });

  it('rejects a missing, non-integer or negative limit', () => {
    expect(fields('travel', {})).toContain('limitCents');
    expect(fields('travel', { limitCents: 10.5 })).toContain('limitCents');
    expect(fields('travel', { limitCents: -1 })).toContain('limitCents');
  });
});

describe('budget endpoints', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  const spend = (amountCents: number, over: Record<string, unknown> = {}) =>
    request(app)
      .post('/expenses')
      .send({
        employee: 'Ada Lovelace',
        category: 'travel',
        amountCents,
        date: '2024-06-15',
        ...over,
      });

  it('sets a budget for a category', async () => {
    const res = await request(app).put('/budgets/travel').send({ limitCents: 100_000 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ category: 'travel', limitCents: 100_000 });
  });

  it('overwrites an existing budget rather than duplicating it', async () => {
    await request(app).put('/budgets/travel').send({ limitCents: 100_000 });
    await request(app).put('/budgets/travel').send({ limitCents: 25_000 });
    const res = await request(app).get('/budgets').query({ month: '2024-06' });
    expect(res.body.budgets).toHaveLength(1);
    expect(res.body.budgets[0].limitCents).toBe(25_000);
  });

  it('rejects an unknown category or a bad limit with 400', async () => {
    expect((await request(app).put('/budgets/bribes').send({ limitCents: 1 })).status).toBe(400);
    expect((await request(app).put('/budgets/travel').send({ limitCents: 'lots' })).status).toBe(
      400,
    );
  });

  it('reports status for the requested month only', async () => {
    await request(app).put('/budgets/travel').send({ limitCents: 100_000 });
    await spend(30_000, { date: '2024-06-02' });
    await spend(100_001, { date: '2024-07-02' });

    const june = await request(app).get('/budgets').query({ month: '2024-06' });
    expect(june.status).toBe(200);
    expect(june.body.month).toBe('2024-06');
    expect(june.body.budgets).toEqual([
      {
        category: 'travel',
        limitCents: 100_000,
        spentCents: 30_000,
        remainingCents: 70_000,
        overBudget: false,
      },
    ]);

    const july = await request(app).get('/budgets').query({ month: '2024-07' });
    expect(july.body.budgets[0]).toMatchObject({
      spentCents: 100_001,
      remainingCents: -1,
      overBudget: true,
    });
  });

  it('lists only budgeted categories', async () => {
    await request(app).put('/budgets/travel').send({ limitCents: 100_000 });
    await spend(5000, { category: 'meals' });
    const res = await request(app).get('/budgets').query({ month: '2024-06' });
    expect(res.body.budgets.map((b: { category: string }) => b.category)).toEqual(['travel']);
  });

  it('defaults to the current month when none is given', async () => {
    await request(app).put('/budgets/travel').send({ limitCents: 100_000 });
    const today = new Date().toISOString().slice(0, 10);
    await spend(1234, { date: today });

    const res = await request(app).get('/budgets');
    expect(res.status).toBe(200);
    expect(res.body.month).toBe(today.slice(0, 7));
    expect(res.body.budgets[0].spentCents).toBe(1234);
  });

  it('rejects a malformed month with 400', async () => {
    const res = await request(app).get('/budgets').query({ month: '2024-13' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('month');
  });
});
