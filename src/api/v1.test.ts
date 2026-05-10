import { describe, it, expect } from "vitest";
import { exportOrdersAsCsv, type Order } from "./v1.js";

describe("exportOrdersAsCsv", () => {
  it("returns only headers for empty list", () => {
    const result = exportOrdersAsCsv([]);
    expect(result).toBe("id,customerId,total,status\n");
  });

  it("exports single order with basic data", () => {
    const orders: Order[] = [
      {
        id: "ord_123",
        customerId: "cust_456",
        total: 99.99,
        status: "pending",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      "ord_123,cust_456,99.99,pending\n"
    );
  });

  it("exports multiple orders", () => {
    const orders: Order[] = [
      {
        id: "ord_1",
        customerId: "cust_1",
        total: 10.50,
        status: "confirmed",
      },
      {
        id: "ord_2",
        customerId: "cust_2",
        total: 25.00,
        status: "shipped",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      "ord_1,cust_1,10.5,confirmed\n" +
      "ord_2,cust_2,25,shipped\n"
    );
  });

  it("escapes fields containing commas", () => {
    const orders: Order[] = [
      {
        id: "ord_123,456",
        customerId: "cust_789",
        total: 50,
        status: "pending",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      '"ord_123,456",cust_789,50,pending\n'
    );
  });

  it("escapes fields containing quotes", () => {
    const orders: Order[] = [
      {
        id: 'ord_"special"',
        customerId: "cust_123",
        total: 75,
        status: "confirmed",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      '"ord_""special""",cust_123,75,confirmed\n'
    );
  });

  it("escapes fields containing newlines", () => {
    const orders: Order[] = [
      {
        id: "ord_123\n456",
        customerId: "cust_789",
        total: 100,
        status: "delivered",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      '"ord_123\n456",cust_789,100,delivered\n'
    );
  });

  it("handles multiple special characters in one field", () => {
    const orders: Order[] = [
      {
        id: 'ord_"test",value\nnewline',
        customerId: "cust_123",
        total: 200,
        status: "pending",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      '"ord_""test"",value\nnewline",cust_123,200,pending\n'
    );
  });

  it("handles special characters in customerId field", () => {
    const orders: Order[] = [
      {
        id: "ord_123",
        customerId: 'customer, "special"',
        total: 150,
        status: "shipped",
      },
    ];
    const result = exportOrdersAsCsv(orders);
    expect(result).toBe(
      "id,customerId,total,status\n" +
      'ord_123,"customer, ""special""",150,shipped\n'
    );
  });
});
