import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';

// Navegación genérica
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

// Interacción genérica con botones
When('hace clic en el botón {string}', async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') })
    .or(this.page!.locator(`button:has-text("${buttonText}"), input[type="submit"][value="${buttonText}"]`))
    .first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
});

Then('el botón {string} está visible', async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeVisible({ timeout: 5000 });
});

Then('el botón {string} está habilitado', async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeEnabled({ timeout: 5000 });
});

// Interacción genérica con campos de formulario (inputs y textareas)
When('escribe {string} en el campo {string}', async function (this: CustomWorld, value: string, fieldName: string) {
  expect(this.page).toBeDefined();
  const regex = new RegExp(fieldName, 'i');
  const input = this.page!.getByLabel(regex)
    .or(this.page!.getByPlaceholder(regex))
    .or(this.page!.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`))
    .first();
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(value);
});

// Verificación genérica de visibilidad de textos en pantalla
Then('visualiza el texto {string} en la pantalla', async function (this: CustomWorld, expectedText: string) {
  expect(this.page).toBeDefined();
  const locator = this.page!.getByText(new RegExp(expectedText, 'i')).first();
  await expect(locator).toBeVisible({ timeout: 5000 });
});

Then('no visualiza el texto {string} en la pantalla', async function (this: CustomWorld, unexpectedText: string) {
  expect(this.page).toBeDefined();
  const locator = this.page!.getByText(new RegExp(unexpectedText, 'i')).first();
  await expect(locator).not.toBeVisible({ timeout: 5000 });
});

// Espera explícita para casos límite
When('espera {int} segundo(s)', async function (this: CustomWorld, seconds: number) {
  expect(this.page).toBeDefined();
  await this.page!.waitForTimeout(seconds * 1000);
});
