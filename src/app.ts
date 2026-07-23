import express, { type Express } from 'express';
import { ExpenseStore, NotFoundError } from './store';
import { isIsoMonth, validateBudget, validateExpense } from './lib/validation';
import { budgetStatuses } from './lib/budgets';
import { monthOf } from './lib/dates';

export function createApp(store: ExpenseStore = new ExpenseStore()): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/expenses', async (_req, res) => {
    const items = await store.list();
    res.json(items);
  });

  app.post('/expenses', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const errors = validateExpense(body);
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }
    const expense = await store.add({
      employee: body.employee as string,
      category: body.category as string,
      amountCents: body.amountCents as number,
      currency: 'USD',
      date: body.date as string,
      note: typeof body.note === 'string' ? body.note : undefined,
    });
    res.status(201).json(expense);
  });

  app.get('/expenses/:id', async (req, res) => {
    try {
      const expense = await store.get(req.params.id);
      res.json(expense);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  app.delete('/expenses/:id', async (req, res) => {
    try {
      store.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  app.put('/budgets/:category', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const errors = validateBudget(req.params.category, body);
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }
    const budget = await store.setBudget(req.params.category, body.limitCents as number);
    res.json(budget);
  });

  app.get('/budgets', async (req, res) => {
    const requested = req.query.month;
    if (requested !== undefined && !isIsoMonth(requested)) {
      res.status(400).json({
        errors: [{ field: 'month', message: 'month must be a valid ISO month (YYYY-MM)' }],
      });
      return;
    }
    const month = requested ?? monthOf(new Date().toISOString());
    const [budgets, expenses] = await Promise.all([store.listBudgets(), store.list()]);
    res.json({ month, budgets: budgetStatuses(budgets, expenses, month) });
  });

  return app;
}
