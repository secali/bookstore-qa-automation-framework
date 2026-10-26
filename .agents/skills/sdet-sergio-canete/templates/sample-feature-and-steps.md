# 📝 Plantilla: Feature Canónico y Step Definitions Tipados

Ejemplo completo de especificación BDD en Gherkin y su implementación en TypeScript con validación de contrato Zod.

---

## 1. Feature: `tests/features/api/02-books-crud.feature`

```gherkin
# language: es
@api @books @regression
Característica: Gestión del Catálogo de Libros (CRUD vía API REST)
  Como administrador del sistema BookStore
  Quiero operar sobre los libros mediante la API REST
  Para garantizar la integridad y disponibilidad del catálogo

  Antecedentes:
    Dado que estoy autenticado como administrador en la API

  @smoke @p1
  Escenario: Crear un libro válido y recuperarlo por su identificador
    Cuando registro un nuevo libro con los siguientes datos:
      | title                    | author               | isbn          | price | category |
      | Event-Driven Testing 101 | Sergio Cañete        | 9780132350884 | 39.99 | Tech     |
    Entonces la respuesta de la API tiene código de estado 201
    Y la respuesta cumple con el esquema de contrato de libro
    Y el libro registrado contiene el título "Event-Driven Testing 101"

  @negative @contracts
  Esquema del escenario: Validación de formato erróneo al crear libro
    Cuando intento registrar un libro con "<isbn>" y precio <price>
    Entonces la respuesta de la API tiene código de estado 400
    Y la respuesta contiene el código de error "VALIDATION_ERROR"
    Y la estructura del error cumple con el contrato estandarizado

    Ejemplos:
      | isbn             | price  |
      | formato_invalido | 19.99  |
      | 9780132350884    | -10.00 |
```

---

## 2. Step Definitions: `tests/step-definitions/api/books.steps.ts`

```typescript
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { BookSchema } from '../../../src/api/schemas/book.schema';
import { ErrorResponseSchema } from '../../../src/api/schemas/error.schema';

Given('que estoy autenticado como administrador en la API', async function (this: CustomWorld) {
  const loginRes = await this.apiClient.auth.login('admin@sandbox.com', 'admin123');
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toBeDefined();
  this.context.token = loginRes.body.token;
});

When('registro un nuevo libro con los siguientes datos:', async function (this: CustomWorld, dataTable: DataTable) {
  const data = dataTable.hashes()[0];
  await this.apiClient.books.createBook({
    title: data.title,
    author: data.author,
    isbn: data.isbn,
    price: parseFloat(data.price),
    category: data.category
  });
});

When('intento registrar un libro con {string} y precio {float}', async function (this: CustomWorld, isbn: string, price: number) {
  await this.apiClient.books.createBook({
    title: 'Libro de Prueba con Datos Inválidos',
    author: 'Autor Test',
    isbn: isbn,
    price: price
  });
});

Then('la respuesta de la API tiene código de estado {int}', function (this: CustomWorld, expectedStatus: number) {
  expect(this.context.lastResponse?.status).toBe(expectedStatus);
});

Then('la respuesta cumple con el esquema de contrato de libro', function (this: CustomWorld) {
  const validation = BookSchema.safeParse(this.context.lastResponse?.body);
  if (!validation.success) {
    throw new Error(`Fallo de contrato OpenAPI/Zod: ${JSON.stringify(validation.error.format(), null, 2)}`);
  }
  expect(validation.success).toBe(true);
});

Then('el libro registrado contiene el título {string}', function (this: CustomWorld, expectedTitle: string) {
  expect(this.context.lastResponse?.body.title).toBe(expectedTitle);
});

Then('la respuesta contiene el código de error {string}', function (this: CustomWorld, expectedCode: string) {
  expect(this.context.lastResponse?.body.code).toBe(expectedCode);
});

Then('la estructura del error cumple con el contrato estandarizado', function (this: CustomWorld) {
  const validation = ErrorResponseSchema.safeParse(this.context.lastResponse?.body);
  expect(validation.success).toBe(true);
});
```

---

## 3. Schemas Zod: `src/api/schemas/book.schema.ts` y `error.schema.ts`

```typescript
// src/api/schemas/book.schema.ts
import { z } from 'zod';

export const BookSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string(),
  price: z.number().positive(),
  category: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// src/api/schemas/error.schema.ts
export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  errors: z.record(z.string()).optional()
});
```
