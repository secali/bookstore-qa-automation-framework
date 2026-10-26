import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { resolveTemplate, getNestedProperty } from '../../../src/support/template-resolver';

// 1. Envío genérico de peticiones HTTP
When('envío una petición {string} a {string}', async function (this: CustomWorld, method: string, rawEndpoint: string) {
  const endpoint = resolveTemplate(rawEndpoint, this);
  await this.apiClient.http.send(method, endpoint);
});

When(
  'envío una petición {string} a {string} con el siguiente payload JSON:',
  async function (this: CustomWorld, method: string, rawEndpoint: string, docString: string) {
    const endpoint = resolveTemplate(rawEndpoint, this);
    const resolvedPayload = resolveTemplate(docString, this);
    let data: any;
    try {
      data = JSON.parse(resolvedPayload);
    } catch {
      data = resolvedPayload;
    }
    await this.apiClient.http.send(method, endpoint, { data });
  }
);

When(
  'envío una petición {string} a {string} con los siguientes campos:',
  async function (this: CustomWorld, method: string, rawEndpoint: string, dataTable: DataTable) {
    const endpoint = resolveTemplate(rawEndpoint, this);
    const rawData = dataTable.rowsHash();
    const data: Record<string, any> = {};

    for (const [key, value] of Object.entries(rawData)) {
      const resolved = resolveTemplate(value, this);
      // Intentar parsear tipos numéricos o booleanos si aplica
      if (resolved === 'true') data[key] = true;
      else if (resolved === 'false') data[key] = false;
      else if (!isNaN(Number(resolved)) && resolved.trim() !== '') data[key] = Number(resolved);
      else data[key] = resolved;
    }

    await this.apiClient.http.send(method, endpoint, { data });
  }
);

When(
  'envío una petición {string} a {string} con parámetros:',
  async function (this: CustomWorld, method: string, rawEndpoint: string, dataTable: DataTable) {
    const endpoint = resolveTemplate(rawEndpoint, this);
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(dataTable.rowsHash())) {
      params[key] = resolveTemplate(value, this);
    }
    await this.apiClient.http.send(method, endpoint, { params });
  }
);

// 2. Gestión de cabeceras HTTP dinámicas
When(
  'configuro la cabecera HTTP {string} con el valor {string}',
  function (this: CustomWorld, header: string, rawValue: string) {
    const value = resolveTemplate(rawValue, this);
    this.apiClient.http.setHeader(header, value);
  }
);

When('limpio las cabeceras personalizadas', function (this: CustomWorld) {
  this.apiClient.http.clearHeaders();
});

// 3. Captura de variables en contexto (Legos encadenables)
When(
  'guardo el valor de la respuesta {string} con el alias {string}',
  function (this: CustomWorld, path: string, alias: string) {
    const body = this.context.lastResponse?.body;
    const value = getNestedProperty(body, path);
    expect(value, `No se encontró la propiedad '${path}' en la respuesta`).toBeDefined();
    this.context.storedData[alias] = value;
  }
);

// 4. Aserciones atómicas sobre cualquier campo de la respuesta JSON
Then(
  'el campo {string} de la respuesta es igual a {string}',
  function (this: CustomWorld, path: string, expectedRaw: string) {
    const body = this.context.lastResponse?.body;
    const actual = getNestedProperty(body, path);
    const expected = resolveTemplate(expectedRaw, this);
    expect(String(actual), `Campo '${path}'`).toBe(expected);
  }
);

Then(
  'el campo {string} de la respuesta es igual al número {float}',
  function (this: CustomWorld, path: string, expectedNumber: number) {
    const body = this.context.lastResponse?.body;
    const actual = getNestedProperty(body, path);
    expect(Number(actual), `Campo '${path}'`).toBe(expectedNumber);
  }
);

Then(
  'el campo {string} de la respuesta contiene {string}',
  function (this: CustomWorld, path: string, expectedSubstring: string) {
    const body = this.context.lastResponse?.body;
    const actual = getNestedProperty(body, path);
    expect(String(actual), `Campo '${path}'`).toContain(expectedSubstring);
  }
);

Then('el campo {string} de la respuesta no es nulo ni vacío', function (this: CustomWorld, path: string) {
  const body = this.context.lastResponse?.body;
  const actual = getNestedProperty(body, path);
  expect(actual, `El campo '${path}' no debería ser nulo ni indefinido`).toBeDefined();
  expect(String(actual).trim().length).toBeGreaterThan(0);
});

Then('la respuesta contiene un array con al menos {int} elemento(s)', function (this: CustomWorld, minCount: number) {
  const body = this.context.lastResponse?.body;
  const array = Array.isArray(body) ? body : body?.data || [];
  expect(Array.isArray(array), 'La respuesta o body.data no es un array').toBe(true);
  expect(array.length).toBeGreaterThanOrEqual(minCount);
});
