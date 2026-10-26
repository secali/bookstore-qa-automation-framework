import { Given, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { faker } from '@faker-js/faker';

// Admin authentication setup
const authenticateAsAdmin = async function (this: CustomWorld) {
  const loginRes = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
  expect(loginRes.status, `Failed to authenticate as admin: ${JSON.stringify(loginRes.body)}`).toBe(200);
  expect(loginRes.body.token, 'Token was not returned in the login response').toBeDefined();
  this.context.token = loginRes.body.token;
};
Given('the user is authenticated as an admin in the API', authenticateAsAdmin);
Given('que estoy autenticado como administrador en la API', authenticateAsAdmin);

// Login with specific credentials
const loginWithCredentials = async function (this: CustomWorld, email: string, pass: string) {
  await this.apiClient.auth.login(email, pass);
};
When('the user logs in via API with email {string} and password {string}', loginWithCredentials);
When('inicio sesión en la API con el email {string} y la contraseña {string}', loginWithCredentials);

// Login with valid seed admin
const loginWithSeedAdmin = async function (this: CustomWorld) {
  await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
};
When('the user logs in via API with valid admin credentials', loginWithSeedAdmin);
When('inicio sesión en la API con credenciales válidas de administrador', loginWithSeedAdmin);

// Register user with specific data
const registerUser = async function (this: CustomWorld, name: string, email: string, pass: string) {
  await this.apiClient.auth.register(name, email, pass);
};
When('the user registers via API with name {string}, email {string} and password {string}', registerUser);
When('registro un nuevo usuario con nombre {string}, email {string} y contraseña {string}', registerUser);

// Register user with random data
const registerRandomUser = async function (this: CustomWorld) {
  const name = faker.person.fullName();
  const email = faker.internet.email().toLowerCase();
  const pass = 'SecaliPass123!';
  this.context.storedData['lastRegisteredUser'] = { name, email, pass };
  await this.apiClient.auth.register(name, email, pass);
};
Given('a new user is registered via API with random valid data', registerRandomUser);
When('the user registers via API with random valid data', registerRandomUser);
Given('que registro un nuevo usuario con datos aleatorios válidos', registerRandomUser);
When('registro un nuevo usuario con datos aleatorios válidos', registerRandomUser);

// Attempt duplicate registration
const registerDuplicateUser = async function (this: CustomWorld) {
  const previousUser = this.context.storedData['lastRegisteredUser'];
  const name = faker.person.fullName();
  const pass = 'DuplicatePass123!';
  await this.apiClient.auth.register(name, previousUser ? previousUser.email : ENV.DEFAULT_ADMIN.email, pass);
};
When('the user attempts to register with the same email address', registerDuplicateUser);
When('intento registrar un usuario con el mismo email ya utilizado', registerDuplicateUser);
