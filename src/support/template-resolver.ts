import { faker } from '@faker-js/faker';
import { CustomWorld } from './world';

/**
 * Motor de resolución de plantillas dinámicas estilo Lego.
 * Permite usar variables y generadores dinámicos directamente en Gherkin:
 * - {{random_email}}, {{random_name}}, {{random_uuid}}, {{random_isbn}}, {{random_price}}
 * - {{token}}
 * - {{lastId}}
 * - {{alias}} (cualquier variable guardada previamente en this.context.storedData)
 */
export function resolveTemplate(template: string, world?: CustomWorld): string {
  if (!template) return template;

  return template.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (match, key: string) => {
    switch (key.toLowerCase()) {
      case 'random_email':
        return faker.internet.email().toLowerCase();
      case 'random_name':
        return faker.person.fullName();
      case 'random_uuid':
        return faker.string.uuid();
      case 'random_isbn':
        return '978' + faker.string.numeric(10);
      case 'random_price':
        return faker.commerce.price({ min: 10, max: 150 });
      case 'random_title':
        return `Atomic Item ${faker.commerce.productName()} ${faker.string.alphanumeric(4)}`;
      case 'token':
        return world?.context.token || '';
      case 'lastid':
        const ids = world?.context.createdBookIds;
        return ids && ids.length > 0 ? ids[ids.length - 1] : world?.context.storedData?.['lastId'] || '';
      default:
        // Buscar en storedData del contexto
        if (world?.context.storedData && world.context.storedData[key] !== undefined) {
          return String(world.context.storedData[key]);
        }
        return match;
    }
  });
}

/**
 * Extrae un valor anidado usando dot-notation (ej: "user.email" o "data[0].id")
 */
export function getNestedProperty(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  // Normalizar data[0].id -> data.0.id
  const normalizedPath = path.replace(/\[(\w+)\]/g, '.$1');
  const parts = normalizedPath.split('.');

  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}
