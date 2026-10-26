import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { resolveTemplate, getNestedProperty } from '../../../src/support/template-resolver';

// 1. Generic HTTP Request Sending
const sendRequest = async function (this: CustomWorld, method: string, rawEndpoint: string) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  await this.apiClient.http.send(method, endpoint);
};
When('the user sends a {string} request to {string}', sendRequest);
When('envío una petición {string} a {string}', sendRequest);

const sendRequestWithJson = async function (this: CustomWorld, method: string, rawEndpoint: string, docString: string) {
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
When('the user sends a {string} request to {string} with JSON payload:', sendRequestWithJson);
When('envío una petición {string} a {string} con el siguiente payload JSON:', sendRequestWithJson);

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

// 2. HTTP Headers Management
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

// 3. Response Variable Extraction (Chainable Puzzle Pieces)
const saveResponseField = function (this: CustomWorld, path: string, alias: string) {
  const body = this.context.lastResponse?.body;
  const value = getNestedProperty(body, path);
  expect(value, `Property '${path}' was not found in the response body`).toBeDefined();
  this.context.storedData[alias] = value;
};
When('the user saves the response field {string} as {string}', saveResponseField);
When('guardo el valor de la respuesta {string} con el alias {string}', saveResponseField);

// 4. Atomic JSON Assertions
const assertFieldEquals = function (this: CustomWorld, path: string, expectedRaw: string) {
  const body = this.context.lastResponse?.body;
  const actual = getNestedProperty(body, path);
  const expected = resolveTemplate(expectedRaw, this);
  expect(String(actual), `Field '${path}'`).toBe(expected);
};
Then('the response field {string} should equal {string}', assertFieldEquals);
Then('el campo {string} de la respuesta es igual a {string}', assertFieldEquals);

const assertFieldEqualsNumber = function (this: CustomWorld, path: string, expectedNumber: number) {
  const body = this.context.lastResponse?.body;
  const actual = getNestedProperty(body, path);
  expect(Number(actual), `Field '${path}'`).toBe(expectedNumber);
};
Then('the response field {string} should equal the number {float}', assertFieldEqualsNumber);
Then('el campo {string} de la respuesta es igual al número {float}', assertFieldEqualsNumber);

const assertFieldContains = function (this: CustomWorld, path: string, expectedSubstring: string) {
  const body = this.context.lastResponse?.body;
  const actual = getNestedProperty(body, path);
  expect(String(actual), `Field '${path}'`).toContain(expectedSubstring);
};
Then('the response field {string} should contain {string}', assertFieldContains);
Then('el campo {string} de la respuesta contiene {string}', assertFieldContains);

const assertFieldNotEmpty = function (this: CustomWorld, path: string) {
  const body = this.context.lastResponse?.body;
  const actual = getNestedProperty(body, path);
  expect(actual, `Field '${path}' should not be null or undefined`).toBeDefined();
  expect(String(actual).trim().length).toBeGreaterThan(0);
};
Then('the response field {string} should not be null or empty', assertFieldNotEmpty);
Then('el campo {string} de la respuesta no es nulo ni vacío', assertFieldNotEmpty);

const assertResponseArrayLength = function (this: CustomWorld, minCount: number) {
  const body = this.context.lastResponse?.body;
  const array = Array.isArray(body) ? body : body?.data || [];
  expect(Array.isArray(array), 'The response or body.data is not an array').toBe(true);
  expect(array.length).toBeGreaterThanOrEqual(minCount);
};
Then('the response should contain an array with at least {int} item(s)', assertResponseArrayLength);
Then('la respuesta contiene un array con al menos {int} elemento(s)', assertResponseArrayLength);
