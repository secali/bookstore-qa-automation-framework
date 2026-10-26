import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';

When(
  'el usuario ingresa sus credenciales de administrador en la pantalla de login',
  async function (this: CustomWorld) {
    expect(this.loginPage).toBeDefined();
    await this.loginPage!.navigate();
    await this.loginPage!.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
  }
);

When(
  'el usuario ingresa el email {string} y la contraseña {string}',
  async function (this: CustomWorld, email: string, pass: string) {
    expect(this.loginPage).toBeDefined();
    await this.loginPage!.navigate();
    await this.loginPage!.login(email, pass);
  }
);

Then('se muestra un mensaje de error en pantalla', async function (this: CustomWorld) {
  expect(this.loginPage).toBeDefined();
  const alertText = await this.loginPage!.getAlertText();
  expect(alertText.length).toBeGreaterThan(0);
});
