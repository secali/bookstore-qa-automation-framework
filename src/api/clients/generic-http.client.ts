import { APIRequestContext } from '@playwright/test';
import { ApiResponse } from '../types/api.types';
import { CustomWorld } from '../../support/world';

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: any;
}

export class GenericHttpClient {
  private customHeaders: Record<string, string> = {};

  constructor(
    private request: APIRequestContext,
    private world: CustomWorld
  ) {}

  setHeader(name: string, value: string): void {
    this.customHeaders[name] = value;
  }

  clearHeaders(): void {
    this.customHeaders = {};
  }

  setAuthToken(token: string): void {
    this.world.context.token = token;
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  clearAuthToken(): void {
    delete this.world.context.token;
    delete this.customHeaders['Authorization'];
  }

  private buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.customHeaders,
      ...extraHeaders
    };

    if (this.world.context.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.world.context.token}`;
    }

    return headers;
  }

  public normalizeEndpoint(endpoint: string): string {
    let clean = endpoint.trim();
    if (clean === '/auth/register' || clean === 'auth/register' || clean === '/api/auth/register') {
      return '/api/users';
    }
    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }
    if (!clean.startsWith('/api/') && clean !== '/api') {
      clean = '/api' + clean;
    }
    return clean;
  }

  async send(method: string, endpoint: string, options?: HttpRequestOptions): Promise<ApiResponse<any>> {
    const normalizedMethod = method.toUpperCase();
    const cleanEndpoint = this.normalizeEndpoint(endpoint);
    const headers = this.buildHeaders(options?.headers);

    const config: any = {
      headers,
      params: options?.params
    };

    if (options?.data !== undefined) {
      config.data = options.data;
    }

    let response: any;
    switch (normalizedMethod) {
      case 'GET':
        response = await this.request.get(cleanEndpoint, config);
        break;
      case 'POST':
        response = await this.request.post(cleanEndpoint, config);
        break;
      case 'PUT':
        response = await this.request.put(cleanEndpoint, config);
        break;
      case 'PATCH':
        response = await this.request.patch(cleanEndpoint, config);
        break;
      case 'DELETE':
        response = await this.request.delete(cleanEndpoint, config);
        break;
      default:
        throw new Error(`Método HTTP no soportado: ${method}`);
    }

    this.world.context.lastEndpoint = cleanEndpoint;
    return this.captureResponse(response);
  }

  private async captureResponse(res: any): Promise<ApiResponse<any>> {
    let body: any = {};
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    const apiResponse: ApiResponse<any> = {
      status: res.status(),
      headers: res.headers(),
      body
    };

    this.world.context.lastResponse = apiResponse;

    // Si es una creación exitosa y contiene un ID, lo guardamos para el teardown automático
    if ((res.status() === 201 || res.status() === 200) && body) {
      const generatedId = body.id || body._id || body.data?.id || body.data?._id;
      if (generatedId) {
        this.world.context.createdBookIds.push(String(generatedId));
        this.world.context.storedData['lastId'] = String(generatedId);
      }
    }

    return apiResponse;
  }
}
