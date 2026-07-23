// Expense id derivation.
//
// Ids are derived from a caller-owned sequence number, so the first expense is
// `exp_1`, the second `exp_2`, and so on. The sequence must only ever move
// forward — deriving it from a live count reuses ids after deletes and collides
// when two creates overlap. Kept in its own module so the id scheme can evolve
// without touching the store.
export function deriveId(sequence: number): string {
  return `exp_${sequence + 1}`;
}
