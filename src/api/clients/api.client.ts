import { APIRequestContext } from '@playwright/test';
import { AuthClient } from './auth.client';
import { BooksClient } from './books.client';
import { CustomWorld } from '../../support/world';

import { GenericHttpClient } from './generic-http.client';

export class BookStoreApiClient {
  public auth: AuthClient;
  public books: BooksClient;
  public http: GenericHttpClient;

  constructor(
    private request: APIRequestContext,
    private world: CustomWorld
  ) {
    this.auth = new AuthClient(this.request, this.world);
    this.books = new BooksClient(this.request, this.world);
    this.http = new GenericHttpClient(this.request, this.world);
  }

  async checkHealth() {
    return this.request.get('/health');
  }
}
