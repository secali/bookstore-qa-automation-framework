import { Given, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { faker } from '@faker-js/faker';

Given('que estoy autenticado como administrador en la API', async function (this: CustomWorld) {
  const loginRes = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
  expect(loginRes.status, `No se pudo autenticar como admin: ${JSON.stringify(loginRes.body)}`).toBe(200);
  expect(loginRes.body.token, 'El token no fue devuelto en la respuesta de login').toBeDefined();
  this.context.token = loginRes.body.token;
});

When(
  'inicio sesión en la API con el email {string} y la contraseña {string}',
  async function (this: CustomWorld, email: string, pass: string) {
    await this.apiClient.auth.login(email, pass);
  }
);

When('inicio sesión en la API con credenciales válidas de administrador', async function (this: CustomWorld) {
  await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
});

When(
  'registro un nuevo usuario con nombre {string}, email {string} y contraseña {string}',
  async function (this: CustomWorld, name: string, email: string, pass: string) {
    await this.apiClient.auth.register(name, email, pass);
  }
);

const registerRandomUser = async function (this: CustomWorld) {
  const name = faker.person.fullName();
  const email = faker.internet.email().toLowerCase();
  const pass = 'SecaliPass123!';
  this.context.storedData['lastRegisteredUser'] = { name, email, pass };
  await this.apiClient.auth.register(name, email, pass);
};

Given('que registro un nuevo usuario con datos aleatorios válidos', registerRandomUser);
When('registro un nuevo usuario con datos aleatorios válidos', registerRandomUser);

When('intento registrar un usuario con el mismo email ya utilizado', async function (this: CustomWorld) {
  const previousUser = this.context.storedData['lastRegisteredUser'];
  const name = faker.person.fullName();
  const pass = 'OtraClave123!';
  await this.apiClient.auth.register(name, previousUser ? previousUser.email : ENV.DEFAULT_ADMIN.email, pass);
});
