import { Page, Locator } from '@playwright/test';
import { CreateBookPayload } from '../../api/types/api.types';

export class BookModalComponent {
  constructor(private page: Page) {}

  get modal(): Locator {
    return this.page.locator('.modal, [role="dialog"]').first();
  }

  get titleInput(): Locator {
    return this.modal
      .getByLabel(/title|título/i)
      .or(this.modal.getByPlaceholder(/title|título/i))
      .or(this.modal.locator('input[name="title"]'))
      .first();
  }

  get authorInput(): Locator {
    return this.modal
      .getByLabel(/author|autor/i)
      .or(this.modal.getByPlaceholder(/author|autor/i))
      .or(this.modal.locator('input[name="author"]'))
      .first();
  }

  get isbnInput(): Locator {
    return this.modal
      .getByLabel(/isbn/i)
      .or(this.modal.getByPlaceholder(/isbn/i))
      .or(this.modal.locator('input[name="isbn"]'))
      .first();
  }

  get priceInput(): Locator {
    return this.modal
      .getByLabel(/price|precio/i)
      .or(this.modal.getByPlaceholder(/price|precio/i))
      .or(this.modal.locator('input[name="price"]'))
      .first();
  }

  get categoryInput(): Locator {
    return this.modal
      .getByLabel(/category|categoría/i)
      .or(this.modal.getByPlaceholder(/category|categoría/i))
      .or(this.modal.locator('input[name="category"], select[name="category"]'))
      .first();
  }

  get saveButton(): Locator {
    return this.modal.getByRole('button', { name: /save|guardar|create|crear/i }).first();
  }

  get cancelButton(): Locator {
    return this.modal.getByRole('button', { name: /cancel|cancelar/i }).first();
  }

  async isVisible(): Promise<boolean> {
    return this.modal.isVisible();
  }

  async fillAndSubmit(book: CreateBookPayload): Promise<void> {
    await this.titleInput.fill(book.title);
    await this.authorInput.fill(book.author);
    await this.isbnInput.fill(book.isbn);
    await this.priceInput.fill(String(book.price));
    if (book.category) {
      await this.categoryInput.fill(book.category);
    }
    await this.saveButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}
