import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { BookSchema, BookListSchema } from '../../../src/api/schemas/book.schema';
import { ErrorResponseSchema } from '../../../src/api/schemas/error.schema';
import { AuthSuccessSchema } from '../../../src/api/schemas/auth.schema';

// Generic status code assertions (English & Spanish aliases)
const assertStatusCode = function (this: CustomWorld, expectedStatus: number) {
  const actualStatus = this.context.lastResponse?.status;
  expect(actualStatus, `Expected status code ${expectedStatus} but received ${actualStatus}`).toBe(expectedStatus);
};
Then('the API response status code should be {int}', assertStatusCode);
Then('la respuesta de la API tiene código de estado {int}', assertStatusCode);

// Generic contract validation with Zod schemas
const assertContract = function (this: CustomWorld, schemaName: string) {
  const body = this.context.lastResponse?.body;
  let validationResult: any;

  switch (schemaName.toLowerCase()) {
    case 'book':
    case 'bookresponse':
      validationResult = BookSchema.safeParse(body);
      break;
    case 'booklist':
    case 'bookslist':
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
      throw new Error(`Unknown contract schema: '${schemaName}'. Valid options: Book, BookList, Error, Auth.`);
  }

  if (!validationResult.success) {
    throw new Error(
      `OpenAPI/Zod contract violation in '${schemaName}':\n${JSON.stringify(validationResult.error.format(), null, 2)}`
    );
  }
  expect(validationResult.success).toBe(true);
};
Then('the response should match the {string} contract', assertContract);
Then('la respuesta cumple con el contrato {string}', assertContract);

// Generic error envelope validation { code, message, errors }
const assertErrorCode = function (this: CustomWorld, expectedCode: string) {
  const body = this.context.lastResponse?.body;
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
