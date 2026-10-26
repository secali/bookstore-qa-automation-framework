import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';

Given('que el usuario navega a la página {string}', async function (this: CustomWorld, path: string) {
  expect(this.page, 'El navegador no está inicializado. ¿Olvidaste el tag @ui?').toBeDefined();
  await this.page!.goto(path);
  await this.page!.waitForLoadState('domcontentloaded');
});

Then('la URL actual contiene {string}', async function (this: CustomWorld, expectedPath: string) {
  expect(this.page).toBeDefined();
  await this.page!.waitForURL(new RegExp(expectedPath), { timeout: 10000 });
  expect(this.page!.url()).toContain(expectedPath);
});

When('hace clic en el botón {string}', async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
});
