import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { ENV } from '../../../config/env.config';
import { resolveTemplate } from '../../../src/support/template-resolver';

// 1. Page-agnostic navigation with preloaded API session
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
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify({ email, role }));
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

// 2. Page-agnostic element interactions on a specific page
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

const onPageClickButton = async function (this: CustomWorld, pageName: string, buttonIdentifier: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver!.findButton(buttonIdentifier);
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
};
When('on the {string} page, the user clicks the {string} button', onPageClickButton);
When('en la página {string}, hace clic en el botón {string}', onPageClickButton);

// 3. Page-agnostic Table interactions
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

// 4. Modal interactions (page-agnostic)
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

// 5. Generic Form Operations
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

// 6. Generic Alert and Notification Assertions
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

// 7. Generic Button States
const assertOnPageButtonDisabled = async function (this: CustomWorld, pageName: string, buttonIdentifier: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver!.findButton(buttonIdentifier);
  await expect(btn).toBeDisabled({ timeout: 5000 });
};
Then('on the {string} page, the {string} button should be disabled', assertOnPageButtonDisabled);
Then('en la página {string}, el botón {string} está deshabilitado', assertOnPageButtonDisabled);

const assertOnPageButtonEnabled = async function (this: CustomWorld, pageName: string, buttonIdentifier: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver!.findButton(buttonIdentifier);
  await expect(btn).toBeEnabled({ timeout: 5000 });
};
Then('on the {string} page, the {string} button should be enabled', assertOnPageButtonEnabled);
Then('en la página {string}, el botón {string} está habilitado', assertOnPageButtonEnabled);

// 8. Generic In-Modal Text Assertions
const inModalAssertText = async function (this: CustomWorld, rawText: string) {
  expect(this.page).toBeDefined();
  const modal = this.elementResolver!.getActiveModal();
  const text = resolveTemplate(rawText, this);
  const textLocator = modal.getByText(new RegExp(text, 'i')).first();
  await expect(textLocator).toBeVisible({ timeout: 5000 });
};
Then('in the active modal, the text {string} should be visible', inModalAssertText);
Then('en el modal activo, el texto {string} está visible', inModalAssertText);

// 9. Generic Checkbox Interactions
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

// 10. Generic Table Row Count Assertions
const assertTableMinRows = async function (this: CustomWorld, minRows: number) {
  expect(this.page).toBeDefined();
  const table = this.elementResolver!.getTable();
  const rows = table.locator('tbody tr, [role="row"]');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(minRows);
};
Then('the table should display at least {int} row(s)', assertTableMinRows);
Then(
  'the {string} table should display at least {int} row(s)',
  async function (this: CustomWorld, tableId: string, minRows: number) {
    expect(this.page).toBeDefined();
    const table = this.elementResolver!.getTable(tableId);
    const rows = table.locator('tbody tr, [role="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(minRows);
  }
);
Then('la tabla muestra al menos {int} fila(s)', assertTableMinRows);
