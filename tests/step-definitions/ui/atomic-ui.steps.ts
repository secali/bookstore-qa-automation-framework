import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { resolveTemplate } from '../../../src/support/template-resolver';

// 1. Acceso a CUALQUIER vista con sesión precargada por API
Given(
  'que el usuario accede a la vista {string} con sesión precargada vía API',
  async function (this: CustomWorld, rawPath: string) {
    expect(this.page, 'El navegador no está inicializado. ¿Olvidaste el tag @ui?').toBeDefined();
    const path = resolveTemplate(rawPath, this);

    // Obtener JWT vía API inmediatamente
    if (!this.context.token) {
      const loginRes = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
      this.context.token = loginRes.body.token;
    }

    // Precargar en localStorage antes de navegar
    await this.page!.addInitScript((jwt) => {
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify({ email: 'admin@sandbox.com', role: 'admin' }));
    }, this.context.token);

    await this.page!.goto(path);
    await this.page!.waitForLoadState('domcontentloaded');
  }
);

// 2. Operaciones atómicas sobre CUALQUIER tabla
When(
  'en la tabla localiza la fila con texto {string} y hace clic en el botón {string}',
  async function (this: CustomWorld, rawRowText: string, buttonText: string) {
    expect(this.page).toBeDefined();
    const rowText = resolveTemplate(rawRowText, this);
    const row = this.page!.locator('table tbody tr, [role="row"]').filter({ hasText: rowText }).first();
    await row.waitFor({ state: 'visible', timeout: 8000 });

    const btn = row
      .getByRole('button', { name: new RegExp(buttonText, 'i') })
      .or(row.locator(`button:has-text("${buttonText}"), .btn-${buttonText.toLowerCase()}`))
      .first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click();
  }
);

Then('en la tabla la fila con texto {string} está visible', async function (this: CustomWorld, rawRowText: string) {
  expect(this.page).toBeDefined();
  const rowText = resolveTemplate(rawRowText, this);
  const row = this.page!.locator('table tbody tr, [role="row"]').filter({ hasText: rowText }).first();
  await expect(row).toBeVisible({ timeout: 8000 });
});

Then('en la tabla la fila con texto {string} no está visible', async function (this: CustomWorld, rawRowText: string) {
  expect(this.page).toBeDefined();
  const rowText = resolveTemplate(rawRowText, this);
  const row = this.page!.locator('table tbody tr, [role="row"]').filter({ hasText: rowText }).first();
  await expect(row).not.toBeVisible({ timeout: 5000 });
});

// 3. Operaciones atómicas sobre CUALQUIER modal
Then('el modal está visible', async function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  const modal = this.page!.locator('.modal, [role="dialog"]').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
});

Then('el modal no está visible', async function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  const modal = this.page!.locator('.modal, [role="dialog"]').first();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
});

When(
  'en el modal activo escribe {string} en el campo {string}',
  async function (this: CustomWorld, rawValue: string, fieldName: string) {
    expect(this.page).toBeDefined();
    const value = resolveTemplate(rawValue, this);
    const modal = this.page!.locator('.modal, [role="dialog"]').first();
    const regex = new RegExp(fieldName, 'i');

    const input = modal
      .getByLabel(regex)
      .or(modal.getByPlaceholder(regex))
      .or(modal.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`))
      .first();

    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  }
);

When('en el modal activo hace clic en el botón {string}', async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const modal = this.page!.locator('.modal, [role="dialog"]').first();
  const btn = modal
    .getByRole('button', { name: new RegExp(buttonText, 'i') })
    .or(modal.locator(`button:has-text("${buttonText}")`))
    .first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
});

// 4. Operaciones atómicas sobre campos generales
When('limpia el campo {string}', async function (this: CustomWorld, fieldName: string) {
  expect(this.page).toBeDefined();
  const regex = new RegExp(fieldName, 'i');
  const input = this.page!.getByLabel(regex)
    .or(this.page!.getByPlaceholder(regex))
    .or(this.page!.locator(`input[name="${fieldName}"]`))
    .first();
  await input.fill('');
});

When(
  'selecciona la opción {string} en el selector {string}',
  async function (this: CustomWorld, optionText: string, selectName: string) {
    expect(this.page).toBeDefined();
    const select = this.page!.getByLabel(new RegExp(selectName, 'i'))
      .or(this.page!.locator(`select[name="${selectName}"]`))
      .first();
    await select.selectOption({ label: optionText });
  }
);

Then(
  'el campo {string} tiene el valor {string}',
  async function (this: CustomWorld, fieldName: string, expectedValue: string) {
    expect(this.page).toBeDefined();
    const input = this.page!.getByLabel(new RegExp(fieldName, 'i'))
      .or(this.page!.locator(`input[name="${fieldName}"]`))
      .first();
    await expect(input).toHaveValue(resolveTemplate(expectedValue, this));
  }
);
