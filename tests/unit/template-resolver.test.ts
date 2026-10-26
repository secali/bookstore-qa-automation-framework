import { resolveTemplate } from '../../src/support/template-resolver';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Template Resolver Unit Tests ---');

// Test 1: Random ISBN generation
const isbn = resolveTemplate('{{random_isbn}}');
assert(isbn.startsWith('978') && isbn.length === 13, `Valid ISBN format: ${isbn}`);

// Test 2: Random Email generation
const email = resolveTemplate('{{random_email}}');
assert(email.includes('@') && email === email.toLowerCase(), `Valid email format: ${email}`);

// Test 3: Resolving stored data from mock world context
const mockWorld: any = {
  context: {
    token: 'jwt-mock-token-xyz',
    createdBookIds: ['id-100', 'id-200'],
    storedData: {
      customAlias: 'ResolvedValue123',
      bookPrice: '49.99'
    }
  }
};

assert(resolveTemplate('{{token}}', mockWorld) === 'jwt-mock-token-xyz', 'resolve {{token}}');
assert(resolveTemplate('{{lastId}}', mockWorld) === 'id-200', 'resolve {{lastId}}');
assert(
  resolveTemplate('Value is {{customAlias}}', mockWorld) === 'Value is ResolvedValue123',
  'resolve {{customAlias}}'
);

// Test 4: Fail-fast on undefined variables
let caughtUndefined = false;
try {
  resolveTemplate('{{unregisteredVariable}}', mockWorld);
} catch (err: any) {
  caughtUndefined = true;
  assert(err.message.includes('Unresolved template variable'), 'throws clear error for unknown variable');
}
assert(caughtUndefined, 'Undefined variable must throw an explicit error');

console.log('✅ All Template Resolver Unit Tests Passed Successfully!\n');
