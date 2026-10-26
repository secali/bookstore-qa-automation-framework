import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { BookModalComponent } from '../components/book-modal.component';
import { DeleteModalComponent } from '../components/delete-modal.component';

export class BooksPage extends BasePage {
  public bookModal: BookModalComponent;
  public deleteModal: DeleteModalComponent;

  constructor(page: Page) {
    super(page);
    this.bookModal = new BookModalComponent(page);
    this.deleteModal = new DeleteModalComponent(page);
  }

  get path(): string {
    return '/books';
  }

  get searchInput(): Locator {
    return this.page
      .getByPlaceholder(/search|buscar|filtrar/i)
      .or(this.page.locator('input[type="search"], input[name="search"]'))
      .first();
  }

  get addBookButton(): Locator {
    return this.page
      .getByRole('button', { name: /add book|añadir libro|nuevo libro|new book|\+ libro/i })
      .or(this.page.locator('button:has-text("Add"), button:has-text("Añadir")'))
      .first();
  }

  get logoutButton(): Locator {
    return this.page
      .getByRole('button', { name: /logout|cerrar sesión|salir/i })
      .or(this.page.getByRole('link', { name: /logout|cerrar sesión|salir/i }))
      .first();
  }

  get booksTable(): Locator {
    return this.page.locator('table, [role="table"]').first();
  }

  get tableRows(): Locator {
    return this.page.locator('table tbody tr, [role="row"]:not([role="rowheader"])');
  }

  async search(term: string): Promise<void> {
    await this.safeFill(this.searchInput, term);
    // Esperar brevemente a que el filtro reactivo surta efecto en la UI
    await this.page.waitForTimeout(300);
  }

  async getRowCount(): Promise<number> {
    await this.tableRows
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    return this.tableRows.count();
  }

  async openAddBookModal(): Promise<void> {
    await this.safeClick(this.addBookButton);
  }

  getRowByTitle(title: string): Locator {
    return this.tableRows.filter({ hasText: title }).first();
  }

  async deleteBookByTitle(title: string): Promise<void> {
    const row = this.getRowByTitle(title);
    const deleteBtn = row
      .getByRole('button', { name: /delete|eliminar|borrar/i })
      .or(row.locator('button.delete, button.btn-danger'))
      .first();
    await deleteBtn.click();
    await this.deleteModal.confirmDelete();
  }

  async logout(): Promise<void> {
    await this.safeClick(this.logoutButton);
  }
}
