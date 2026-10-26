import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../src/support/world';
import { resolveTemplate } from '../../../src/support/template-resolver';

// Navigation
const navigateToPage = async function (this: CustomWorld, rawPath: string) {
  expect(this.page, 'Browser is not initialized. Did you forget the @ui tag?').toBeDefined();
  const path = resolveTemplate(rawPath, this);
  await this.page!.goto(path);
  await this.page!.waitForLoadState('domcontentloaded');
};
Given('the user navigates to {string}', navigateToPage);
Given('que el usuario navega a la página {string}', navigateToPage);

// URL assertion
const assertCurrentUrlContains = async function (this: CustomWorld, expectedPath: string) {
  expect(this.page).toBeDefined();
  await this.page!.waitForURL(new RegExp(expectedPath), { timeout: 10000 });
  expect(this.page!.url()).toContain(expectedPath);
};
Then('the current URL should contain {string}', assertCurrentUrlContains);
Then('la URL actual contiene {string}', assertCurrentUrlContains);

// Button clicks
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

// Button visibility
const assertButtonVisible = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver
    ? this.elementResolver.findButton(buttonText)
    : this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeVisible({ timeout: 5000 });
};
Then('the {string} button should be visible', assertButtonVisible);
Then('el botón {string} está visible', assertButtonVisible);

// Button enabled
const assertButtonEnabled = async function (this: CustomWorld, buttonText: string) {
  expect(this.page).toBeDefined();
  const btn = this.elementResolver
    ? this.elementResolver.findButton(buttonText)
    : this.page!.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  await expect(btn).toBeEnabled({ timeout: 5000 });
};
Then('the {string} button should be enabled', assertButtonEnabled);
Then('el botón {string} está habilitado', assertButtonEnabled);

// Field filling
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

// Text visibility
const assertTextVisible = async function (this: CustomWorld, rawExpectedText: string) {
  expect(this.page).toBeDefined();
  const expectedText = resolveTemplate(rawExpectedText, this);
  const locator = this.page!.getByText(new RegExp(expectedText, 'i')).first();
  await expect(locator).toBeVisible({ timeout: 5000 });
};
Then('the text {string} should be visible on screen', assertTextVisible);
Then('visualiza el texto {string} en la pantalla', assertTextVisible);

// Text not visible
const assertTextNotVisible = async function (this: CustomWorld, rawUnexpectedText: string) {
  expect(this.page).toBeDefined();
  const unexpectedText = resolveTemplate(rawUnexpectedText, this);
  const locator = this.page!.getByText(new RegExp(unexpectedText, 'i')).first();
  await expect(locator).not.toBeVisible({ timeout: 5000 });
};
Then('the text {string} should not be visible on screen', assertTextNotVisible);
Then('no visualiza el texto {string} en la pantalla', assertTextNotVisible);

// Explicit wait
const waitSeconds = async function (this: CustomWorld, seconds: number) {
  expect(this.page).toBeDefined();
  await this.page!.waitForTimeout(seconds * 1000);
};
When('the user waits for {int} second(s)', waitSeconds);
When('espera {int} segundo(s)', waitSeconds);
