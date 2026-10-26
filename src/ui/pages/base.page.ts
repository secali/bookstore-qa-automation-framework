import { Page, Locator } from '@playwright/test';
import { ENV } from '../../../config/env.config';

export abstract class BasePage {
  constructor(protected page: Page) {}

  abstract get path(): string;

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForUrl(pattern: string | RegExp, timeout: number = ENV.DEFAULT_TIMEOUT): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  protected async safeClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: ENV.DEFAULT_TIMEOUT });
    await locator.click();
  }

  protected async safeFill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: ENV.DEFAULT_TIMEOUT });
    await locator.fill(text);
  }

  findField(labelOrPlaceholder: string): Locator {
    const regex = new RegExp(labelOrPlaceholder, 'i');
    return this.page
      .getByLabel(regex)
      .or(this.page.getByPlaceholder(regex))
      .or(this.page.locator(`input[name="${labelOrPlaceholder}"], textarea[name="${labelOrPlaceholder}"]`))
      .first();
  }

  findButton(name: string): Locator {
    return this.page
      .getByRole('button', { name: new RegExp(name, 'i') })
      .or(this.page.locator(`button:has-text("${name}"), input[type="submit"][value="${name}"]`))
      .first();
  }

  async isTextVisible(text: string): Promise<boolean> {
    const loc = this.page.getByText(new RegExp(text, 'i')).first();
    return loc.isVisible();
  }
}
