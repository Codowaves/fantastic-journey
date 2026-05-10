export interface Customer {
  id: string;
  email: string;
  displayName: string;
}

export function createCustomer(email: string, displayName: string): Customer {
  if (!email || !displayName) {
    throw new Error("Email and displayName are required");
  }
  return {
    id: `cust_${Date.now()}`,
    email,
    displayName,
  };
}

export function isValidCustomerId(customerId: string): boolean {
  return typeof customerId === "string" && customerId.startsWith("cust_");
}
