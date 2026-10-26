# 🏛️ Arquitectura del Framework de Automatización

Este documento describe la arquitectura técnica propuesta por **Sergio Cañete Linares** para el proyecto **BookStore QA Sandbox**, optimizada para máxima velocidad, mantenimiento limpio y ejecución paralela.

---

## 🧰 Stack Tecnológico

| Componente | Tecnología | Justificación de Arquitectura |
|---|---|---|
| **Lenguaje** | TypeScript 5.x | Tipado estricto para contratos de API (DTOs), modelos de datos y reducción de errores en tiempo de compilación. |
| **Driver de Automatización** | Playwright (`@playwright/test`) | Motor de alto rendimiento tanto para llamadas HTTP (`APIRequestContext`) como para navegación web (Chromium/Firefox/WebKit). |
| **Capa BDD** | Cucumber (`@cucumber/cucumber`) | Soporte para especificaciones Gherkin, tags semánticos, ejecución paralela de escenarios y reportes estándar. |
| **Validación de Esquemas** | Zod | Validación tipada de contratos OpenAPI y esquemas de respuesta en tiempo de ejecución. |
| **Utilidades de Prueba** | `@faker-js/faker` | Generación dinámica de datos aleatorios pero válidos (evita colisiones de títulos o ISBNs). |
| **Reportes** | Multiple Cucumber HTML Reporter / Allure | Trazabilidad visual de ejecuciones, pantallazos automáticos en fallo y logs adjuntos. |

---

## 📁 Estructura de Directorios

```text
bookstore-qa-automation/
├── .agents/                          # Customizaciones y contexto para agentes de IA
│   └── skills/sdet-sergio-canete/   # Skill de Sergio Cañete
├── .github/
│   └── workflows/
│       └── ci.yml                   # Pipeline de CI/CD para GitHub Actions
├── config/
│   └── env.config.ts                # Variables de entorno centralizadas (URLs, credenciales seed)
├── src/
│   ├── api/                         # 70% CAPA BACKEND
│   │   ├── clients/
│   │   │   ├── auth.client.ts       # Cliente para /api/auth (login, register)
│   │   │   └── books.client.ts      # Cliente para /api/books (CRUD, search, stats)
│   │   ├── schemas/
│   │   │   ├── book.schema.ts       # Schemas Zod para Book, BookList, BookStats
│   │   │   └── error.schema.ts      # Schema Zod para Envelope de Error
│   │   └── types/
│   │       ├── api.types.ts         # DTOs e interfaces de respuesta
│   │       └── auth.types.ts        # Interfaces de usuario y tokens
│   ├── ui/                          # 30% CAPA FRONTEND
│   │   ├── pages/
│   │   │   ├── base.page.ts         # Clase base con esperas explícitas y utilidades comunes
│   │   │   ├── login.page.ts        # Page Object: /login
│   │   │   ├── register.page.ts     # Page Object: /register
│   │   │   └── books.page.ts        # Page Object: /books (tabla, modales, búsqueda)
│   │   └── components/
│   │       ├── book-modal.component.ts   # Modal de creación y edición
│   │       └── delete-modal.component.ts # Modal de confirmación de borrado
│   └── support/                     # INFRAESTRUCTURA CUCUMBER & PLAYWRIGHT
│       ├── world.ts                 # CustomWorld: contexto compartido entre steps
│       ├── hooks.ts                 # Hooks Before, After, BeforeAll, AfterAll
│       └── storage-state.helper.ts  # Generador de estados de sesión autenticada
├── tests/
│   ├── features/
│   │   ├── api/                     # Features de API (70%)
│   │   │   ├── 01-auth.feature      # Login, registro, token expirado, roles
│   │   │   ├── 02-books-crud.feature# POST, GET, PUT, DELETE de libros
│   │   │   ├── 03-books-search.feature # Filtros, paginación, búsqueda
│   │   │   └── 04-contracts.feature # Validación estricta de schemas y errores
│   │   └── ui/                      # Features de UI (30%)
│   │       ├── 01-login-ui.feature  # Validación de formularios y acceso UI
│   │       ├── 02-books-ui.feature  # Gestión visual del catálogo
│   │       └── 03-hybrid-e2e.feature# Creación en API -> Verificación en UI
│   └── step-definitions/
│       ├── api/
│       │   ├── auth.steps.ts
│       │   ├── books.steps.ts
│       │   └── common-api.steps.ts
│       └── ui/
│           ├── login.steps.ts
│           └── books.steps.ts
├── cucumber.js                      # Configuración de Cucumber CLI (tags, parallel, reportes)
├── playwright.config.ts             # Configuración del motor Playwright
├── tsconfig.json                    # Compilador TypeScript
└── package.json                     # Scripts y dependencias
```

---

## 🧩 Capas de Abstracción

### 1. CustomWorld (`src/support/world.ts`)
Cucumber requiere aislar el estado de cada escenario para permitir ejecución en paralelo sin carreras:
- Instancia única de `APIRequestContext` por escenario.
- Instancia opcional de `Page` y `BrowserContext` creada bajo demanda (lazy-loaded solo para escenarios con tag `@ui`).
- Almacenamiento efímero del escenario:
  - `response`: Última respuesta HTTP recibida (status, headers, body).
  - `authToken`: Token JWT activo en la prueba.
  - `createdBookIds`: Lista de IDs creados durante el escenario para auto-limpieza en el hook `After`.

### 2. Clientes API Tipados (`src/api/clients/`)
Encapsulan las peticiones HTTP y manejan automáticamente:
- Inyección del header `Authorization: Bearer <token>`.
- Parseo automático a JSON.
- Métodos semánticos: `api.books.create(data)`, `api.books.getById(id)`, `api.books.update(id, data)`, `api.books.delete(id)`.

### 3. Page Objects Resilientes (`src/ui/pages/`)
- Uso exclusivo de selectores accesibles de Playwright:
  - `page.getByRole('button', { name: 'Guardar' })`
  - `page.getByLabel('Título')`
  - `page.getByRole('table')`
- Evitar selectores CSS frágiles (ej. `div.modal > form > div:nth-child(2) > input`).

### 4. Hybrid Flow & State Reuse (Playwright `storageState`)
Para acelerar los tests de UI que requieren login previo:
1. Una llamada rápida a `POST /api/auth/login` obtiene el JWT.
2. Se inyecta en el `BrowserContext` mediante cookies o `localStorage`.
3. El navegador navega directamente a `/books` ya autenticado, ahorrando 2-3 segundos por test.
