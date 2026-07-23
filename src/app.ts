import express, { type Express } from 'express';
import { ExpenseStore, NotFoundError } from './store';
import { validateExpense } from './lib/validation';

export function createApp(store: ExpenseStore = new ExpenseStore()): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/expenses', async (req, res) => {
    const { category, employee } = req.query;
    const items = await store.list({
      category: typeof category === 'string' ? category : undefined,
      employee: typeof employee === 'string' ? employee : undefined,
    });
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

  return app;
}
