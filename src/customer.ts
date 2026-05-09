export interface Customer {
  id: string;
  email: string;
  displayName: string;
}

const customers = new Map<string, Customer>();

export function createCustomer(email: string, displayName: string): Customer {
  const customer: Customer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    email,
    displayName,
  };
  customers.set(customer.id, customer);
  return customer;
}

export function getCustomer(customerId: string): Customer | undefined {
  return customers.get(customerId);
}

export function isValidCustomerId(customerId: string): boolean {
  return customers.has(customerId);
}

export function listCustomers(): Customer[] {
  return Array.from(customers.values());
}
