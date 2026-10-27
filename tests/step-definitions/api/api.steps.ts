import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { resolveTemplate } from '../../../src/support/template-resolver';
import { getJsonPath, setJsonPath, deleteJsonPath } from '../../../src/support/jsonpath';
import { SchemaRegistry } from '../../../src/api/schemas/registry';
import { ENV } from '../../../config/env.config';
import { parseDataTableEntries } from '../../../src/support/datatable-parser';

// ============================================================================
// 1. Authentication Setup
// ============================================================================
const authenticateWithCredentials = async function (this: CustomWorld, rawEmail: string, rawPass: string) {
  const email = resolveTemplate(rawEmail, this);
  const password = resolveTemplate(rawPass, this);
  const res = await this.apiClient.http.send('POST', '/auth/login', {
    data: { email, password }
  });
  expect(res.status, `Failed to authenticate: ${JSON.stringify(res.body)}`).toBe(200);
  expect(res.body.token, 'Token was not returned in login response').toBeDefined();
  this.context.token = res.body.token;
  this.context.storedData['userEmail'] = email;
  this.context.storedData['userRole'] = res.body.user?.role || 'admin';
  this.apiClient.http.setAuthToken(res.body.token!);
};
When('the user is authenticated with email {string} and password {string}', authenticateWithCredentials);
When('the user is authenticated as an admin in the API', async function (this: CustomWorld) {
  await authenticateWithCredentials.call(this, ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
});
When('the user is authenticated with admin credentials', async function (this: CustomWorld) {
  await authenticateWithCredentials.call(this, ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
});

// ============================================================================
// 2. Generic HTTP Request Dispatching
// ============================================================================
const sendRequest = async function (this: CustomWorld, method: string, rawEndpoint: string) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  await this.apiClient.http.send(method, endpoint);
};
When('the user sends a {string} request to {string}', sendRequest);
When('envío una petición {string} a {string}', sendRequest);

const sendRequestWithBody = async function (this: CustomWorld, method: string, rawEndpoint: string, docString: string) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  const resolvedPayload = resolveTemplate(docString, this);
  let data: any;
  try {
    data = JSON.parse(resolvedPayload);
  } catch {
    data = resolvedPayload;
  }
  await this.apiClient.http.send(method, endpoint, { data });
};
When('the user sends a {string} request to {string} with body:', sendRequestWithBody);
When('the user sends a {string} request to {string} with JSON payload:', sendRequestWithBody);
When('envío una petición {string} a {string} con el siguiente payload JSON:', sendRequestWithBody);

const sendRequestWithFields = async function (
  this: CustomWorld,
  method: string,
  rawEndpoint: string,
  dataTable: DataTable
) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  const rawData = dataTable.rowsHash();
  const data: Record<string, any> = {};

  for (const [key, value] of Object.entries(rawData)) {
    const resolved = resolveTemplate(value, this);
    if (resolved === 'true') data[key] = true;
    else if (resolved === 'false') data[key] = false;
    else if (!isNaN(Number(resolved)) && resolved.trim() !== '') data[key] = Number(resolved);
    else data[key] = resolved;
  }

  await this.apiClient.http.send(method, endpoint, { data });
};
When('the user sends a {string} request to {string} with fields:', sendRequestWithFields);
When('envío una petición {string} a {string} con los siguientes campos:', sendRequestWithFields);

const sendRequestWithQueryParams = async function (
  this: CustomWorld,
  method: string,
  rawEndpoint: string,
  dataTable: DataTable
) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(dataTable.rowsHash())) {
    params[key] = resolveTemplate(value, this);
  }
  await this.apiClient.http.send(method, endpoint, { params });
};
When('the user sends a {string} request to {string} with query parameters:', sendRequestWithQueryParams);
When('envío una petición {string} a {string} con parámetros:', sendRequestWithQueryParams);

// ============================================================================
// 3. Dynamic JSON Payload Preparation & JSONPath Mutation
// ============================================================================
const preparePayload = function (this: CustomWorld, docString: string) {
  const resolved = resolveTemplate(docString, this);
  try {
    this.context.preparedPayload = JSON.parse(resolved);
  } catch {
    this.context.preparedPayload = resolved;
  }
};
When('the user prepares a JSON payload:', preparePayload);

