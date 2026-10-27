import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { resolveTemplate } from '../../../src/support/template-resolver';
import { parseDataTableEntries } from '../../../src/support/datatable-parser';

// ============================================================================
// 1. Navigation & Session Management
// ============================================================================
const navigateToPage = async function (this: CustomWorld, rawPath: string) {
  expect(this.page, 'Browser is not initialized. Did you forget the @ui tag?').toBeDefined();
  const path = resolveTemplate(rawPath, this);
  await this.page!.goto(path);
  await this.page!.waitForLoadState('domcontentloaded');
};
Given('the user navigates to {string}', navigateToPage);
Given('que el usuario navega a la página {string}', navigateToPage);

const openPageWithSession = async function (this: CustomWorld, rawPathOrPage: string) {
  expect(this.page, 'Browser is not initialized. Did you forget the @ui tag?').toBeDefined();
  expect(this.elementResolver, 'ElementResolver is not initialized').toBeDefined();

  const resolvedPath = this.elementResolver!.resolvePagePath(resolveTemplate(rawPathOrPage, this));
  const email = (this.context.storedData['userEmail'] as string) || ENV.DEFAULT_ADMIN.email;
  const role = (this.context.storedData['userRole'] as string) || 'admin';

  if (!this.context.token) {
    const loginRes = await this.apiClient.http.send('POST', '/auth/login', {
      data: { email: ENV.DEFAULT_ADMIN.email, password: ENV.DEFAULT_ADMIN.password }
    });
    this.context.token = loginRes.body.token;
  }
  expect(this.context.token, 'Token was not set in scenario context').toBeDefined();

  await this.page!.addInitScript(
    ({ jwt, email, role }) => {
      if (!sessionStorage.getItem('explicit_logout')) {
        localStorage.setItem('bookstore.token', jwt);
        localStorage.setItem('bookstore.user', JSON.stringify({ name: 'Sandbox Admin', email, role }));
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify({ email, role }));
      }
    },
    { jwt: this.context.token!, email, role }
  );

  await this.page!.goto(resolvedPath);
  await this.page!.waitForLoadState('domcontentloaded');
};
Given('the user opens the {string} page with preloaded API session', openPageWithSession);
Given('the user opens {string} with preloaded API session', openPageWithSession);
Given('the user navigates to {string} with preloaded API session', openPageWithSession);
Given('que el usuario accede a la vista {string} con sesión precargada vía API', openPageWithSession);

// ============================================================================
// 2. Page & Element URL Assertions
// ============================================================================
const assertCurrentUrlContains = async function (this: CustomWorld, expectedPath: string) {
  expect(this.page).toBeDefined();
  await this.page!.waitForURL(new RegExp(expectedPath), { timeout: 10000 });
  expect(this.page!.url()).toContain(expectedPath);
};
Then('the current URL should contain {string}', assertCurrentUrlContains);
Then('la URL actual contiene {string}', assertCurrentUrlContains);

// ============================================================================
// 3. Form Input Filling & Operations
// ============================================================================
const enterField = async function (this: CustomWorld, rawValue: string, fieldName: string) {
  expect(this.page).toBeDefined();
  const value = resolveTemplate(rawValue, this);
  const input = this.elementResolver
    ? this.elementResolver.findField(fieldName)
    : this.page!.getByLabel(new RegExp(fieldName, 'i')).first();
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(value);
};
When('the user enters {string} into the {string} field', enterField);
When('escribe {string} en el campo {string}', enterField);

const onPageEnterField = async function (
  this: CustomWorld,
  pageName: string,
  rawValue: string,
  elementIdentifier: string
) {
  expect(this.page).toBeDefined();
  const value = resolveTemplate(rawValue, this);
  const input = this.elementResolver!.findField(elementIdentifier);
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(value);
};
When('on the {string} page, the user enters {string} into the {string} field', onPageEnterField);
When('en la página {string}, escribe {string} en el campo {string}', onPageEnterField);

const clearField = async function (this: CustomWorld, fieldName: string) {
  expect(this.page).toBeDefined();
  const input = this.elementResolver!.findField(fieldName);
  await input.fill('');
};
When('the user clears the {string} field', clearField);
When('limpia el campo {string}', clearField);

