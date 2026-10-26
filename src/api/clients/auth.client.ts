import { APIRequestContext } from '@playwright/test';
import { ApiResponse, AuthResponseDto } from '../types/api.types';
import { CustomWorld } from '../../support/world';

export class AuthClient {
  constructor(
    private request: APIRequestContext,
    private world: CustomWorld
  ) {}

  async login(email: string, password: string): Promise<ApiResponse<AuthResponseDto>> {
    const res = await this.request.post('/auth/login', {
      data: { email, password }
    });
    return this.captureResponse<AuthResponseDto>(res);
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponseDto>> {
    const res = await this.request.post('/auth/register', {
      data: { name, email, password }
    });
    return this.captureResponse<AuthResponseDto>(res);
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
    if (res.status() === 200 && body.token) {
      this.world.context.token = body.token;
    }
    return apiResponse;
  }
}