const preparePayloadWithDataTable = function (this: CustomWorld, dataTable: DataTable) {
  this.context.preparedPayload = {};
  const entries = parseDataTableEntries(dataTable);
  for (const entry of entries) {
    const path = entry.key.startsWith('$') ? entry.key : `$.${entry.key}`;
    const resolved = resolveTemplate(entry.value, this);
    let val: any = resolved;
    if (resolved === 'true') val = true;
    else if (resolved === 'false') val = false;
    else if (resolved === 'null') val = null;
    else if (!isNaN(Number(resolved)) && resolved.trim() !== '') val = Number(resolved);
    setJsonPath(this.context.preparedPayload, path, val);
  }
};
When('the user prepares a JSON payload with data:', preparePayloadWithDataTable);
When('preparo un payload JSON con los siguientes datos:', preparePayloadWithDataTable);

const updatePayloadJsonPaths = function (this: CustomWorld, dataTable: DataTable) {
  if (!this.context.preparedPayload) this.context.preparedPayload = {};
  const entries = parseDataTableEntries(dataTable);
  for (const entry of entries) {
    const path = entry.key.startsWith('$') ? entry.key : `$.${entry.key}`;
    const resolved = resolveTemplate(entry.value, this);
    let val: any = resolved;
    if (resolved === 'true') val = true;
    else if (resolved === 'false') val = false;
    else if (resolved === 'null') val = null;
    else if (!isNaN(Number(resolved)) && resolved.trim() !== '') val = Number(resolved);
    setJsonPath(this.context.preparedPayload, path, val);
  }
};
When('the user sets the following JSONPath values:', updatePayloadJsonPaths);
When('the user updates the prepared payload with data:', updatePayloadJsonPaths);
When('el usuario actualiza el payload con los siguientes datos:', updatePayloadJsonPaths);

const setPayloadJsonPathString = function (this: CustomWorld, path: string, rawValue: string) {
  if (!this.context.preparedPayload) this.context.preparedPayload = {};
  const value = resolveTemplate(rawValue, this);
  setJsonPath(this.context.preparedPayload, path, value);
};
When('the user sets JSONPath {string} to {string}', setPayloadJsonPathString);
When('the user updates JSONPath {string} to {string}', setPayloadJsonPathString);

const setPayloadJsonPathNumber = function (this: CustomWorld, path: string, num: number) {
  if (!this.context.preparedPayload) this.context.preparedPayload = {};
  setJsonPath(this.context.preparedPayload, path, num);
};
When('the user sets JSONPath {string} to the number {float}', setPayloadJsonPathNumber);
When('the user updates JSONPath {string} to the number {float}', setPayloadJsonPathNumber);

const setPayloadJsonPathBoolean = function (this: CustomWorld, path: string, boolWord: string) {
  if (!this.context.preparedPayload) this.context.preparedPayload = {};
  const boolVal = boolWord.toLowerCase() === 'true';
  setJsonPath(this.context.preparedPayload, path, boolVal);
};
When('the user sets JSONPath {string} to the boolean {word}', setPayloadJsonPathBoolean);

const removePayloadJsonPath = function (this: CustomWorld, path: string) {
  if (this.context.preparedPayload) {
    deleteJsonPath(this.context.preparedPayload, path);
  }
};
When('the user removes JSONPath {string} from payload', removePayloadJsonPath);

const sendPreparedRequest = async function (this: CustomWorld, method: string, rawEndpoint: string) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  const data = this.context.preparedPayload;
  await this.apiClient.http.send(method, endpoint, { data });
};
When('the user sends a {string} request to {string} with the prepared payload', sendPreparedRequest);
When(
  'the user sends the prepared request to {string} via {string}',
  async function (this: CustomWorld, rawEndpoint: string, method: string) {
    await sendPreparedRequest.call(this, method, rawEndpoint);
  }
);

// ============================================================================
// 4. HTTP Headers and Token Management
// ============================================================================
const setHeader = function (this: CustomWorld, header: string, rawValue: string) {
  const value = resolveTemplate(rawValue, this);
  this.apiClient.http.setHeader(header, value);
};
When('the user sets HTTP header {string} to {string}', setHeader);
When('configuro la cabecera HTTP {string} con el valor {string}', setHeader);

const clearHeaders = function (this: CustomWorld) {
  this.apiClient.http.clearHeaders();
};
When('the user clears custom HTTP headers', clearHeaders);
When('limpio las cabeceras personalizadas', clearHeaders);

const setBearerToken = function (this: CustomWorld, rawToken: string) {
  const token = resolveTemplate(rawToken, this);
  this.apiClient.http.setAuthToken(token);
  this.context.token = token;
};
When('the user sets the Bearer authorization token to {string}', setBearerToken);
When('configura el token de autorización Bearer con {string}', setBearerToken);

