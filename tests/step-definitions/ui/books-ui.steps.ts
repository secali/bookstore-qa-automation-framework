import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { faker } from '@faker-js/faker';

Given('que el usuario accede a la vista de libros con sesión activa', async function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  expect(this.booksPage).toBeDefined();

  // Optimización SDET: Obtener token vía API y sembrarlo en localStorage para saltarse el formulario lento
  const loginRes = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
  const token = loginRes.body.token;
  this.context.token = token;

  // Inyectar en localStorage antes de cargar la SPA
  await this.page!.addInitScript((jwt) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify({ email: 'admin@sandbox.com', role: 'admin' }));
  }, token);

  await this.booksPage!.navigate();
});

Given(
  'que se ha creado previamente vía API un libro con título {string} y precio {float}',
  async function (this: CustomWorld, title: string, price: number) {
    if (!this.context.token) {
      const login = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
      this.context.token = login.body.token;
    }

    const payload = {
      title,
      author: 'Autor Híbrido SDET',
      isbn: '978' + faker.string.numeric(10),
      price,
      category: 'Architecture'
    };

    const createRes = await this.apiClient.books.createBook(payload);
    expect(createRes.status).toBe(201);
  }
);

When('busca en el catálogo el término {string}', async function (this: CustomWorld, term: string) {
  expect(this.booksPage).toBeDefined();
  await this.booksPage!.search(term);
});

When(
  'abre el modal y registra un nuevo libro con título {string}, autor {string}, isbn {string} y precio {float}',
  async function (this: CustomWorld, title: string, author: string, isbn: string, price: number) {
    expect(this.booksPage).toBeDefined();
    await this.booksPage!.openAddBookModal();
    await this.booksPage!.bookModal.fillAndSubmit({
      title,
      author,
      isbn,
      price,
      category: 'E2E Testing'
    });
  }
);

When('elimina el libro con título {string} desde la interfaz', async function (this: CustomWorld, title: string) {
  expect(this.booksPage).toBeDefined();
  await this.booksPage!.deleteBookByTitle(title);
});

Then('la tabla de libros muestra al menos {int} fila(s)', async function (this: CustomWorld, minRows: number) {
  expect(this.booksPage).toBeDefined();
  const count = await this.booksPage!.getRowCount();
  expect(count).toBeGreaterThanOrEqual(minRows);
});

Then('la tabla de libros muestra un libro con el título {string}', async function (this: CustomWorld, title: string) {
  expect(this.booksPage).toBeDefined();
  const row = this.booksPage!.getRowByTitle(title);
  await expect(row).toBeVisible({ timeout: 5000 });
});

Then('el libro con título {string} ya no aparece en la tabla', async function (this: CustomWorld, title: string) {
  expect(this.booksPage).toBeDefined();
  const row = this.booksPage!.getRowByTitle(title);
  await expect(row).not.toBeVisible({ timeout: 5000 });
});
