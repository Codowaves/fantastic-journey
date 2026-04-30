export interface Customer {
  id: string;
  email: string;
  displayName: string;
}

const customerStore = new Map<string, Customer>();

export function registerCustomer(customer: Customer): void {
  customerStore.set(customer.id, customer);
}

export function getCustomer(id: string): Customer | undefined {
  return customerStore.get(id);
}

export function isValidCustomerId(id: string): boolean {
  return customerStore.has(id);
}