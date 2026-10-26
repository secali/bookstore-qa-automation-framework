# 🌐 Plantilla: Custom World, Cliente API y Hooks

Implementación de la infraestructura central en TypeScript que orquesta las llamadas API y el ciclo de vida de Cucumber.

---

## 1. `src/support/world.ts`

```typescript
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { APIRequestContext, BrowserContext, Page, request } from '@playwright/test';
import { BookStoreApiClient } from '../api/clients/api.client';

export interface CustomWorldContext {
  token?: string;
  lastResponse?: {
    status: number;
    headers: Record<string, string>;
    body: any;
  };
  createdBookIds: string[];
}

export class CustomWorld extends World {
  public apiContext!: APIRequestContext;
  public apiClient!: BookStoreApiClient;
  public browserContext?: BrowserContext;
  public page?: Page;
  public context: CustomWorldContext = {
    createdBookIds: []
  };

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initApiContext() {
    this.apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:5000/api',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    this.apiClient = new BookStoreApiClient(this.apiContext, this);
  }
}

setWorldConstructor(CustomWorld);
```

---

## 2. `src/api/clients/books.client.ts`

```typescript
import { APIRequestContext } from '@playwright/test';
import { CustomWorld } from '../../support/world';

export interface BookPayload {
  title: string;
  author: string;
  isbn: string;
  price: number;
  category?: string;
}

export class BooksClient {
  constructor(
    private request: APIRequestContext,
    private world: CustomWorld
  ) {}

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.world.context.token) {
      headers['Authorization'] = `Bearer ${this.world.context.token}`;
    }
    return headers;
  }

  async getAllBooks(params?: Record<string, string>) {
    const res = await this.request.get('/books', {
      headers: this.getHeaders(),
      params
    });
    return this.captureResponse(res);
  }

  async getBookById(id: string) {
    const res = await this.request.get(`/books/${id}`, {
      headers: this.getHeaders()
    });
    return this.captureResponse(res);
  }

  async createBook(data: BookPayload) {
    const res = await this.request.post('/books', {
      headers: this.getHeaders(),
      data
    });
    const parsed = await this.captureResponse(res);
    if (res.status() === 201 && (parsed.body._id || parsed.body.id)) {
      this.world.context.createdBookIds.push(parsed.body._id || parsed.body.id);
    }
    return parsed;
  }

  async updateBook(id: string, data: Partial<BookPayload>) {
    const res = await this.request.put(`/books/${id}`, {
      headers: this.getHeaders(),
      data
    });
    return this.captureResponse(res);
  }

  async deleteBook(id: string) {
    const res = await this.request.delete(`/books/${id}`, {
      headers: this.getHeaders()
    });
    return this.captureResponse(res);
  }

  private async captureResponse(res: any) {
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    this.world.context.lastResponse = {
      status: res.status(),
      headers: res.headers(),
      body
    };

    return { status: res.status(), headers: res.headers(), body };
  }
}
```

---

## 3. `src/support/hooks.ts`

```typescript
import { Before, After, Status } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { CustomWorld } from './world';

Before(async function (this: CustomWorld, scenario) {
  // Inicialización de cliente API para todos los escenarios
  await this.initApiContext();

  // Si el escenario tiene tag @ui, levantamos navegador de Playwright
  const isUi = scenario.pickle.tags.some(tag => tag.name === '@ui');
  if (isUi) {
    const browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false'
    });
    this.browserContext = await browser.newContext({
      baseURL: process.env.UI_BASE_URL || 'http://localhost:3000'
    });
    this.page = await this.browserContext.newPage();
  }
});

After(async function (this: CustomWorld, scenario) {
  // 1. Captura de pantalla si falló un escenario UI
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({
      fullPage: true,
      path: `reports/screenshots/${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    });
    this.attach(screenshot, 'image/png');
  }

  // 2. Limpieza de navegador
  if (this.page) {
    await this.page.close();
  }
  if (this.browserContext) {
    await this.browserContext.close();
  }

  // 3. Auto-Teardown de datos creados por la API
  if (this.context.createdBookIds.length > 0 && this.context.token) {
    for (const bookId of this.context.createdBookIds) {
      try {
        await this.apiClient.books.deleteBook(bookId);
      } catch (err) {
        console.warn(`[Teardown] No se pudo eliminar el libro temporal ${bookId}`);
      }
    }
  }

  // 4. Cierre del contexto HTTP
  if (this.apiContext) {
    await this.apiContext.dispose();
  }
});
```
