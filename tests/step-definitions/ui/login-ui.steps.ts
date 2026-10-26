import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';

const loginWithAdminCredentials = async function (this: CustomWorld) {
  expect(this.loginPage).toBeDefined();
  await this.loginPage!.navigate();
  await this.loginPage!.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
};
When('the user submits valid admin credentials on the login page', loginWithAdminCredentials);
When('el usuario ingresa sus credenciales de administrador en la pantalla de login', loginWithAdminCredentials);

const loginWithSpecificCredentials = async function (this: CustomWorld, email: string, pass: string) {
  expect(this.loginPage).toBeDefined();
  await this.loginPage!.navigate();
  await this.loginPage!.login(email, pass);
};
When('the user submits email {string} and password {string} on the login page', loginWithSpecificCredentials);
When('el usuario ingresa el email {string} y la contraseña {string}', loginWithSpecificCredentials);

const assertErrorMessageDisplayed = async function (this: CustomWorld) {
  expect(this.loginPage).toBeDefined();
  const alertText = await this.loginPage!.getAlertText();
  expect(alertText.length).toBeGreaterThan(0);
};
Then('an error alert message should be displayed on screen', assertErrorMessageDisplayed);
Then('se muestra un mensaje de error en pantalla', assertErrorMessageDisplayed);
