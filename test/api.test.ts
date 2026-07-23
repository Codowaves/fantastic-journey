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

  it('keeps every expense when creates overlap', async () => {
    const posts = Array.from({ length: 5 }, (_, i) =>
      request(app)
        .post('/expenses')
        .send({ ...valid, amountCents: 100 * (i + 1) }),
    );
    const created = await Promise.all(posts);
    expect(created.map((r) => r.status)).toEqual([201, 201, 201, 201, 201]);
    expect(new Set(created.map((r) => r.body.id)).size).toBe(5);

    const list = await request(app).get('/expenses');
    expect(list.body).toHaveLength(5);
    expect(
      list.body.reduce((sum: number, e: { amountCents: number }) => sum + e.amountCents, 0),
    ).toBe(1500);
  });

  it('does not reuse an id after a delete', async () => {
    const first = await request(app).post('/expenses').send(valid);
    await request(app).delete(`/expenses/${first.body.id}`);
    const second = await request(app).post('/expenses').send(valid);
    expect(second.body.id).not.toBe(first.body.id);
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

describe('DELETE /expenses/:id', () => {
  it('removes an existing expense', async () => {
    const created = await request(app).post('/expenses').send(valid);
    const res = await request(app).delete(`/expenses/${created.body.id}`);
    expect(res.status).toBe(204);
  });
});
