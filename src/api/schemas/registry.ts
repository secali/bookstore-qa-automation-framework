import { z } from 'zod';
import { BookSchema, BookListSchema } from './book.schema';
import { AuthSuccessSchema } from './auth.schema';
import { ErrorResponseSchema } from './error.schema';

/**
 * Universal OpenAPI / Zod Contract Schema Registry
 * Permite registrar y resolver cualquier esquema de validación sin modificar los step definitions.
 */
export class SchemaRegistry {
  private static schemas: Map<string, z.ZodTypeAny> = new Map();

  /**
   * Registra un nuevo esquema en tiempo de ejecución o inicialización.
   */
  static register(name: string, schema: z.ZodTypeAny): void {
    this.schemas.set(name.toLowerCase(), schema);
  }

  /**
   * Obtiene un esquema registrado por nombre semántico.
   */
  static get(name: string): z.ZodTypeAny | undefined {
    return this.schemas.get(name.toLowerCase());
  }

  /**
   * Comprueba si un esquema existe en el registro.
   */
  static has(name: string): boolean {
    return this.schemas.has(name.toLowerCase());
  }

  /**
   * Devuelve la lista de esquemas disponibles en el registro.
   */
  static getAvailableSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }
}

// Registro inicial de esquemas de BookStore
SchemaRegistry.register('book', BookSchema);
SchemaRegistry.register('bookresponse', BookSchema);
SchemaRegistry.register('booklist', BookListSchema);
SchemaRegistry.register('bookslist', BookListSchema);
SchemaRegistry.register('listadelibros', BookListSchema);
SchemaRegistry.register('auth', AuthSuccessSchema);
SchemaRegistry.register('authresponse', AuthSuccessSchema);
SchemaRegistry.register('error', ErrorResponseSchema);
SchemaRegistry.register('errorresponse', ErrorResponseSchema);
