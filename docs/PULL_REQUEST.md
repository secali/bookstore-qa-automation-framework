# 🚀 Pull Request: QA Automation Framework (OmniSpec SDET Engine) & Blindaje de CI/CD

## 📋 Resumen Ejecutivo

Esta Pull Request consolida e implementa la solución completa de ingeniería de pruebas (**QA Automation Framework**) para la aplicación **BookStore QA Sandbox** (LogNext-Verisure), aplicando los estándares de un **Senior QA Automation Engineer / SDET & Test Automation Architect** (Shift-Left, pirámide 70% API / 30% UI, BDD puro con Cucumber + Playwright + TypeScript, validaciones OpenAPI/Zod y CI/CD hermético con Docker).

---

## 🎯 Objetivos y Requerimientos Cumplidos

| Requerimiento | Estado | Implementación / Evidencia |
|---|:---:|---|
| **Pirámide de Pruebas 70% API / 30% UI** | ✅ Cumplido | 13 escenarios API (68%) / 6 escenarios UI (32%). 19 escenarios en total, 100% pasando en ~30s. |
| **BDD Declarativo y Cero Step Duplication** | ✅ Cumplido | Steps genéricos universales en `tests/step-definitions/api/api.steps.ts` y `tests/step-definitions/ui/ui.steps.ts`. Sin selectores ni URLs en `.feature`. |
| **Soporte de DataTables Universales** | ✅ Cumplido | Implementado `src/support/datatable-parser.ts` para validaciones multi-campo, mutación de payloads y formularios UI en un solo paso. |
| **Aislamiento y Teardown de Datos** | ✅ Cumplido | Datos dinámicos aislados con Faker; hook `After` elimina entidades creadas; Playwright Network Listener auto-captura creaciones UI. |
| **Fábricas de Datos Aisladas** | ✅ Cumplido | `tests/fixtures/factories/book.factory.ts` y `user.factory.ts` desacopladas de clientes API y UI. |
| **Contratos OpenAPI y Schemas Zod** | ✅ Cumplido | Validación dinámica de esquemas de respuesta y envoltorio estándar de errores (`SchemaRegistry`). |
| **Seguridad y Confidencialidad CI/CD** | ✅ Cumplido | `bookstore-images.tar` eliminado del tracking git y agregado a `.gitignore`. Flujo GitHub Actions multi-estrategia sin registros públicos. |
| **Reportes y Dashboard Interactivo** | ✅ Cumplido | Reporte HTML Cucumber (`reports/cucumber-html-report.html`) y Dashboard interactivo SDET (`dashboard/index.html`). |

---

## 🛠️ Cambios Principales Realizados

### 1. 🛡️ Confidencialidad de Imágenes Docker (Air-Gapped CI/CD)
- `bookstore-images.tar` fue desvinculado del índice de Git (`git rm --cached`) y bloqueado en `.gitignore`.
- `.github/workflows/ci.yml` configurado con 3 modalidades de aprovisionamiento:
  1. Descarga autenticada segura desde GitHub Secret (`DOCKER_IMAGES_SECURE_URL`).
  2. Cache persistente de runner (`actions/cache`).
  3. Detección local en runner dedicado.
- `npm test` ejecutado secuencialmente (`parallel: 1`) para evitar invalidaciones cruzadas de sesión (`SESSION_INVALIDATED`).

### 2. 🧩 Motor de DataTables (`src/support/datatable-parser.ts`)
- Permite aserciones directas multi-campo con sintaxis declarativa sin repetición de steps:
  ```gherkin
  And the response FROM "/books" is validated with data:
    | jsonPath | Value                   |
    | $.title  | Architecture with Kafka |
    | $.price  | 45.50                   |
  ```
- Soporte para actualización masiva de payloads y llenado de formularios de diálogo/modal en UI.
- Cobertura con pruebas unitarias (`tests/unit/datatable-parser.test.ts`).

### 3. 🏭 Fábricas de Datos (`tests/fixtures/factories/`)
- Creadas `createBookPayload()` y `createUserPayload()` utilizando `@faker-js/faker`.
- Desacoplan la creación de datos de negocio tanto de los clientes HTTP como de las definiciones de pasos de UI.

### 4. 🧹 Auto-Teardown con Playwright Network Listener
- En `src/support/world.ts`, un listener sobre `page.on('response')` intercepta creaciones exitosas en la UI (`POST /api/books` con `201 Created`) y almacena los IDs generados en `createdBookIds`.
- El hook `After` (en `src/support/hooks.ts`) realiza una llamada de borrado vía API (`DELETE /api/books/:id`), garantizando que la base de datos quede siempre limpia incluso si un escenario de UI falla a mitad de su ejecución.

### 5. 📂 Reorganización Estructural
- Toda la documentación técnica se centralizó en el directorio `docs/`:
  - `docs/INFORME_REVISION_TECNICA_EXPERTOS.md`
  - `docs/STEPS_DICTIONARY.md`
  - `docs/AUDITORIA_CALIDAD_SDET.md`
  - `docs/BITACORA_PASO_A_PASO.md`
  - `docs/requirements.md`
  - `docs/test-plan.md`
  - `docs/CANDIDATE_INSTRUCTIONS.md`
- Se consolidaron los step definitions en `tests/step-definitions/api/api.steps.ts` y `tests/step-definitions/ui/ui.steps.ts`.

---

## 🧪 Matriz de Validación y Evidencias

### 1. Pruebas Unitarias
```bash
npm run test:unit
```
```text
✓ tests/unit/jsonpath.test.ts (8 tests)
✓ tests/unit/template-resolver.test.ts (6 tests)
✓ tests/unit/datatable-parser.test.ts (4 tests)

Test Files  3 passed (3)
Tests       18 passed (18)
```

### 2. Chequeo de Tipos y Linter
```bash
npx tsc --noEmit
npm run lint
```
- **TypeScript:** 0 errores.
- **ESLint:** 0 errores.

### 3. Suite Completa BDD (Cucumber + Playwright)
```bash
npm test
```
```text
19 scenarios (19 passed)
118 steps (118 passed)
0m29.351s (executing steps: 0m24.791s)
```

---

## 🚀 Instrucciones para Revisión y Despliegue

### Requisitos Previos
1. Docker Desktop o motor Docker activo.
2. Node.js v18+.

### Levantar el SUT (System Under Test)
```bash
docker load -i bookstore-images.tar
docker compose up -d
curl http://localhost:5000/api/health
```

### Ejecutar las Pruebas
```bash
# Ejecutar suite completa (API + UI)
npm test

# Ejecutar sólo API (70%)
npm run test:api

# Ejecutar sólo UI (30%)
npm run test:ui

# Abrir el Dashboard interactivo de defensa
npm run dashboard
```

---

## 📌 Checklist de Aprobación
- [x] Sin credenciales, tokens ni secretos commiteados en el repositorio.
- [x] `bookstore-images.tar` no está rastreado por Git (`.gitignore` verificado).
- [x] 100% de los escenarios pasando localmente.
- [x] Zero-warning / Zero-error en ESLint y TypeScript compiler.
- [x] Documentación exhaustiva en `docs/` y `README.md`.
