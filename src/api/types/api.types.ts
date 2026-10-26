export interface ApiResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export interface UserDto {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponseDto {
  token?: string;
  user?: UserDto;
  message?: string;
}

export interface BookDto {
  id?: string;
  _id?: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn: string;
  price: number;
  category?: string;
}

export interface ApiErrorEnvelope {
  code: string;
  message: string;
  errors?: Record<string, string>;
}
