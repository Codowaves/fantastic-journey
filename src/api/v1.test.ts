import { describe, it, expect } from "vitest";
import { exportOrdersAsCsv, type Order } from "./v1";

describe("exportOrdersAsCsv", () => {
  it("returns header line for empty list", () => {
    const result = exportOrdersAsCsv([]);
    expect(result).toBe("id,customerId,total,status\n");
  });

  it("escapes quotes by doubling them", () => {
    const orders: Order[] = [
      { id: 'ord_1', customerId: 'cust_"vip"', total: 10, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\nord_1,"cust_""vip""",10,pending\n');
  });

  it("escapes commas in values", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust,Inc", total: 10, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\nord_1,"cust,Inc",10,pending\n');
  });

  it("escapes newlines in values", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust\nmulti", total: 10, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\nord_1,"cust\nmulti",10,pending\n');
  });

  it("escapes carriage returns in values", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust\rmulti", total: 10, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\nord_1,"cust\rmulti",10,pending\n');
  });

  it("produces newline-terminated rows", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust_1", total: 10, status: "pending" },
      { id: "ord_2", customerId: "cust_2", total: 20, status: "confirmed" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\nord_1,cust_1,10,pending\nord_2,cust_2,20,confirmed\n"
    );
  });
});
