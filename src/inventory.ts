// Seed file for the Codowave test-generation scenario: shipped without tests.
/** Inventory record identified by stock keeping unit and quantity on hand. */
export interface InventoryItem {
  /** Stock keeping unit used to identify the item. */
  sku: string;
  /** Quantity currently available in inventory. */
  qty: number;
}

/** Calculates the total quantity across inventory items. */
export function totalQuantity(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Finds inventory items below the low-stock threshold.
 *
 * @param threshold - Exclusive quantity cutoff for low-stock items.
 */
export function lowStock(
  items: InventoryItem[],
  threshold = 5,
): InventoryItem[] {
  return items.filter((item) => item.qty < threshold);
}

/**
 * Returns an updated inventory item with additional quantity added.
 *
 * @param amount - Quantity to add to the item's current stock.
 */
export function restock(item: InventoryItem, amount: number): InventoryItem {
  return { ...item, qty: item.qty + amount };
}
