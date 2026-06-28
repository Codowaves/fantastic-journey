// Seed file for the Codowave test-generation scenario: shipped without tests.
export interface InventoryItem {
  sku: string;
  qty: number;
}

export function totalQuantity(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function lowStock(items: InventoryItem[], threshold = 5): InventoryItem[] {
  return items.filter((item) => item.qty < threshold);
}

export function restock(item: InventoryItem, amount: number): InventoryItem {
  return { ...item, qty: item.qty + amount };
}
