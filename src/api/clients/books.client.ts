import { APIRequestContext } from '@playwright/test';
import { ApiResponse, BookDto, CreateBookPayload } from '../types/api.types';
import { CustomWorld } from '../../support/world';

export class BooksClient {
  constructor(
    private request: APIRequestContext,
    private world: CustomWorld
  ) {}

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.world.context.token) {
      headers['Authorization'] = `Bearer ${this.world.context.token}`;
    }
    return headers;
  }

  async getAllBooks(params?: Record<string, string | number>): Promise<ApiResponse<BookDto[]>> {
    const res = await this.request.get('/api/books', {
      headers: this.getHeaders(),
      params: params ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) : undefined
    });
    return this.captureResponse<BookDto[]>(res);
  }

  async getBookById(id: string): Promise<ApiResponse<BookDto>> {
    const res = await this.request.get(`/api/books/${id}`, {
      headers: this.getHeaders()
    });
    return this.captureResponse<BookDto>(res);
  }

  async createBook(data: CreateBookPayload, customToken?: string): Promise<ApiResponse<BookDto>> {
    const headers = this.getHeaders();
    if (customToken !== undefined) {
      if (customToken === '') {
        delete headers['Authorization'];
      } else {
        headers['Authorization'] = `Bearer ${customToken}`;
      }
    }

    const res = await this.request.post('/api/books', {
      headers,
      data
    });
    const parsed = await this.captureResponse<BookDto>(res);

    if (res.status() === 201 && parsed.body) {
      const bookId = parsed.body.id || parsed.body._id;
      if (bookId) {
        this.world.context.createdBookIds.push(bookId);
      }
    }

    return parsed;
  }

  async updateBook(id: string, data: Partial<CreateBookPayload>): Promise<ApiResponse<BookDto>> {
    const res = await this.request.put(`/api/books/${id}`, {
      headers: this.getHeaders(),
      data
    });
    return this.captureResponse<BookDto>(res);
  }

  async deleteBook(id: string): Promise<ApiResponse<any>> {
    const res = await this.request.delete(`/api/books/${id}`, {
      headers: this.getHeaders()
    });
    return this.captureResponse<any>(res);
  }

  private async captureResponse<T>(res: any): Promise<ApiResponse<T>> {
    let body: any = {};
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    const apiResponse: ApiResponse<T> = {
      status: res.status(),
      headers: res.headers(),
      body
    };

    this.world.context.lastResponse = apiResponse;
    return apiResponse;
  }
}
