import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { resolveTemplate } from '../../../src/support/template-resolver';
import { getJsonPath, setJsonPath, deleteJsonPath } from '../../../src/support/jsonpath';
import { ENV } from '../../../config/env.config';

// ============================================================================
// 1. Generic Authentication Setup
// ============================================================================
const authenticateWithCredentials = async function (this: CustomWorld, rawEmail: string, rawPass: string) {
  const email = resolveTemplate(rawEmail, this);
  const password = resolveTemplate(rawPass, this);
  const res = await this.apiClient.auth.login(email, password);
  expect(res.status, `Failed to authenticate: ${JSON.stringify(res.body)}`).toBe(200);
  expect(res.body.token, 'Token was not returned in login response').toBeDefined();
  this.context.token = res.body.token;
  this.apiClient.http.setAuthToken(res.body.token!);
};
When('the user is authenticated with email {string} and password {string}', authenticateWithCredentials);
When('the user is authenticated as an admin in the API', async function (this: CustomWorld) {
  await authenticateWithCredentials.call(this, ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
});

// ============================================================================
// 2. Generic HTTP Request Dispatching (Any Method & Any Endpoint)
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
// 3. Dynamic JSON Preparation & JSONPath Mutation
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
When('the user removes JSONPath {string}', removePayloadJsonPath);

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
// 4. HTTP Headers and Authorization Management
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
// 5. Response Extraction via JSONPath (Lego Puzzle Chaining)
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

// ============================================================================
// 6. Response Validation via JSONPath
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

// ============================================================================
// 7. Generic Status Code & Header Assertions
// ============================================================================
const assertStatusCode = function (this: CustomWorld, expectedStatus: number) {
  const actualStatus = this.context.lastResponse?.status;
  expect(actualStatus, `Expected status code ${expectedStatus} but received ${actualStatus}`).toBe(expectedStatus);
};
Then('the response status code should be {int}', assertStatusCode);
Then('el código de estado de la respuesta debe ser {int}', assertStatusCode);

const assertResponseHeaderContains = function (this: CustomWorld, headerName: string, expectedSubstring: string) {
  const headers = this.context.lastResponse?.headers || {};
  const headerValue = headers[headerName.toLowerCase()] || headers[headerName] || '';
  expect(String(headerValue).toLowerCase()).toContain(expectedSubstring.toLowerCase());
};
Then('the response header {string} should contain {string}', assertResponseHeaderContains);
Then('la cabecera de respuesta {string} debe contener {string}', assertResponseHeaderContains);
