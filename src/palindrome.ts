export function isPalindrome(str: string): boolean {
  // Normalize: remove spaces and punctuation, keep alphanumeric, convert to lowercase
  const normalized = str.replace(/[^a-z0-9]/gi, "").toLowerCase();

  // Compare with reverse
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}
