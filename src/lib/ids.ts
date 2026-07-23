// Expense id derivation.
//
// Ids are derived from how many expenses already exist, so the first expense
// is `exp_1`, the second `exp_2`, and so on. Kept in its own module so the id
// scheme can evolve without touching the store.
export function deriveId(existingCount: number): string {
  return `exp_${existingCount + 1}`;
}
