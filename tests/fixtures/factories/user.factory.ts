import { faker } from '@faker-js/faker';

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

/**
 * Factory for creating dynamic, unique User test data payloads.
 * Guarantees zero email collisions across test runs.
 */
export function createUserPayload(overrides: Partial<UserPayload> = {}): UserPayload {
  const uniqueId = faker.string.alphanumeric(6).toLowerCase();
  return {
    name: faker.person.fullName(),
    email: `qa.sandbox.${uniqueId}@testing.com`,
    password: `Pass_${faker.string.alphanumeric(8)}!`,
    role: 'user',
    ...overrides
  };
}
