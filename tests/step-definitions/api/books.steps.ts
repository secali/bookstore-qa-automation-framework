import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { faker } from '@faker-js/faker';

// Request all books
const getAllBooks = async function (this: CustomWorld) {
  await this.apiClient.books.getAllBooks();
};
When('the user requests all books from the API', getAllBooks);
When('solicito el listado completo de libros a la API', getAllBooks);

// Search books
const searchBooks = async function (this: CustomWorld, term: string) {
  await this.apiClient.books.getAllBooks({ search: term });
};
When('the user searches books in the API with term {string}', searchBooks);
When('busco libros en la API con el término {string}', searchBooks);

// Create book from DataTable
const createBookFromDataTable = async function (this: CustomWorld, dataTable: DataTable) {
  const row = dataTable.hashes()[0];
  const payload = {
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    price: parseFloat(row.price),
    category: row.category
  };
  this.context.storedData['lastBookPayload'] = payload;
  await this.apiClient.books.createBook(payload);
};
Given('a new book is created via API with the following data:', createBookFromDataTable);
When('the user creates a new book via API with the following data:', createBookFromDataTable);
Given('que registro un nuevo libro con los siguientes datos:', createBookFromDataTable);
When('registro un nuevo libro con los siguientes datos:', createBookFromDataTable);

// Create random book
const createRandomBook = async function (this: CustomWorld) {
  const payload = {
    title: `SDET Book ${faker.commerce.productName()} ${faker.string.alphanumeric(5)}`,
    author: faker.person.fullName(),
    isbn: '978' + faker.string.numeric(10),
    price: parseFloat(faker.commerce.price({ min: 10, max: 150 })),
    category: 'Architecture'
  };
  this.context.storedData['lastBookPayload'] = payload;
  await this.apiClient.books.createBook(payload);
};
Given('a book is created via API with random valid data', createRandomBook);
When('the user creates a book via API with random valid data', createRandomBook);
Given('que registro un libro con datos válidos aleatorios', createRandomBook);
When('registro un libro con datos válidos aleatorios', createRandomBook);

// Create book with specific ISBN and price (supports positive and negative)
const createBookWithIsbnAndPrice = async function (this: CustomWorld, isbn: string, priceStr: string) {
  await this.apiClient.books.createBook({
    title: 'Invalid Data Test Book',
    author: 'Test Author',
    isbn: isbn,
    price: parseFloat(priceStr),
    category: 'Testing'
  });
};
When(
  /^the user attempts to create a book with isbn "([^"]*)" and price (-?\d+(?:\.\d+)?)$/,
  createBookWithIsbnAndPrice
);
When(/^intento registrar un libro con "([^"]*)" y precio (-?\d+(?:\.\d+)?)$/, createBookWithIsbnAndPrice);

// Create book without auth
const createBookWithoutAuth = async function (this: CustomWorld) {
  await this.apiClient.books.createBook(
    {
      title: 'Unauthorized Book',
      author: 'Anonymous',
      isbn: '9788424115549',
      price: 25.0
    },
    ''
  );
};
When('the user attempts to create a book without authentication token', createBookWithoutAuth);
When('intento registrar un libro sin token de autenticación', createBookWithoutAuth);

// Get book by newly created ID
const getBookByCreatedId = async function (this: CustomWorld) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId, 'No created book ID was found in the scenario context').toBeDefined();
  await this.apiClient.books.getBookById(bookId);
};
When('the user retrieves the book by its newly created id', getBookByCreatedId);
When('consulto el libro por su identificador recién creado', getBookByCreatedId);

// Get non-existent book
const getNonExistentBook = async function (this: CustomWorld, id: string) {
  await this.apiClient.books.getBookById(id);
};
When('the user retrieves a book with non-existent id {string}', getNonExistentBook);
When('consulto un libro con identificador inexistente {string}', getNonExistentBook);

// Update book price
const updateBookPrice = async function (this: CustomWorld, newPrice: number) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId).toBeDefined();
  await this.apiClient.books.updateBook(bookId, { price: newPrice });
};
When('the user updates the price of the newly created book to {float}', updateBookPrice);
When('actualizo el precio del libro recién creado a {float}', updateBookPrice);

// Delete newly created book
const deleteCreatedBook = async function (this: CustomWorld) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId).toBeDefined();
  await this.apiClient.books.deleteBook(bookId);
};
When('the user deletes the newly created book', deleteCreatedBook);
When('elimino el libro recién creado', deleteCreatedBook);

// Retry deleting deleted book
const retryDeletingBook = async function (this: CustomWorld) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId).toBeDefined();
  await this.apiClient.books.deleteBook(bookId);
};
When('the user attempts to delete the same already deleted book', retryDeletingBook);
When('reintento eliminar el mismo libro recién borrado', retryDeletingBook);

// Assertions on books list
const assertBooksListCount = function (this: CustomWorld, minCount: number) {
  const body = this.context.lastResponse?.body;
  const list = Array.isArray(body) ? body : body?.data || [];
  expect(list.length).toBeGreaterThanOrEqual(minCount);
};
Then('the books list should contain at least {int} book(s)', assertBooksListCount);
Then('the books list should contain at least {int} book\\(s\\)', assertBooksListCount);
Then('la lista de libros contiene al menos {int} libro(s)', assertBooksListCount);

// Assert book title
const assertBookTitle = function (this: CustomWorld, expectedTitle: string) {
  const body = this.context.lastResponse?.body;
  expect(body?.title).toBe(expectedTitle);
};
Then('the created book should have the title {string}', assertBookTitle);
Then('el libro registrado contiene el título {string}', assertBookTitle);

// Assert payload fidelity
const assertBookPayloadFidelity = function (this: CustomWorld) {
  const body = this.context.lastResponse?.body;
  const sent = this.context.storedData['lastBookPayload'];
  expect(body?.title).toBe(sent.title);
  expect(body?.author).toBe(sent.author);
  expect(body?.isbn).toBe(sent.isbn);
  expect(Number(body?.price)).toBe(sent.price);
};
Then('the created book should match the submitted payload', assertBookPayloadFidelity);
Then('el libro registrado contiene los datos enviados', assertBookPayloadFidelity);

// Assert book price
const assertBookPrice = function (this: CustomWorld, expectedPrice: number) {
  const body = this.context.lastResponse?.body;
  expect(Number(body?.price)).toBe(expectedPrice);
};
Then('the retrieved book price should be {float}', assertBookPrice);
Then('el precio del libro obtenido es {float}', assertBookPrice);
