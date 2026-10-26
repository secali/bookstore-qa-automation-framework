import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path(): string {
    return '/register';
  }

  get nameInput(): Locator {
    return this.page
      .getByLabel(/name|nombre/i)
      .or(this.page.getByPlaceholder(/name|nombre/i))
      .or(this.page.locator('input[name="name"]'))
      .first();
  }

  get emailInput(): Locator {
    return this.page
      .getByLabel(/email|correo/i)
      .or(this.page.getByPlaceholder(/email|correo/i))
      .or(this.page.locator('input[type="email"], input[name="email"]'))
      .first();
  }

  get passwordInput(): Locator {
    return this.page
      .getByLabel(/password|contraseña/i)
      .or(this.page.getByPlaceholder(/password|contraseña/i))
      .or(this.page.locator('input[type="password"], input[name="password"]'))
      .first();
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /register|registrarse|crear cuenta/i }).first();
  }

  get successMessage(): Locator {
    return this.page.locator('.success, .alert-success, [role="status"]').first();
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], .error, .alert-danger').first();
  }

  async register(name: string, email: string, pass: string): Promise<void> {
    await this.safeFill(this.nameInput, name);
    await this.safeFill(this.emailInput, email);
    await this.safeFill(this.passwordInput, pass);
    await this.safeClick(this.submitButton);
  }
}