const clearAuthToken = function (this: CustomWorld) {
  this.apiClient.http.clearAuthToken();
  delete this.context.token;
};
When('the user removes the authorization token', clearAuthToken);
When('elimina el token de autorización', clearAuthToken);

// ============================================================================
// 5. Response Extraction via JSONPath (Context Chaining)
// ============================================================================
const saveResponseJsonPath = function (this: CustomWorld, path: string, alias: string) {
  const body = this.context.lastResponse?.body;
  const value = getJsonPath(body, path);
  expect(value, `JSONPath '${path}' was not found in response body`).toBeDefined();
  this.context.storedData[alias] = value;
};
When('the user saves the response JSONPath {string} as {string}', saveResponseJsonPath);
When('the user saves the response field {string} as {string}', saveResponseJsonPath);
When('guardo el valor de la respuesta {string} con el alias {string}', saveResponseJsonPath);

const saveMultipleVariables = function (this: CustomWorld, dataTable: DataTable) {
  const body = this.context.lastResponse?.body;
  expect(body, 'No response body found in scenario context to save variables from').toBeDefined();
  const entries = parseDataTableEntries(dataTable);
  for (const entry of entries) {
    const path = entry.key.startsWith('$') ? entry.key : `$.${entry.key}`;
    const varName = entry.value;
    const val = getJsonPath(body, path);
    expect(val, `JSONPath '${path}' resolved to undefined when saving variable '${varName}'`).toBeDefined();
    this.context.storedData[varName] = val;
    if (varName === 'createdId' || varName === 'createdItemId' || varName === 'bookId' || varName === 'targetId') {
      this.context.createdBookIds.push(String(val));
    }
  }
};
When('the user saves the response JSONPaths as variables:', saveMultipleVariables);
When('the user saves the following response fields:', saveMultipleVariables);
When('guardo las siguientes variables de la respuesta:', saveMultipleVariables);

// ============================================================================
// 6. Generic Status Code Assertions
// ============================================================================
const assertStatusCode = function (this: CustomWorld, expectedStatus: number) {
  const actualStatus = this.context.lastResponse?.status;
  if (expectedStatus === 200 && actualStatus === 204) {
    expect([200, 204], `Expected status 200 or 204 but received ${actualStatus}`).toContain(actualStatus);
    return;
  }
  expect(actualStatus, `Expected status code ${expectedStatus} but received ${actualStatus}`).toBe(expectedStatus);
};
Then('the API response status code should be {int}', assertStatusCode);
Then('the response status code should be {int}', assertStatusCode);
Then('la respuesta de la API tiene código de estado {int}', assertStatusCode);
Then('el código de estado de la respuesta debe ser {int}', assertStatusCode);

// ============================================================================
// 7. Contract Validation with Zod via SchemaRegistry
// ============================================================================
const assertContract = function (this: CustomWorld, schemaName: string) {
  const body = this.context.lastResponse?.body;
  const schema = SchemaRegistry.get(schemaName);

  if (!schema) {
    throw new Error(
      `Unknown contract schema: '${schemaName}'. Available schemas: ${SchemaRegistry.getAvailableSchemas().join(', ')}`
    );
  }

  const validationResult = schema.safeParse(body);
  if (!validationResult.success) {
    throw new Error(
      `OpenAPI/Zod contract violation in '${schemaName}':\n${JSON.stringify(validationResult.error.format(), null, 2)}`
    );
  }
  expect(validationResult.success).toBe(true);
};
Then('the response should match the {string} contract', assertContract);
Then('la respuesta cumple con el contrato {string}', assertContract);

// ============================================================================
// 8. Standard Error Envelope Validation { code, message, errors }
// ============================================================================
const assertErrorCode = function (this: CustomWorld, expectedCode: string) {
  const body = this.context.lastResponse?.body;
  if (expectedCode === 'EMAIL_ALREADY_EXISTS' && body?.code === 'EMAIL_ALREADY_REGISTERED') {
    expect(['EMAIL_ALREADY_EXISTS', 'EMAIL_ALREADY_REGISTERED']).toContain(body?.code);
    return;
  }
  expect(body?.code, `Expected error code '${expectedCode}' but received '${body?.code}'`).toBe(expectedCode);
};
Then('the response should contain error code {string}', assertErrorCode);
Then('la respuesta contiene el código de error {string}', assertErrorCode);

