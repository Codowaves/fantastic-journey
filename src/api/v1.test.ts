import { describe, expect, it } from "vitest";
import { exportOrdersAsCsv } from "./v1.js";

describe("exportOrdersAsCsv", () => {
  it("returns headers only for empty list", () => {
    const result = exportOrdersAsCsv([]);
    expect(result).toBe("id,customerId,total,status\n");
  });

  it("escapes special characters in fields", () => {
    const result = exportOrdersAsCsv([
      {
        id: 'ord_1',
        customerId: 'cust"with,quote',
        total: 10.5,
        status: "pending",
      },
    ]);
    expect(result).toBe('id,customerId,total,status\n"ord_1","cust""with,quote","10.5","pending"\n');
  });
});