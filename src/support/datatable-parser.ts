export interface TableRowEntry {
  key: string;
  value: string;
  operator?: string;
}

/**
 * Universal DataTable parser that flexibly extracts [key/path, value/expected] pairs
 * from Cucumber DataTables, automatically detecting headers (case-insensitive) or
 * falling back to raw 2-column key-value pairs.
 */
export function parseDataTableEntries(dataTable: any): TableRowEntry[] {
  if (!dataTable) return [];
  const raw: string[][] = typeof dataTable.raw === 'function' ? dataTable.raw() : [];
  if (raw.length === 0) return [];

  // Check if first row is a header row
  const firstRow = raw[0].map((c: string) => c.trim().toLowerCase());
  const keyIdx = firstRow.findIndex(h =>
    ['jsonpath', 'path', 'field', 'campo', 'property', 'header', 'column', 'param', 'key', 'name'].includes(h)
  );
  const valIdx = firstRow.findIndex(h =>
    ['value', 'val', 'expected', 'valor', 'esperado', 'variablename', 'variable', 'text'].includes(h)
  );
  const opIdx = firstRow.findIndex(h =>
    ['operator', 'condition', 'op', 'operador'].includes(h)
  );

  if (keyIdx !== -1 && valIdx !== -1 && keyIdx !== valIdx) {
    const entries: TableRowEntry[] = [];
    for (let i = 1; i < raw.length; i++) {
      const row = raw[i];
      if (row[keyIdx] !== undefined && row[valIdx] !== undefined) {
        entries.push({
          key: row[keyIdx].trim(),
          value: row[valIdx].trim(),
          operator: opIdx !== -1 && row[opIdx] ? row[opIdx].trim() : 'equals'
        });
      }
    }
    return entries;
  }

  // Fallback: 2-column rows (or rowsHash)
  const entries: TableRowEntry[] = [];
  for (const row of raw) {
    if (row.length >= 2) {
      entries.push({
        key: row[0].trim(),
        value: row[1].trim(),
        operator: row.length >= 3 ? row[2].trim() : 'equals'
      });
    }
  }
  return entries;
}
