import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { faker } from '@faker-js/faker';

When('solicito el listado completo de libros a la API', async function (this: CustomWorld) {
  await this.apiClient.books.getAllBooks();
});

When('busco libros en la API con el término {string}', async function (this: CustomWorld, term: string) {
  await this.apiClient.books.getAllBooks({ search: term });
});

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

Given('que registro un nuevo libro con los siguientes datos:', createBookFromDataTable);
When('registro un nuevo libro con los siguientes datos:', createBookFromDataTable);

const createRandomBook = async function (this: CustomWorld) {
  const payload = {
    title: `Libro SDET ${faker.commerce.productName()} ${faker.string.alphanumeric(5)}`,
    author: faker.person.fullName(),
    isbn: '978' + faker.string.numeric(10),
    price: parseFloat(faker.commerce.price({ min: 10, max: 150 })),
    category: 'Architecture'
  };
  this.context.storedData['lastBookPayload'] = payload;
  await this.apiClient.books.createBook(payload);
};

Given('que registro un libro con datos válidos aleatorios', createRandomBook);
When('registro un libro con datos válidos aleatorios', createRandomBook);

// Usamos expresión regular para admitir tanto precios positivos como negativos y números enteros o con decimales
When(
  /^intento registrar un libro con "([^"]*)" y precio (-?\d+(?:\.\d+)?)$/,
  async function (this: CustomWorld, isbn: string, priceStr: string) {
    await this.apiClient.books.createBook({
      title: 'Libro con Datos Inválidos',
      author: 'Autor Temporal',
      isbn: isbn,
      price: parseFloat(priceStr),
      category: 'Testing'
    });
  }
);

When('intento registrar un libro sin token de autenticación', async function (this: CustomWorld) {
  await this.apiClient.books.createBook(
    {
      title: 'Libro Sin Autorización',
      author: 'Anónimo',
      isbn: '9788424115549',
      price: 25.0
    },
    ''
  );
});

When('consulto el libro por su identificador recién creado', async function (this: CustomWorld) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId, 'No hay ID de libro creado en el contexto del escenario').toBeDefined();
  await this.apiClient.books.getBookById(bookId);
});

When('consulto un libro con identificador inexistente {string}', async function (this: CustomWorld, id: string) {
  await this.apiClient.books.getBookById(id);
});

When('actualizo el precio del libro recién creado a {float}', async function (this: CustomWorld, newPrice: number) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId).toBeDefined();
  await this.apiClient.books.updateBook(bookId, { price: newPrice });
});

When('elimino el libro recién creado', async function (this: CustomWorld) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId).toBeDefined();
  await this.apiClient.books.deleteBook(bookId);
});

When('reintento eliminar el mismo libro recién borrado', async function (this: CustomWorld) {
  const bookId = this.context.createdBookIds[this.context.createdBookIds.length - 1];
  expect(bookId).toBeDefined();
  await this.apiClient.books.deleteBook(bookId);
});

Then('la lista de libros contiene al menos {int} libro(s)', function (this: CustomWorld, minCount: number) {
  const body = this.context.lastResponse?.body;
  const list = Array.isArray(body) ? body : body?.data || [];
  expect(list.length).toBeGreaterThanOrEqual(minCount);
});

Then('el libro registrado contiene el título {string}', function (this: CustomWorld, expectedTitle: string) {
  const body = this.context.lastResponse?.body;
  expect(body?.title).toBe(expectedTitle);
});

Then('el libro registrado contiene los datos enviados', function (this: CustomWorld) {
  const body = this.context.lastResponse?.body;
  const sent = this.context.storedData['lastBookPayload'];
  expect(body?.title).toBe(sent.title);
  expect(body?.author).toBe(sent.author);
  expect(body?.isbn).toBe(sent.isbn);
  expect(Number(body?.price)).toBe(sent.price);
});

Then('el precio del libro obtenido es {float}', function (this: CustomWorld, expectedPrice: number) {
  const body = this.context.lastResponse?.body;
  expect(Number(body?.price)).toBe(expectedPrice);
});
