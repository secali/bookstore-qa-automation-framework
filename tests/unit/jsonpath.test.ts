import { getJsonPath, setJsonPath, deleteJsonPath, normalizePath } from '../../src/support/jsonpath';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running JSONPath Unit Tests ---');

// Test 1: normalizePath
assert(JSON.stringify(normalizePath('$.title')) === JSON.stringify(['title']), 'normalizePath $.title');
assert(JSON.stringify(normalizePath('data[0].id')) === JSON.stringify(['data', '0', 'id']), 'normalizePath data[0].id');
assert(
  JSON.stringify(normalizePath('items[1].name')) === JSON.stringify(['items', '1', 'name']),
  'normalizePath items[1].name'
);

// Test 2: getJsonPath
const testObj = {
  title: 'Clean Architecture',
  price: 39.99,
  author: { name: 'Robert Martin', country: 'USA' },
  tags: ['architecture', 'design'],
  nested: [{ id: 'b1' }, { id: 'b2' }]
};

assert(getJsonPath(testObj, '$.title') === 'Clean Architecture', 'get title');
assert(getJsonPath(testObj, 'author.name') === 'Robert Martin', 'get author.name');
assert(getJsonPath(testObj, '$.tags[0]') === 'architecture', 'get tags[0]');
assert(getJsonPath(testObj, '$.nested[1].id') === 'b2', 'get nested[1].id');
assert(getJsonPath(testObj, '$.nonExistent') === undefined, 'get nonExistent returns undefined');

// Test 3: setJsonPath
const target: any = {};
setJsonPath(target, '$.book.title', 'Microservices');
assert(target.book.title === 'Microservices', 'set nested title');

setJsonPath(target, '$.book.price', 45.0);
assert(target.book.price === 45.0, 'set numeric price');

setJsonPath(target, '$.items[0].name', 'First Item');
assert(Array.isArray(target.items) && target.items[0].name === 'First Item', 'set array element');

// Test 4: deleteJsonPath
deleteJsonPath(target, '$.book.price');
assert(target.book.price === undefined, 'delete property removes key');

// Test 5: Prototype Pollution Defense
let caughtPollution = false;
try {
  setJsonPath({}, '__proto__.polluted', true);
} catch (err: any) {
  caughtPollution = true;
  assert(err.message.includes('Prototype pollution blocked'), 'error contains expected message');
}
assert(caughtPollution, 'Prototype pollution attempt must be blocked');

let caughtConstructor = false;
try {
  setJsonPath({}, 'constructor.prototype.polluted', true);
} catch (err: any) {
  caughtConstructor = true;
}
assert(caughtConstructor, 'Constructor pollution attempt must be blocked');

console.log('✅ All JSONPath Unit Tests Passed Successfully!\n');
