import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app';

let app: Express;

beforeEach(() => {
  app = createApp();
});

const valid = {
  employee: 'Ada Lovelace',
  category: 'travel',
  amountCents: 4200,
  date: '2024-06-15',
};

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('POST /expenses', () => {
  it('creates an expense and echoes it back with an id', async () => {
    const res = await request(app).post('/expenses').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^exp_/);
    expect(res.body.employee).toBe('Ada Lovelace');
    expect(res.body.amountCents).toBe(4200);
    expect(res.body.currency).toBe('USD');
  });

  it('rejects an invalid body with 400 and field errors', async () => {
    const res = await request(app).post('/expenses').send({ employee: '', category: 'bribes' });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('GET /expenses', () => {
  it('lists created expenses', async () => {
    await request(app).post('/expenses').send(valid);
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].employee).toBe('Ada Lovelace');
  });
});

describe('GET /expenses/:id', () => {
  it('returns a single expense', async () => {
    const created = await request(app).post('/expenses').send(valid);
    const res = await request(app).get(`/expenses/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('404s for an unknown id', async () => {
    const res = await request(app).get('/expenses/exp_999');
    expect(res.status).toBe(404);
  });
});

describe('GET /expenses/report', () => {
  it('totals per employee over the inclusive range', async () => {
    await request(app)
      .post('/expenses')
      .send({ ...valid, date: '2024-06-01' });
    await request(app)
      .post('/expenses')
      .send({ ...valid, date: '2024-06-30', amountCents: 100 });
    await request(app)
      .post('/expenses')
      .send({ ...valid, date: '2024-07-01' });
    await request(app)
      .post('/expenses')
      .send({ ...valid, employee: 'Grace Hopper', date: '2024-06-15', amountCents: 900 });

    const res = await request(app).get('/expenses/report?from=2024-06-01&to=2024-06-30');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      from: '2024-06-01',
      to: '2024-06-30',
      employees: [
        { employee: 'Ada Lovelace', totalCents: 4300, count: 2 },
        { employee: 'Grace Hopper', totalCents: 900, count: 1 },
      ],
    });
  });

  it('400s on a missing or malformed date', async () => {
    const res = await request(app).get('/expenses/report?from=June&to=2024-06-30');
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: 'from', message: expect.any(String) }]);

    const missing = await request(app).get('/expenses/report');
    expect(missing.status).toBe(400);
    expect(missing.body.errors).toHaveLength(2);
  });

  it('400s when to precedes from', async () => {
    const res = await request(app).get('/expenses/report?from=2024-06-30&to=2024-06-01');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /expenses/:id', () => {
  it('removes an existing expense', async () => {
    const created = await request(app).post('/expenses').send(valid);
    const res = await request(app).delete(`/expenses/${created.body.id}`);
    expect(res.status).toBe(204);
  });
});
