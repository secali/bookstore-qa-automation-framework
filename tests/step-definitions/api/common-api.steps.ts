import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { BookSchema, BookListSchema } from '../../../src/api/schemas/book.schema';
import { ErrorResponseSchema } from '../../../src/api/schemas/error.schema';
import { AuthSuccessSchema } from '../../../src/api/schemas/auth.schema';

// Verificación genérica y parametrizable de códigos de respuesta HTTP
Then('la respuesta de la API tiene código de estado {int}', function (this: CustomWorld, expectedStatus: number) {
  const actualStatus = this.context.lastResponse?.status;
  expect(actualStatus, `Código de estado esperado ${expectedStatus} pero se obtuvo ${actualStatus}`).toBe(
    expectedStatus
  );
});

// Verificación genérica de contratos contra esquemas Zod
Then('la respuesta cumple con el contrato {string}', function (this: CustomWorld, schemaName: string) {
  const body = this.context.lastResponse?.body;
  let validationResult: any;

  switch (schemaName.toLowerCase()) {
    case 'book':
    case 'bookresponse':
      validationResult = BookSchema.safeParse(body);
      break;
    case 'booklist':
    case 'listadelibros':
      validationResult = BookListSchema.safeParse(body);
      break;
    case 'error':
    case 'errorresponse':
      validationResult = ErrorResponseSchema.safeParse(body);
      break;
    case 'auth':
    case 'authresponse':
      validationResult = AuthSuccessSchema.safeParse(body);
      break;
    default:
      throw new Error(`Contrato desconocido: ${schemaName}. Opciones válidas: Book, BookList, Error, Auth.`);
  }

  if (!validationResult.success) {
    throw new Error(
      `Fallo de contrato OpenAPI/Zod en '${schemaName}':\n${JSON.stringify(validationResult.error.format(), null, 2)}`
    );
  }
  expect(validationResult.success).toBe(true);
});

// Verificación genérica de errores estándar envelope { code, message, errors }
Then('la respuesta contiene el código de error {string}', function (this: CustomWorld, expectedCode: string) {
  const body = this.context.lastResponse?.body;
  expect(body?.code, `Se esperaba código de error '${expectedCode}' pero se obtuvo '${body?.code}'`).toBe(expectedCode);
});

Then('el detalle del error indica fallo en el campo {string}', function (this: CustomWorld, fieldName: string) {
  const errors = this.context.lastResponse?.body?.errors;
  expect(errors, 'El objeto de errores no está presente en la respuesta').toBeDefined();
  expect(errors[fieldName], `Se esperaba detalle de error para el campo '${fieldName}'`).toBeDefined();
});

Then('la respuesta contiene el campo {string}', function (this: CustomWorld, fieldPath: string) {
  const body = this.context.lastResponse?.body;
  expect(body?.[fieldPath], `El campo '${fieldPath}' no está presente en la respuesta`).toBeDefined();
});
