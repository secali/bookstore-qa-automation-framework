import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path(): string {
    return '/login';
  }

  get emailInput(): Locator {
    return this.page
      .getByLabel(/email/i)
      .or(this.page.getByPlaceholder(/email/i))
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
    return this.page.getByRole('button', { name: /login|iniciar sesión|acceder|sign in/i }).first();
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], .error, .alert-danger, .error-message').first();
  }

  get registerLink(): Locator {
    return this.page.getByRole('link', { name: /register|registrarse|crear cuenta/i }).first();
  }

  async login(email: string, pass: string): Promise<void> {
    await this.safeFill(this.emailInput, email);
    await this.safeFill(this.passwordInput, pass);
    await this.safeClick(this.submitButton);
  }

  async getAlertText(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.errorMessage.textContent()) || '';
  }
}
