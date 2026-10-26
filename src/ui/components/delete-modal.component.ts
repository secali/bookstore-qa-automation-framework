import { Page, Locator } from '@playwright/test';

export class DeleteModalComponent {
  constructor(private page: Page) {}

  get modal(): Locator {
    return this.page.locator('.modal, [role="dialog"]').first();
  }

  get confirmButton(): Locator {
    return this.modal.getByRole('button', { name: /confirm|delete|eliminar|borrar|yes|sí/i }).first();
  }

  get cancelButton(): Locator {
    return this.modal.getByRole('button', { name: /cancel|cancelar|no/i }).first();
  }

  async confirmDelete(): Promise<void> {
    await this.confirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}