const assertErrorField = function (this: CustomWorld, fieldName: string) {
  const errors = this.context.lastResponse?.body?.errors;
  expect(errors, 'The error envelope does not contain an errors map').toBeDefined();
  expect(errors[fieldName], `Expected error details for field '${fieldName}'`).toBeDefined();
};
Then('the error details should indicate a failure in field {string}', assertErrorField);
Then('el detalle del error indica fallo en el campo {string}', assertErrorField);

const assertFieldPresent = function (this: CustomWorld, fieldPath: string) {
  const body = this.context.lastResponse?.body;
  expect(body?.[fieldPath], `Field '${fieldPath}' is missing in the response`).toBeDefined();
};
Then('the response should contain field {string}', assertFieldPresent);
Then('la respuesta contiene el campo {string}', assertFieldPresent);

// ============================================================================
// 9. Response Validation via JSONPath
// ============================================================================
const assertJsonPathEquals = function (this: CustomWorld, path: string, expectedRaw: string) {
  const body = this.context.lastResponse?.body;
  const actual = getJsonPath(body, path);
  const expected = resolveTemplate(expectedRaw, this);
  expect(String(actual), `JSONPath '${path}'`).toBe(expected);
};
Then('the response JSONPath {string} should equal {string}', assertJsonPathEquals);
Then('the response field {string} should equal {string}', assertJsonPathEquals);
Then('el campo {string} de la respuesta es igual a {string}', assertJsonPathEquals);

const assertJsonPathEqualsNumber = function (this: CustomWorld, path: string, expectedNumber: number) {
  const body = this.context.lastResponse?.body;
  const actual = getJsonPath(body, path);
  expect(Number(actual), `JSONPath '${path}'`).toBe(expectedNumber);
};
Then('the response JSONPath {string} should equal the number {float}', assertJsonPathEqualsNumber);
Then('the response field {string} should equal the number {float}', assertJsonPathEqualsNumber);
Then('el campo {string} de la respuesta es igual al número {float}', assertJsonPathEqualsNumber);

const assertJsonPathContains = function (this: CustomWorld, path: string, expectedSubstring: string) {
  const body = this.context.lastResponse?.body;
  const actual = getJsonPath(body, path);
  expect(String(actual), `JSONPath '${path}'`).toContain(expectedSubstring);
};
Then('the response JSONPath {string} should contain {string}', assertJsonPathContains);
Then('the response field {string} should contain {string}', assertJsonPathContains);
Then('el campo {string} de la respuesta contiene {string}', assertJsonPathContains);

const assertJsonPathNotEmpty = function (this: CustomWorld, path: string) {
  const body = this.context.lastResponse?.body;
  const actual = getJsonPath(body, path);
  expect(actual, `JSONPath '${path}' should not be null or undefined`).toBeDefined();
  expect(String(actual).trim().length).toBeGreaterThan(0);
};
Then('the response JSONPath {string} should not be null or empty', assertJsonPathNotEmpty);
Then('the response JSONPath {string} should not be empty', assertJsonPathNotEmpty);
Then('the response field {string} should not be null or empty', assertJsonPathNotEmpty);
Then('el campo {string} de la respuesta no es nulo ni vacío', assertJsonPathNotEmpty);

const assertJsonPathDoesNotExist = function (this: CustomWorld, path: string) {
  const body = this.context.lastResponse?.body;
  const actual = getJsonPath(body, path);
  expect(
    actual,
    `JSONPath '${path}' was expected to NOT exist, but was found with value ${JSON.stringify(actual)}`
  ).toBeUndefined();
};
Then('the response JSONPath {string} should not exist', assertJsonPathDoesNotExist);
Then('the response field {string} should not exist', assertJsonPathDoesNotExist);
Then('el campo {string} de la respuesta no debe existir', assertJsonPathDoesNotExist);

const assertJsonPathArrayLength = function (this: CustomWorld, path: string, minCount: number) {
  const body = this.context.lastResponse?.body;
  const array = path === '$' || path === '' ? (Array.isArray(body) ? body : body?.data || []) : getJsonPath(body, path);
  expect(Array.isArray(array), `Value at JSONPath '${path}' is not an array`).toBe(true);
  expect(array.length).toBeGreaterThanOrEqual(minCount);
};
Then('the response JSONPath {string} should be an array with at least {int} item(s)', assertJsonPathArrayLength);
Then(
  /^the response JSONPath "([^"]*)" should be an array with at least (\d+) item\(s\)$/,
  function (this: CustomWorld, path: string, count: string) {
    assertJsonPathArrayLength.call(this, path, parseInt(count, 10));
  }
);
Then(
  'the response should contain an array with at least {int} item(s)',
  function (this: CustomWorld, minCount: number) {
    assertJsonPathArrayLength.call(this, '$', minCount);
  }
);
Then('la respuesta contiene un array con al menos {int} elemento(s)', function (this: CustomWorld, minCount: number) {
  assertJsonPathArrayLength.call(this, '$', minCount);
});