const selectOption = async function (this: CustomWorld, optionText: string, selectIdentifier: string) {
  expect(this.page).toBeDefined();
  const select = this.elementResolver!.findField(selectIdentifier);
  await select.selectOption({ label: optionText });
};
When('the user selects option {string} in the {string} dropdown', selectOption);
When('selecciona la opción {string} en el selector {string}', selectOption);

const assertFieldValue = async function (this: CustomWorld, fieldIdentifier: string, expectedValue: string) {
  expect(this.page).toBeDefined();
  const input = this.elementResolver!.findField(fieldIdentifier);
  await expect(input).toHaveValue(resolveTemplate(expectedValue, this));
};
Then('the {string} field should have value {string}', assertFieldValue);
Then('el campo {string} tiene el valor {string}', assertFieldValue);

const onPageFillForm = async function (this: CustomWorld, dataTable: DataTable) {
  expect(this.page).toBeDefined();
  const entries = parseDataTableEntries(dataTable);
  for (const entry of entries) {
    const value = resolveTemplate(entry.value, this);
    const input = this.elementResolver!.findField(entry.key);
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  }
};
When('the user fills the form with data:', onPageFillForm);
When('the user enters the following data:', onPageFillForm);
When('el usuario ingresa los siguientes datos:', onPageFillForm);

const assertMultipleFieldValues = async function (this: CustomWorld, dataTable: DataTable) {
  expect(this.page).toBeDefined();
  const entries = parseDataTableEntries(dataTable);
  for (const entry of entries) {
    const expected = resolveTemplate(entry.value, this);
    const input = this.elementResolver!.findField(entry.key);
    await expect(input).toHaveValue(expected, { timeout: 5000 });
  }
};
Then('the form fields should have values:', assertMultipleFieldValues);
Then('the following fields should have values:', assertMultipleFieldValues);
Then('los siguientes campos deben tener los valores:', assertMultipleFieldValues);

// ============================================================================
// 4. Buttons (Clicks, States, Visibility)
// ============================================================================
const clickButton = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver
    ? this.elementResolver.findButton(buttonText)
    : this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
};
When('the user clicks the {string} button', clickButton);
When('hace clic en el botón {string}', clickButton);

const onPageClickButton = async function (this: CustomWorld, pageName: string, buttonIdentifier: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver!.findButton(buttonIdentifier);
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
};
When('on the {string} page, the user clicks the {string} button', onPageClickButton);
When('en la página {string}, hace clic en el botón {string}', onPageClickButton);

const assertButtonVisible = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver
    ? this.elementResolver.findButton(buttonText)
    : this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeVisible({ timeout: 5000 });
};
Then('the {string} button should be visible', assertButtonVisible);
Then('el botón {string} está visible', assertButtonVisible);

const assertButtonEnabled = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver
    ? this.elementResolver.findButton(buttonText)
    : this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeEnabled({ timeout: 5000 });
};
Then('the {string} button should be enabled', assertButtonEnabled);
Then('on the {string} page, the {string} button should be enabled', function (this: CustomWorld, p: string, b: string) {
  return assertButtonEnabled.call(this, b);
});
Then('el botón {string} está habilitado', assertButtonEnabled);

const assertButtonDisabled = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver
    ? this.elementResolver.findButton(buttonText)
    : this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeDisabled({ timeout: 5000 });
};
Then('the {string} button should be disabled', assertButtonDisabled);
Then('on the {string} page, the {string} button should be disabled', function (this: CustomWorld, p: string, b: string) {
  return assertButtonDisabled.call(this, b);
});
Then('el botón {string} está deshabilitado', assertButtonDisabled);

// ============================================================================
// 5. Active Modal & Dialog Container Interactions
// ============================================================================
const assertModalVisible = async function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal();
  await expect(modal).toBeVisible({ timeout: 5000 });
};
Then('the modal should be visible', assertModalVisible);
Then('el modal está visible', assertModalVisible);

const assertModalNotVisible = async function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
};
Then('the modal should not be visible', assertModalNotVisible);
Then('el modal no está visible', assertModalNotVisible);

const inModalEnterField = async function (this: CustomWorld, rawValue: string, elementIdentifier: string) {
  expect(this.page).toBeDefined();
  const value = resolveTemplate(rawValue, this);
  const modal = this.elementResolver!.getActiveModal();
  const input = this.elementResolver!.findField(elementIdentifier, modal);
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(value);
};
When('in the active modal, the user enters {string} into the {string} field', inModalEnterField);
When('en el modal activo escribe {string} en el campo {string}', inModalEnterField);

