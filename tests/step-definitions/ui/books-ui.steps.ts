import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { faker } from '@faker-js/faker';

// Access books dashboard with preloaded API session
const accessBooksWithSession = async function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  expect(this.booksPage).toBeDefined();

  const loginRes = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
  const token = loginRes.body.token;
  this.context.token = token;

  await this.page!.addInitScript((jwt) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify({ email: 'admin@sandbox.com', role: 'admin' }));
  }, token);

  await this.booksPage!.navigate();
};
Given('the user accesses the books dashboard with an active authenticated session', accessBooksWithSession);
Given('que el usuario accede a la vista de libros con sesión activa', accessBooksWithSession);

// Pre-create book via API for hybrid verification
const precreateBookViaApi = async function (this: CustomWorld, title: string, price: number) {
  if (!this.context.token) {
    const login = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
    this.context.token = login.body.token;
  }

  const payload = {
    title,
    author: 'SDET Hybrid Author',
    isbn: '978' + faker.string.numeric(10),
    price,
    category: 'Architecture'
  };

  const createRes = await this.apiClient.books.createBook(payload);
  expect(createRes.status).toBe(201);
};
Given('a book has been previously created via API with title {string} and price {float}', precreateBookViaApi);
Given('que se ha creado previamente vía API un libro con título {string} y precio {float}', precreateBookViaApi);

// Search in catalog
const searchCatalog = async function (this: CustomWorld, term: string) {
  expect(this.booksPage).toBeDefined();
  await this.booksPage!.search(term);
};
When('the user searches the catalog for {string}', searchCatalog);
When('busca en el catálogo el término {string}', searchCatalog);

// Create book via modal
const createBookViaModal = async function (
  this: CustomWorld,
  title: string,
  author: string,
  isbn: string,
  price: number
) {
  expect(this.booksPage).toBeDefined();
  await this.booksPage!.openAddBookModal();
  await this.booksPage!.bookModal.fillAndSubmit({
    title,
    author,
    isbn,
    price,
    category: 'E2E Testing'
  });
};
When(
  'the user opens the modal and registers a new book with title {string}, author {string}, isbn {string} and price {float}',
  createBookViaModal
);
When(
  'abre el modal y registra un nuevo libro con título {string}, autor {string}, isbn {string} y precio {float}',
  createBookViaModal
);

// Delete book via UI
const deleteBookViaUi = async function (this: CustomWorld, title: string) {
  expect(this.booksPage).toBeDefined();
  await this.booksPage!.deleteBookByTitle(title);
};
When('the user deletes the book titled {string} from the interface', deleteBookViaUi);
When('elimina el libro con título {string} desde la interfaz', deleteBookViaUi);

// Table rows assertion
const assertTableMinRows = async function (this: CustomWorld, minRows: number) {
  expect(this.booksPage).toBeDefined();
  const count = await this.booksPage!.getRowCount();
  expect(count).toBeGreaterThanOrEqual(minRows);
};
Then('the books table should display at least {int} row(s)', assertTableMinRows);
Then('the books table should display at least {int} row\\(s\\)', assertTableMinRows);
Then('la tabla de libros muestra al menos {int} fila(s)', assertTableMinRows);

// Table row visible
const assertTableRowVisible = async function (this: CustomWorld, title: string) {
  expect(this.booksPage).toBeDefined();
  const row = this.booksPage!.getRowByTitle(title);
  await expect(row).toBeVisible({ timeout: 5000 });
};
Then('the books table should display a book with title {string}', assertTableRowVisible);
Then('la tabla de libros muestra un libro con el título {string}', assertTableRowVisible);

// Table row not visible
const assertTableRowNotVisible = async function (this: CustomWorld, title: string) {
  expect(this.booksPage).toBeDefined();
  const row = this.booksPage!.getRowByTitle(title);
  await expect(row).not.toBeVisible({ timeout: 5000 });
};
Then('the book titled {string} should no longer appear in the table', assertTableRowNotVisible);
Then('el libro con título {string} ya no aparece en la tabla', assertTableRowNotVisible);
