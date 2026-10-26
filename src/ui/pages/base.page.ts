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
}
