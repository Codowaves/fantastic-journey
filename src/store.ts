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

/** In-memory expense store. Every operation is async to model a real backend. */
export class ExpenseStore {
  private items = new Map<string, Expense>();
  /** Monotonic id sequence — never rewinds on delete, unlike `items.size`. */
  private issued = 0;

  async add(draft: ExpenseDraft): Promise<Expense> {
    // Claim the id synchronously: awaiting first lets overlapping adds derive
    // the same id and silently clobber each other.
    const id = deriveId(this.issued++);
    await tick();
    const expense: Expense = { id, ...draft };
    this.items.set(id, expense);
    return expense;
  }

  async list(): Promise<Expense[]> {
    await tick();
    return [...this.items.values()];
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
