import type { Expense } from './types';
import { deriveId } from './lib/ids';

export class NotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`expense ${id} not found`);
    this.name = 'NotFoundError';
  }
}

/** Yield to the event loop, standing in for async persistence I/O. */
const tick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

/** Fields the store fills in for a new expense (everything but the id). */
export type ExpenseDraft = Omit<Expense, 'id'>;

/**
 * Optional filters for {@link ExpenseStore.list}. Omitted fields match
 * everything; supplied fields AND together.
 */
export interface ExpenseFilter {
  category?: string;
  employee?: string;
}

/** In-memory expense store. Every operation is async to model a real backend. */
export class ExpenseStore {
  private items = new Map<string, Expense>();

  async add(draft: ExpenseDraft): Promise<Expense> {
    const id = deriveId(this.items.size);
    await tick();
    const expense: Expense = { id, ...draft };
    this.items.set(id, expense);
    return expense;
  }

  async list(filter: ExpenseFilter = {}): Promise<Expense[]> {
    await tick();
    // ponytail: exact match, not case-insensitive or partial — add if asked.
    return [...this.items.values()].filter(
      (e) =>
        (filter.category === undefined || e.category === filter.category) &&
        (filter.employee === undefined || e.employee === filter.employee),
    );
  }

  async get(id: string): Promise<Expense> {
    await tick();
    const found = this.items.get(id);
    if (!found) throw new NotFoundError(id);
    return found;
  }

  async remove(id: string): Promise<void> {
    await tick();
    if (!this.items.has(id)) throw new NotFoundError(id);
    this.items.delete(id);
  }

  async clear(): Promise<void> {
    await tick();
    this.items.clear();
  }
}
