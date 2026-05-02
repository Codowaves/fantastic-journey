import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function timingSafeCompare(
  a: string,
  b: string
): Promise<boolean> {
  return bcrypt.compare(a, b);
}

export async function authenticate(
  token: string,
  storedHash: string
): Promise<boolean> {
  return timingSafeCompare(token, storedHash);
}
