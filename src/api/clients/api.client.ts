import { APIRequestContext } from '@playwright/test';
import { AuthClient } from './auth.client';
import { BooksClient } from './books.client';
import { CustomWorld } from '../../support/world';

export class BookStoreApiClient {
  public auth: AuthClient;
  public books: BooksClient;

  constructor(
    private request: APIRequestContext,
    private world: CustomWorld
  ) {
    this.auth = new AuthClient(this.request, this.world);
    this.books = new BooksClient(this.request, this.world);
  }

  async checkHealth() {
    return this.request.get('/health');
  }
}
