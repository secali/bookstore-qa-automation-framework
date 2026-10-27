import { faker } from '@faker-js/faker';

export interface BookPayload {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  price: number;
  category: string;
}

/**
 * Factory for creating dynamic, isolated Book test data payloads.
 * Supports partial overrides for boundary value analysis and negative testing.
 */
export function createBookPayload(overrides: Partial<BookPayload> = {}): BookPayload {
  return {
    title: `Book ${faker.commerce.productName()} ${faker.string.alphanumeric(4)}`,
    author: faker.person.fullName(),
    isbn: `978-${faker.string.numeric(1)}-${faker.string.numeric(3)}-${faker.string.numeric(5)}-${faker.string.numeric(1)}`,
    publishedYear: 2024,
    price: parseFloat(faker.commerce.price({ min: 10, max: 99, dec: 2 })),
    category: faker.helpers.arrayElement(['Tech', 'Software', 'Architecture', 'Design', 'QA']),
    ...overrides
  };
}
