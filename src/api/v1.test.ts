import { describe, it, expect } from "vitest";
import { exportOrdersAsCsv } from "./v1";
import type { Order } from "./v1";

describe("exportOrdersAsCsv", () => {
  it("returns header row for empty list", () => {
    const result = exportOrdersAsCsv([]);
    expect(result).toBe("id,customerId,total,status\n");
  });

  it("escapes double quotes by doubling them", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: 'cust"one', total: 100, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      'id,customerId,total,status\n"ord_1","cust""one","100","pending"\n',
    );
  });

  it("escapes commas and newlines in values", () => {
    const orders: Order[] = [
      { id: "a,b", customerId: "c\nd", total: 1, status: "confirmed" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      'id,customerId,total,status\n"a,b","c\nd","1","confirmed"\n',
    );
  });

  it("terminates with newline", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust_1", total: 50, status: "shipped" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result.endsWith("\n")).toBe(true);
  });
});
