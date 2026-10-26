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
  createdBookIds: string[];
  storedData: Record<string, any>;
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
    this.apiContext = await request.newContext({
      baseURL: ENV.API_BASE_URL,
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
  }
}

setWorldConstructor(CustomWorld);