const inModalFillForm = async function (this: CustomWorld, dataTable: DataTable) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal();
  const entries = parseDataTableEntries(dataTable);
  for (const entry of entries) {
    const value = resolveTemplate(entry.value, this);
    const input = this.elementResolver!.findField(entry.key, modal);
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  }
};
When('in the active modal, the user fills the form with data:', inModalFillForm);
When('in the active modal, the user enters the following data:', inModalFillForm);
When('en el modal activo el usuario ingresa los siguientes datos:', inModalFillForm);

const inNamedModalEnterField = async function (
  this: CustomWorld,
  modalName: string,
  rawValue: string,
  elementIdentifier: string
) {
  expect(this.page).toBeDefined();
  const value = resolveTemplate(rawValue, this);
  const modal = this.elementResolver!.getActiveModal(modalName);
  const input = this.elementResolver!.findField(elementIdentifier, modal);
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(value);
};
When('in the {string} modal, the user enters {string} into the {string} field', inNamedModalEnterField);
When('en el modal {string}, escribe {string} en el campo {string}', inNamedModalEnterField);

const inModalClickButton = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal();
  const btn = this.elementResolver!.findButton(buttonText, modal);
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
};
When('in the active modal, the user clicks the {string} button', inModalClickButton);
When('en el modal activo hace clic en el botón {string}', inModalClickButton);

const inNamedModalClickButton = async function (this: CustomWorld, modalName: string, buttonText: string) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal(modalName);
  const btn = this.elementResolver!.findButton(buttonText, modal);
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
};
When('in the {string} modal, the user clicks the {string} button', inNamedModalClickButton);
When('en el modal {string}, hace clic en el botón {string}', inNamedModalClickButton);

const inModalAssertText = async function (this: CustomWorld, rawText: string) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal();
  const text = resolveTemplate(rawText, this);
  const textLocator = modal.getByText(new RegExp(text, 'i')).first();
  await expect(textLocator).toBeVisible({ timeout: 5000 });
};
Then('in the active modal, the text {string} should be visible', inModalAssertText);
Then('en el modal activo, el texto {string} está visible', inModalAssertText);

// ============================================================================
// 6. Table Interactions & Row Scanning
// ============================================================================
const tableClickRowButton = async function (this: CustomWorld, rawRowText: string, buttonText: string) {
  expect(this.page).toBeDefined();
  const rowText = resolveTemplate(rawRowText, this);
  const row = this.elementResolver!.findTableRowByText(rowText);
  await row.waitFor({ state: 'visible', timeout: 8000 });

  const btn = this.elementResolver!.findButton(buttonText, row);
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
};
When('in the table, the user finds the row containing {string} and clicks the {string} button', tableClickRowButton);
When('en la tabla localiza la fila con texto {string} y hace clic en el botón {string}', tableClickRowButton);

const assertTableRowVisible = async function (this: CustomWorld, rawRowText: string) {
  expect(this.page).toBeDefined();
  const rowText = resolveTemplate(rawRowText, this);
  const row = this.elementResolver!.findTableRowByText(rowText);
  await expect(row).toBeVisible({ timeout: 8000 });
};
Then('in the table, the row containing {string} should be visible', assertTableRowVisible);
Then('en la tabla la fila con texto {string} está visible', assertTableRowVisible);

const assertTableRowNotVisible = async function (this: CustomWorld, rawRowText: string) {
  expect(this.page).toBeDefined();
  const rowText = resolveTemplate(rawRowText, this);
  const row = this.elementResolver!.findTableRowByText(rowText);
  await expect(row).not.toBeVisible({ timeout: 5000 });
};
Then('in the table, the row containing {string} should not be visible', assertTableRowNotVisible);
Then('en la tabla la fila con texto {string} no está visible', assertTableRowNotVisible);