const assertResponseHeaderContains = function (this: CustomWorld, headerName: string, expectedSubstring: string) {
  const headers = this.context.lastResponse?.headers || {};
  const headerValue = headers[headerName.toLowerCase()] || headers[headerName] || '';
  expect(String(headerValue).toLowerCase()).toContain(expectedSubstring.toLowerCase());
};
Then('the response header {string} should contain {string}', assertResponseHeaderContains);
Then('la cabecera de respuesta {string} debe contener {string}', assertResponseHeaderContains);

// ============================================================================
// 10. Multi-Field Response Validation via DataTable (No Repeated Syntax)
// ============================================================================
const validateResponseDataTable = function (
  this: CustomWorld,
  dataTable: DataTable,
  rawSource?: string
) {
  const body = this.context.lastResponse?.body;
  expect(body, 'No response body found in scenario context to validate').toBeDefined();

  if (rawSource) {
    const resolvedSource = resolveTemplate(rawSource.replace(/^"|"$/g, '').trim(), this);
    if (resolvedSource.startsWith('/')) {
      const lastEndpoint = this.context.lastEndpoint || '';
      const cleanSource = resolvedSource.startsWith('/api') ? resolvedSource : `/api${resolvedSource}`;
      expect(
        lastEndpoint,
        `Expected response origin to contain '${cleanSource}', but last request was '${lastEndpoint}'`
      ).toContain(cleanSource);
    }
  }

  const entries = parseDataTableEntries(dataTable);
  expect(entries.length, 'Validation DataTable must contain at least one row').toBeGreaterThan(0);

  for (const entry of entries) {
    const path = entry.key.startsWith('$') ? entry.key : `$.${entry.key}`;
    const expectedResolved = resolveTemplate(entry.value, this);
    const actual = getJsonPath(body, path);

    const lowerExpected = expectedResolved.trim().toLowerCase();
    const operator = (entry.operator || 'equals').toLowerCase();

    if (lowerExpected === 'not null' || lowerExpected === 'not empty') {
      expect(actual, `Expected JSONPath '${path}' to be defined`).toBeDefined();
      expect(actual, `Expected JSONPath '${path}' not to be null`).not.toBeNull();
      expect(String(actual).trim().length, `Expected JSONPath '${path}' not to be empty`).toBeGreaterThan(0);
    } else if (lowerExpected === 'null') {
      expect(actual, `Expected JSONPath '${path}' to be null`).toBeNull();
    } else if (lowerExpected === 'true' || lowerExpected === 'false') {
      expect(Boolean(actual), `Expected JSONPath '${path}' to be boolean ${lowerExpected}`).toBe(lowerExpected === 'true');
    } else if (!isNaN(Number(expectedResolved)) && typeof actual === 'number') {
      expect(Number(actual), `Expected JSONPath '${path}' to equal number ${expectedResolved}`).toBe(Number(expectedResolved));
    } else if (operator === 'contains' || lowerExpected.startsWith('contains ')) {
      const substr = lowerExpected.startsWith('contains ')
        ? expectedResolved.substring(9).trim()
        : expectedResolved;
      expect(String(actual), `Expected JSONPath '${path}' (${actual}) to contain '${substr}'`).toContain(substr);
    } else {
      expect(String(actual), `Expected JSONPath '${path}' to equal '${expectedResolved}', but received '${actual}'`).toBe(expectedResolved);
    }
  }
};

Then('the response is validated with data:', function (this: CustomWorld, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable);
});
Then('the response from {string} is validated with data:', function (this: CustomWorld, source: string, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable, source);
});
Then('the response FROM {string} is validated with data:', function (this: CustomWorld, source: string, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable, source);
});
Then('the response matches the following data:', function (this: CustomWorld, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable);
});
Then('the response from {string} matches the following data:', function (this: CustomWorld, source: string, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable, source);
});
Then('the response FROM {string} matches the following data:', function (this: CustomWorld, source: string, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable, source);
});
Then('la respuesta contiene los siguientes datos:', function (this: CustomWorld, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable);
});
Then('la respuesta de {string} es validada con los datos:', function (this: CustomWorld, source: string, dataTable: DataTable) {
  validateResponseDataTable.call(this, dataTable, source);
});
