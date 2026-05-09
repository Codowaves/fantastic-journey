import { describe, expect, test } from "vitest";
import { exportOrdersAsCsv, type Order } from "./v1.js";

describe("exportOrdersAsCsv", () => {
  test("handles empty list", () => {
    const result = exportOrdersAsCsv([]);
    expect(result).toBe("id,customerId,total,status\n");
  });

  test("exports single order", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust_1", total: 100, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe("id,customerId,total,status\nord_1,cust_1,100,pending\n");
  });

  test("exports multiple orders", () => {
    const orders: Order[] = [
      { id: "ord_1", customerId: "cust_1", total: 100, status: "pending" },
      { id: "ord_2", customerId: "cust_2", total: 200, status: "confirmed" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
        "ord_1,cust_1,100,pending\n" +
        "ord_2,cust_2,200,confirmed\n"
    );
  });

  test("escapes commas in fields", () => {
    const orders: Order[] = [
      { id: "ord,1", customerId: "cust,2", total: 100, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\n"ord,1","cust,2",100,pending\n');
  });

  test("escapes quotes in fields", () => {
    const orders: Order[] = [
      { id: 'ord"1', customerId: 'cust"2', total: 100, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\n"ord""1","cust""2",100,pending\n');
  });

  test("escapes newlines in fields", () => {
    const orders: Order[] = [
      { id: "ord\n1", customerId: "cust\n2", total: 100, status: "pending" },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe('id,customerId,total,status\n"ord\n1","cust\n2",100,pending\n');
  });

  test("escapes mixed special characters", () => {
    const orders: Order[] = [
      {
        id: 'ord,"1"\n',
        customerId: 'customer "A, B"\nCompany',
        total: 999.99,
        status: "delivered",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      'id,customerId,total,status\n' +
        '"ord,""1""\n","customer ""A, B""\nCompany",999.99,delivered\n'
    );
  });
});
