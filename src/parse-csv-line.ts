import { err, ok, type Result } from "./result";

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
 * @returns A `Result` carrying an array of field strings on success, or an
 *   `Err` describing the parse failure (e.g. an unterminated quoted field).
 *   Returns an empty array for an empty line.
 */
export function parseCsvLine(line: string): Result<string[], Error> {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

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
    } else {
      current += ch;
    }
  }

  if (inQuotes) {
    return err(new Error("parseCsvLine: unterminated quoted field"));
  }

  fields.push(current);
  return ok(fields);
}
