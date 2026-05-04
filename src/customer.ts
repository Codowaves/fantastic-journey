export interface Customer {
  id: string;
  email: string;
  displayName: string;
}

export function createCustomer(email: string, displayName: string): Customer {
  return {
    id: `cust_${Date.now()}`,
    email: email.trim().toLowerCase(),
    displayName,
  };
}
