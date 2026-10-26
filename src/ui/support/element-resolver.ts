import { Page, Locator } from '@playwright/test';

/**
 * Page & Element Identifier Resolver
 * Permite localizar elementos de forma agnóstica en cualquier página o modal
 * resolviendo por testid, etiqueta accesible, placeholder, rol, name o id.
 */
export class ElementResolver {
  constructor(private page: Page) {}

  /**
   * Resuelve la URL o ruta correspondiente a un nombre semántico de página.
   */
  resolvePagePath(pageName: string): string {
    const normalized = pageName.toLowerCase().trim();
    switch (normalized) {
      case 'login':
        return '/login';
      case 'register':
      case 'sign up':
        return '/register';
      case 'books':
      case 'catalog':
      case 'dashboard':
        return '/books';
      default:
        return pageName.startsWith('/') ? pageName : `/${pageName}`;
    }
  }

  /**
   * Localiza un campo de entrada (input, textarea, select) por cualquier identificador:
   * 1. data-testid
   * 2. aria-label / getByLabel
   * 3. placeholder / getByPlaceholder
   * 4. name attribute
   * 5. id
   */
  findField(identifier: string, container?: Locator): Locator {
    const parent = container || this.page;
    const regex = new RegExp(`^${identifier}$|${identifier}`, 'i');

    return parent
      .locator(`[data-testid="${identifier}"]`)
      .or(parent.getByLabel(regex))
      .or(parent.getByPlaceholder(regex))
      .or(parent.locator(`input[name="${identifier}"], textarea[name="${identifier}"], select[name="${identifier}"]`))
      .or(parent.locator(`#${identifier}`))
      .first();
  }

  /**
   * Localiza un botón por su texto, rol, testid o id.
   */
  findButton(identifier: string, container?: Locator): Locator {
    const parent = container || this.page;
    const regex = new RegExp(`^${identifier}$|${identifier}`, 'i');

    return parent
      .locator(`[data-testid="${identifier}"]`)
      .or(parent.getByRole('button', { name: regex }))
      .or(parent.locator(`button:has-text("${identifier}"), input[type="submit"][value="${identifier}"]`))
      .or(parent.locator(`#${identifier}`))
      .first();
  }

  /**
   * Localiza el contenedor activo de un modal o diálogo.
   */
  getActiveModal(modalTitleOrName?: string): Locator {
    let modal = this.page.locator('.modal, [role="dialog"]').first();
    if (modalTitleOrName) {
      const modalWithTitle = this.page
        .locator('.modal, [role="dialog"]')
        .filter({ hasText: new RegExp(modalTitleOrName, 'i') })
        .first();
      modal = modalWithTitle;
    }
    return modal;
  }

  /**
   * Localiza una tabla por su rol o selector.
   */
  getTable(tableIdentifier?: string): Locator {
    if (tableIdentifier) {
      return this.page
        .locator(`[data-testid="${tableIdentifier}"], table#${tableIdentifier}, .table-${tableIdentifier}`)
        .or(this.page.locator('table, [role="table"]'))
        .first();
    }
    return this.page.locator('table, [role="table"]').first();
  }

  /**
   * Localiza una fila dentro de una tabla que contenga un texto dado.
   */
  findTableRowByText(text: string, tableIdentifier?: string): Locator {
    const table = this.getTable(tableIdentifier);
    return table.locator('tbody tr, [role="row"]').filter({ hasText: text }).first();
  }
}
