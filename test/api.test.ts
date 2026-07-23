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

  describe('filtering', () => {
    const grace = { ...valid, employee: 'Grace Hopper', category: 'meals' };
    const adaMeals = { ...valid, category: 'meals' };

    beforeEach(async () => {
      await request(app).post('/expenses').send(valid); // Ada / travel
      await request(app).post('/expenses').send(adaMeals); // Ada / meals
      await request(app).post('/expenses').send(grace); // Grace / meals
    });

    it('filters by category', async () => {
      const res = await request(app).get('/expenses?category=meals');
      expect(res.status).toBe(200);
      expect(res.body.map((e: { category: string }) => e.category)).toEqual(['meals', 'meals']);
    });

    it('filters by employee', async () => {
      const res = await request(app).get('/expenses?employee=Grace%20Hopper');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].employee).toBe('Grace Hopper');
    });

    it('ANDs both filters', async () => {
      const res = await request(app).get('/expenses?employee=Ada%20Lovelace&category=meals');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].employee).toBe('Ada Lovelace');
      expect(res.body[0].category).toBe('meals');
    });

    it('returns everything with no filter', async () => {
      const res = await request(app).get('/expenses');
      expect(res.body).toHaveLength(3);
    });

    it('returns nothing when nothing matches', async () => {
      const res = await request(app).get('/expenses?category=lodging');
      expect(res.body).toEqual([]);
    });
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
