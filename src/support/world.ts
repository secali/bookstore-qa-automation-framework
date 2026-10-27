import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { APIRequestContext, BrowserContext, Page, request } from '@playwright/test';
import { BookStoreApiClient } from '../api/clients/api.client';
import { ApiResponse } from '../api/types/api.types';
import { LoginPage } from '../ui/pages/login.page';
import { RegisterPage } from '../ui/pages/register.page';
import { BooksPage } from '../ui/pages/books.page';
import { ElementResolver } from '../ui/support/element-resolver';
import { ENV } from '../../config/env.config';

export interface ScenarioContext {
  token?: string;
  lastResponse?: ApiResponse<any>;
  lastEndpoint?: string;
  createdBookIds: string[];
  storedData: Record<string, any>;
  preparedPayload?: any;
}

export class CustomWorld extends World {
  public apiContext!: APIRequestContext;
  public apiClient!: BookStoreApiClient;
  public browserContext?: BrowserContext;
  public page?: Page;

  // Resolutor agnóstico de páginas y elementos UI
  public elementResolver?: ElementResolver;

  // Page Objects tipados
  public loginPage?: LoginPage;
  public registerPage?: RegisterPage;
  public booksPage?: BooksPage;

  // Estado compartido del escenario (equivalente a Dependency Injection en Java)
  public context: ScenarioContext = {
    createdBookIds: [],
    storedData: {}
  };

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initApiContext(): Promise<void> {
    const baseHost = ENV.API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    this.apiContext = await request.newContext({
      baseURL: baseHost,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });
    this.apiClient = new BookStoreApiClient(this.apiContext, this);
  }

  initPageObjects(page: Page): void {
    this.page = page;
    this.elementResolver = new ElementResolver(page);
    this.loginPage = new LoginPage(page);
    this.registerPage = new RegisterPage(page);
    this.booksPage = new BooksPage(page);

    // Auto-teardown listener: Intercepta cualquier creación de libro en la UI
    // para registrar su ID y garantizar su eliminación en el hook After si el test falla
    page.on('response', async (response) => {
      if (
        response.url().includes('/api/books') &&
        response.request().method() === 'POST' &&
        response.status() === 201
      ) {
        try {
          const json = await response.json();
          const id = json.id || json._id || json.data?.id || json.data?._id;
          if (id && !this.context.createdBookIds.includes(String(id))) {
            this.context.createdBookIds.push(String(id));
          }
        } catch {
          // Ignore non-JSON responses
        }
      }
    });
  }
}

setWorldConstructor(CustomWorld);
