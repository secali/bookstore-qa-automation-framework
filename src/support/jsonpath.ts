/**
 * JSON Route & Mutation Utility
 * Lightweight path extraction and mutation engine designed for BDD payload manipulation.
 *
 * SCOPE & LIMITATIONS:
 * - Supports dot-notation ("data.user.id"), array indexing ("items[0].id" or "items.0.id"),
 *   and root prefix ("$.title" or "title").
 * - Does NOT implement full RFC 9535 query filters (e.g. "[?(@.price > 10)]").
 *   For complex query filtering in enterprise production, use jsonpath-plus.
 * - Protects against prototype pollution (__proto__, constructor, prototype).
 */

const BLOCKED_PROPERTIES = new Set(['__proto__', 'constructor', 'prototype']);

export function normalizePath(path: string): string[] {
  if (!path) return [];
  let clean = path.trim();
  if (clean.startsWith('$.')) {
    clean = clean.slice(2);
  } else if (clean.startsWith('$')) {
    clean = clean.slice(1);
    if (clean.startsWith('.')) clean = clean.slice(1);
  }
  if (!clean) return [];

  // Convert array indices like [0] or ['key'] to .0 or .key
  clean = clean.replace(/\[['"]?([^'"\]]+)['"]?\]/g, '.$1');
  if (clean.startsWith('.')) clean = clean.slice(1);

  const parts = clean.split('.').filter(Boolean);
  for (const part of parts) {
    if (BLOCKED_PROPERTIES.has(part)) {
      throw new Error(`Security Exception: Prototype pollution blocked for key '${part}' in path '${path}'`);
    }
  }
  return parts;
}

export function getJsonPath(obj: any, path: string): any {
  if (obj === undefined || obj === null) return undefined;
  const parts = normalizePath(path);
  if (parts.length === 0) return obj;

  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

export function setJsonPath(obj: any, path: string, value: any): any {
  const parts = normalizePath(path);
  if (parts.length === 0) return value;

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const isNextNumber = !isNaN(Number(nextPart));

    if (current[part] === undefined || current[part] === null) {
      current[part] = isNextNumber ? [] : {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
  return obj;
}

export function deleteJsonPath(obj: any, path: string): void {
  const parts = normalizePath(path);
  if (parts.length === 0) return;

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current === undefined || current === null) return;
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  if (Array.isArray(current) && !isNaN(Number(lastPart))) {
    current.splice(Number(lastPart), 1);
  } else if (current && typeof current === 'object') {
    delete current[lastPart];
  }
}
