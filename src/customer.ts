export interface Customer {
  id: string;
  email: string;
  displayName: string;
}

export function isValidCustomer(customer: unknown): customer is Customer {
  if (typeof customer !== "object" || customer === null) return false;
  const c = customer as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.email === "string" &&
    typeof c.displayName === "string" &&
    c.id.length > 0 &&
    c.email.length > 0 &&
    c.displayName.length > 0
  );
}