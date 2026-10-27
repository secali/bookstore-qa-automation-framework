import { parseDataTableEntries } from '../../src/support/datatable-parser';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running DataTable Parser Unit Tests ---');

// Test 1: Column headers (jsonPath | Value)
const tableWithHeaders = {
  raw: () => [
    ['jsonPath', 'Value'],
    ['$.title', 'Clean Architecture'],
    ['$.price', '39.99']
  ]
};
const res1 = parseDataTableEntries(tableWithHeaders);
assert(res1.length === 2, 'Parse table with headers length');
assert(res1[0].key === '$.title' && res1[0].value === 'Clean Architecture', 'Parse row 1');
assert(res1[1].key === '$.price' && res1[1].value === '39.99', 'Parse row 2');

// Test 2: Column headers with 3 columns (jsonPath | operator | Value)
const tableWithOp = {
  raw: () => [
    ['jsonPath', 'operator', 'Value'],
    ['$.title', 'contains', 'Architecture'],
    ['$.price', 'equals', '39.99']
  ]
};
const res2 = parseDataTableEntries(tableWithOp);
assert(res2.length === 2, 'Parse table with operator length');
assert(res2[0].operator === 'contains', 'Row 1 operator');
assert(res2[1].operator === 'equals', 'Row 2 operator');

// Test 3: Raw 2-column key-value pairs without headers
const tableRawPairs = {
  raw: () => [
    ['$.title', 'Domain-Driven Design'],
    ['$.author', 'Eric Evans']
  ]
};
const res3 = parseDataTableEntries(tableRawPairs);
assert(res3.length === 2, 'Parse raw 2-column table length');
assert(res3[0].key === '$.title' && res3[0].value === 'Domain-Driven Design', 'Parse raw row 1');
assert(res3[1].key === '$.author' && res3[1].value === 'Eric Evans', 'Parse raw row 2');

// Test 4: UI field headers (field | value)
const tableUIFields = {
  raw: () => [
    ['field', 'value'],
    ['email', 'admin@sandbox.com'],
    ['password', 'admin123']
  ]
};
const res4 = parseDataTableEntries(tableUIFields);
assert(res4.length === 2, 'Parse UI fields table length');
assert(res4[0].key === 'email' && res4[0].value === 'admin@sandbox.com', 'Parse email field');

console.log('✅ All DataTable Parser Unit Tests Passed successfully!');