const assertTableMinRows = async function (this: CustomWorld, minRows: number) {
  expect(this.page).toBeDefined();
  const table = this.elementResolver!.getTable();
  await expect(async () => {
    const loading = this.page!.locator('[data-testid="books-loading"]');
    if (await loading.isVisible()) {
      throw new Error('Table is still loading books...');
    }
    const count = await table.locator('tbody tr[data-testid="book-row"]').count();
    expect(count).toBeGreaterThanOrEqual(minRows);
  }).toPass({ timeout: 10000 });
};
Then('the table should display at least {int} row(s)', assertTableMinRows);
Then(
  'the {string} table should display at least {int} row(s)',
  async function (this: CustomWorld, tableId: string, minRows: number) {
    expect(this.page).toBeDefined();
    const table = this.elementResolver!.getTable(tableId);
    await expect(async () => {
      const count = await table.locator('tbody tr[data-testid="book-row"]').count();
      expect(count).toBeGreaterThanOrEqual(minRows);
    }).toPass({ timeout: 10000 });
  }
);
Then('la tabla muestra al menos {int} fila(s)', assertTableMinRows);

// ============================================================================
// 7. Text Visibility Assertions
// ============================================================================
const assertTextVisible = async function (this: CustomWorld, rawExpectedText: string) {
  expect(this.page).toBeDefined();
  const expectedText = resolveTemplate(rawExpectedText, this);
  const locator = this.page!.getByText(new RegExp(expectedText, 'i')).first();
  await expect(locator).toBeVisible({ timeout: 5000 });
};
Then('the text {string} should be visible on screen', assertTextVisible);
Then('visualiza el texto {string} en la pantalla', assertTextVisible);

const assertTextNotVisible = async function (this: CustomWorld, rawUnexpectedText: string) {
  expect(this.page).toBeDefined();
  const unexpectedText = resolveTemplate(rawUnexpectedText, this);
  const locator = this.page!.getByText(new RegExp(unexpectedText, 'i')).first();
  await expect(locator).not.toBeVisible({ timeout: 5000 });
};
Then('the text {string} should not be visible on screen', assertTextNotVisible);
Then('no visualiza el texto {string} en la pantalla', assertTextNotVisible);

// ============================================================================
// 8. Alerts, Error Messages & Toasts
// ============================================================================
const assertAlertVisible = async function (this: CustomWorld, rawSubstring?: string) {
  expect(this.page).toBeDefined();
  const alert = rawSubstring
    ? this.elementResolver!.findAlert(resolveTemplate(rawSubstring, this))
    : this.elementResolver!.findAlert();
  await expect(alert).toBeVisible({ timeout: 5000 });
};
Then('an alert message should be displayed on screen', async function (this: CustomWorld) {
  await assertAlertVisible.call(this);
});
Then('an error alert message should be displayed on screen', async function (this: CustomWorld) {
  await assertAlertVisible.call(this);
});
Then('an alert message containing {string} should be visible', async function (this: CustomWorld, text: string) {
  await assertAlertVisible.call(this, text);
});
Then('se muestra un mensaje de alerta en la pantalla', async function (this: CustomWorld) {
  await assertAlertVisible.call(this);
});
Then('un mensaje de alerta que contiene {string} está visible', async function (this: CustomWorld, text: string) {
  await assertAlertVisible.call(this, text);
});

// ============================================================================
// 9. Checkboxes
// ============================================================================
const checkCheckbox = async function (this: CustomWorld, checkboxIdentifier: string) {
  expect(this.page).toBeDefined();
  const box = this.elementResolver!.findCheckbox(checkboxIdentifier);
  await box.waitFor({ state: 'visible', timeout: 5000 });
  await box.check();
};
When('the user checks the {string} checkbox', checkCheckbox);
When('marca la casilla {string}', checkCheckbox);

const uncheckCheckbox = async function (this: CustomWorld, checkboxIdentifier: string) {
  expect(this.page).toBeDefined();
  const box = this.elementResolver!.findCheckbox(checkboxIdentifier);
  await box.waitFor({ state: 'visible', timeout: 5000 });
  await box.uncheck();
};
When('the user unchecks the {string} checkbox', uncheckCheckbox);
When('desmarca la casilla {string}', uncheckCheckbox);

// ============================================================================
// 10. Explicit Waits
// ============================================================================
const waitSeconds = async function (this: CustomWorld, seconds: number) {
  expect(this.page).toBeDefined();
  await this.page!.waitForTimeout(seconds * 1000);
};
When('the user waits for {int} second(s)', waitSeconds);
When('espera {int} segundo(s)', waitSeconds);
