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

  private logicalMap: Map<string, string> = new Map();

  /**
   * Registra un alias lógico hacia un selector específico (salida de emergencia sin Page Objects)
   */
  registerLogicalName(alias: string, selector: string): void {
    this.logicalMap.set(alias.toLowerCase(), selector);
  }

  /**
   * Localiza un campo de entrada (input, textarea, select) priorizando accesibilidad:
   * 1. Alias lógico registrado
   * 2. aria-label / getByLabel (accesibilidad recomendada por Playwright)
   * 3. data-testid (contrato de prueba)
   * 4. placeholder / getByPlaceholder
   * 5. name attribute o id
   */
  findField(identifier: string, container?: Locator): Locator {
    const parent = container || this.page;
    const lower = identifier.toLowerCase();
    if (this.logicalMap.has(lower)) {
      return parent.locator(this.logicalMap.get(lower)!).first();
    }

    if (lower === 'year' || lower === 'publishedyear' || lower === 'año') {
      return parent
        .locator('[data-testid="book-year-input"]')
        .or(parent.getByLabel(/published year|year|año/i))
        .or(parent.locator('#book-year'))
        .first();
    }

    if (lower === 'search') {
      return parent
        .locator('[data-testid="books-search-input"]')
        .or(parent.getByRole('searchbox'))
        .or(parent.getByPlaceholder(/search/i))
        .or(parent.locator('input[type="search"]'))
        .first();
    }

    const exactRegex = new RegExp(`^${identifier}$`, 'i');
    const fallbackRegex = new RegExp(identifier, 'i');

    return parent
      .getByLabel(exactRegex)
      .or(parent.locator(`[data-testid="${identifier}"]`))
      .or(parent.locator(`[data-testid="book-${lower}-input"]`))
      .or(parent.locator(`[data-testid="${lower}-input"]`))
      .or(parent.getByLabel(fallbackRegex))
      .or(parent.getByPlaceholder(exactRegex))
      .or(parent.getByPlaceholder(fallbackRegex))
      .or(parent.locator(`input[name="${identifier}"], textarea[name="${identifier}"], select[name="${identifier}"]`))
      .or(parent.locator(`#${identifier}`))
      .or(parent.locator(`#book-${lower}`))
      .first();
  }

  findButton(identifier: string, container?: Locator): Locator {
    const parent = container || this.page;
    const lower = identifier.toLowerCase();
    if (this.logicalMap.has(lower)) {
      return parent.locator(this.logicalMap.get(lower)!).first();
    }

    if (lower === 'save' || lower === 'create' || lower === 'guardar' || lower === 'crear') {
      return parent
        .locator('[data-testid="book-save-btn"]')
        .or(parent.getByRole('button', { name: /save|create|guardar|crear/i }))
        .first();
    }

    if (lower === 'confirm' || lower === 'confirmar') {
      return parent
        .locator('[data-testid="delete-confirm-btn"]')
        .or(parent.getByRole('button', { name: /confirm/i }))
        .first();
    }

    if (lower === 'add book' || lower === '+ add book' || lower === 'agregar libro') {
      return parent
        .locator('[data-testid="add-book-btn"]')
        .or(parent.getByRole('button', { name: /\+?\s*add book/i }))
        .first();
    }

    if (lower === 'login' || lower === 'iniciar sesión' || lower === 'sign in' || lower === 'acceder') {
      return this.page
        .frameLocator('iframe[name="secure-submit"], iframe')
        .locator('#submit, [data-testid="login-submit-btn"], button')
        .or(parent.locator('[data-testid="login-submit-btn"]'))
        .or(parent.getByRole('button', { name: /login|sign in|iniciar sesión/i }))
        .first();
    }

    const exactRegex = new RegExp(`^${identifier}$`, 'i');
    const fallbackRegex = new RegExp(identifier, 'i');

    return parent
      .getByRole('button', { name: exactRegex })
      .or(parent.locator(`[data-testid="${identifier}"]`))
      .or(parent.locator(`[data-testid="${lower}-btn"]`))
      .or(parent.locator(`[data-testid="book-${lower}-btn"]`))
      .or(parent.getByRole('button', { name: fallbackRegex }))
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

  /**
   * Localiza un mensaje de alerta, notificación, error o toast de forma agnóstica.
   */
  findAlert(textSubstring?: string): Locator {
    const baseLocator = this.page.locator(
      '[role="alert"], .alert, .alert-danger, .alert-success, .error, .error-message, .notification, .toast'
    );
    if (textSubstring) {
      return baseLocator.filter({ hasText: new RegExp(textSubstring, 'i') }).first();
    }
    return baseLocator.first();
  }

  /**
   * Localiza un checkbox o switch por etiqueta accesible, testid o id.
   */
  findCheckbox(identifier: string, container?: Locator): Locator {
    const parent = container || this.page;
    const regex = new RegExp(`^${identifier}$|${identifier}`, 'i');
    return parent
      .locator(`[data-testid="${identifier}"]`)
      .or(parent.getByRole('checkbox', { name: regex }))
      .or(parent.getByLabel(regex))
      .or(parent.locator(`input[type="checkbox"][name="${identifier}"]`))
      .or(parent.locator(`#${identifier}`))
      .first();
  }
}
