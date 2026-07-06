/**
 * Parses a single line of CSV (Comma-Separated Values) into an array of field
 * strings, respecting double-quoted fields that may contain commas.
 *
 * Quoting rules (per RFC 4180):
 * - A field may optionally be wrapped in double quotes (`"`).
 * - Inside a quoted field, a literal double quote is represented by two
 *   consecutive double quotes (`""`).
 * - Commas inside a quoted field are treated as literal characters and do not
 *   split the field.
 * - Fields are separated by commas.
 *
 * @param line - A single line of CSV text (no trailing newline).
 * @returns An array of field strings. Returns an empty array for an empty line.
 * @throws {Error} If the line ends while a quoted field is still open.
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteStart = -1;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === ",") {
      fields.push(current);
      current = "";
    } else if (ch === '"' && current.length === 0) {
      inQuotes = true;
      quoteStart = i;
    } else {
      current += ch;
    }
  }

  if (inQuotes) {
    const column = quoteStart >= 0 ? quoteStart : 0;
    const preview = line.length > 40 ? `${line.slice(0, 40)}...` : line;
    throw new Error(
      `parseCsvLine: unterminated quoted field at column ${column} in "${preview}"`,
    );
  }

  fields.push(current);
  return fields;
}
