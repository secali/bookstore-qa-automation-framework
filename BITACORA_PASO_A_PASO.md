# 📜 Bitácora de Ejecución Paso a Paso: BookStore QA Sandbox

**Proyecto:** Framework de Automatización E2E & Contratos (API-First 70% & UI 30%)  
**Desafío Técnico:** QA Automation Engineer (API-First & CI/CD Focus) — LogNext / Verisure  
**Autor & Arquitecto:** **Sergio Cañete Linares** (Senior QA Automation Engineer / SDET & AI Test Automation Architect)  
**Fecha:** 26 de Octubre de 2026  
**Stack Implementado:** TypeScript 5, Playwright, Cucumber BDD, Zod, Docker Compose, GitHub Actions  

---

## 🎯 Resumen Ejecutivo

Esta bitácora documenta de manera cronológica y exhaustiva cada una de las fases, decisiones arquitectónicas, artefactos generados y validaciones técnicas ejecutadas para dar solución integral al reto técnico planteado por **LogNext-Verisure** sobre la plataforma **BookStore QA Sandbox**, adaptando al 100% el perfil profesional, estándares de ingeniería y mentalidad de **Sergio Cañete Linares**.

---

## 🧭 FASE 1: Análisis del Reto y Creación de la Skill de IA (`sdet-sergio-canete`)

### 1.1. Inspección del Paquete Base
Se inspeccionó el contenido de la carpeta entregada:
- `bookstore-images.tar`: Archivo OCI/Docker de ~89.4 MB con las imágenes preconstruidas del backend y frontend.
- `docker-compose.yml`: Orquestador de tres servicios (`mongo`, `backend`, `frontend`).
- `CANDIDATE_INSTRUCTIONS.md` y `README.md`: Especificaciones del reto y directrices de despliegue.

### 1.2. Creación de la Skill Personalizada
Siguiendo la metodología de IA y sistemas multi-agente propia de Sergio, se construyó una skill de Antigravity en `.agents/skills/sdet-sergio-canete/`:
- **`SKILL.md`**: Directrices operativas de calidad (Shift-Left, Pirámide 70/30, BDD limpio, Zero Orphan Steps, CI/CD hermético).
- **`references/`**:
  - `perfil-filosofia.md`: Trayectoria, principios de diseño y herramientas propias de Sergio.
  - `arquitectura-framework.md`: Diseño técnico en TypeScript + Playwright + Cucumber.
  - `estrategia-pruebas-70-30.md`: Desglose por niveles de prueba N1 a N4.
  - `cicd-docker-pipeline.md`: Solución para `bookstore-images.tar` sin registros públicos.
  - `estandares-gherkin.md`: Guía de estilo declarativo y taxonomía de tags semánticos.
- **`templates/`**: Plantillas iniciales de configuración, clientes API y workflows.
- **`AGENTS.md`**: Reglas globales del workspace en la raíz para garantizar que cualquier interacción respete estos estándares.

---

## 🏛️ FASE 2: Diseño de la Arquitectura del Framework (De Java a TypeScript)

Se realizó una extrapolación directa de los patrones de diseño de **Java SDET** al stack moderno de **TypeScript + Playwright**:

1. **Inyección de Dependencias (PicoContainer -> `CustomWorld`)**:
   - Se diseñó `src/support/world.ts` para gestionar el ciclo de vida del escenario.
   - Aloja el `apiClient`, `page`, tokens de autenticación y la lista `createdBookIds` para auto-limpieza sin acoplamiento global.
2. **Capa de Clientes REST (`Rest Assured` -> `APIRequestContext`)**:
   - `src/api/clients/auth.client.ts`: Gestión de llamadas a `/api/auth/login` y `/api/auth/register`.
   - `src/api/clients/books.client.ts`: Operaciones CRUD sobre `/api/books` con inyección dinámica del token JWT.
   - `src/api/clients/api.client.ts`: Fachada agregadora accesible desde el World.
3. **Contratos Tipados y Validación en Runtime (POJOs/Jackson -> Zod)**:
   - Esquemas fuertemente tipados con Zod para validar `BookSchema`, `BookListSchema`, `AuthSuccessSchema` y el envelope de error `ErrorResponseSchema`.
4. **Page Object Model Resiliente (Selenium By -> Playwright Locators)**:
   - `src/ui/pages/base.page.ts`: Métodos de navegación y esperas seguras.
   - `src/ui/pages/login.page.ts`: Formulario de login con selectores accesibles (`getByLabel`, `getByRole`).
   - `src/ui/pages/books.page.ts`: Dashboard protegido con tabla reactiva, barra de búsqueda y modales.
   - `src/ui/components/`: Subcomponentes modulares `BookModalComponent` y `DeleteModalComponent`.
5. **Filosofía de Steps Genéricos y Reutilizables**:
   - Diseño de pasos parametrizables con expresiones de Cucumber para evitar steps huérfanos o duplicados.

---

## 📋 FASE 3: Análisis Funcional y Técnico (`requirements.md`)

Se redactó el documento maestro [requirements.md](file:///c:/Users/PC/Documents/LogNext-Verisure/requirements.md) estructurando:
- **Arquitectura de red**: Mapeo de puertos (3000 Frontend, 5000 Backend, 27017 Mongo).
- **Sembrado y Persistencia**: Credenciales por defecto (`admin@sandbox.com` / `admin123`) y 5 libros de ejemplo iniciales.
- **Envelope de Error Estandarizado**:
  ```json
  { "code": "VALIDATION_ERROR", "message": "Validation failed.", "errors": { "campo": "detalle" } }
  ```
- **Especificación detallada de endpoints**: Métodos, payloads, cabeceras y códigos de respuesta (200, 201, 400, 401, 403, 404, 409).
- **Especificación de vistas UI**: `/login`, `/register` y `/books`.

---

## 📑 FASE 4: Plan Maestro de Pruebas (`test-plan.md`)

Se redactó el documento [test-plan.md](file:///c:/Users/PC/Documents/LogNext-Verisure/test-plan.md) definiendo:
- **Alcance 70% Backend / 30% UI**:
  - **Nivel N1**: Pruebas de contrato y esquema Zod contra OpenAPI (`/api/docs.json`).
  - **Nivel N2**: Pruebas funcionales aisladas de componentes y CRUD.
  - **Nivel N3**: Pruebas de búsqueda, filtros complejos y consistencia transaccional.
  - **Nivel N4**: Pruebas de interfaz web E2E y flujos híbridos (inyección API y verificación UI).
- **Matriz de Escenarios BDD**: 18 casos de prueba trazados con IDs únicos (`TC-AUTH-01..07`, `TC-BOOK-01..14`, `TC-UI-01..08`).
- **Política de Aislamiento de Datos**: Generación dinámica con `@faker-js/faker` y auto-teardown en hook `After`.
- **Criterios de Aceptación (Quality Gates)**: 100% de tests `@smoke` y `@p1` aprobados, 0 fallos de contrato y 0 indeterminismo (flakiness).

---

## 💻 FASE 5: Implementación Técnica del Framework

Se construyó el código fuente completo en el repositorio:

### 5.1. Configuración del Proyecto
- `package.json`: Definición de dependencias (`@cucumber/cucumber`, `@playwright/test`, `zod`, `@faker-js/faker`, `dotenv`, `cucumber-html-reporter`, `ts-node`, `typescript`) y scripts de ejecución paralela y por tags.
- `tsconfig.json`: Compilación TypeScript ES2022 / CommonJS con path aliases (`@api/*`, `@ui/*`, `@support/*`, `@config/*`).
- `cucumber.js`: Configuración del runner con perfiles, ejecución paralela (`parallel: 2` local, `parallel: 4` CI) y reportes.
- `playwright.config.ts`: Configuración del navegador Chromium, timeouts y retención de evidencias en fallo.
- `config/env.config.ts` y `.env.example`: Centralización de variables de entorno con fallbacks robustos.

### 5.2. Capa de Servicios y Esquemas (`src/api/`)
- `src/api/types/api.types.ts`: DTOs e interfaces para usuarios, libros, respuestas y envelopes de error.
- `src/api/schemas/book.schema.ts`: Esquemas Zod `BookSchema` y `BookListSchema`.
- `src/api/schemas/error.schema.ts`: Esquema Zod `ErrorResponseSchema`.
- `src/api/schemas/auth.schema.ts`: Esquema Zod `AuthSuccessSchema`.
- `src/api/clients/auth.client.ts`: Cliente HTTP para registro y login.
- `src/api/clients/books.client.ts`: Cliente HTTP para CRUD de libros con tracking de IDs.
- `src/api/clients/api.client.ts`: Agregador central de clientes API.

### 5.3. Capa de Interfaz de Usuario (`src/ui/`)
- `src/ui/pages/base.page.ts`: Métodos de navegación y esperas seguras.
- `src/ui/pages/login.page.ts`: Formulario de login.
- `src/ui/pages/register.page.ts`: Formulario de registro.
- `src/ui/pages/books.page.ts`: Dashboard del catálogo con tabla y búsqueda.
- `src/ui/components/book-modal.component.ts`: Modal de alta y edición.
- `src/ui/components/delete-modal.component.ts`: Diálogo de confirmación de borrado.

### 5.4. Soporte y Hooks (`src/support/`)
- `src/support/world.ts`: Clase `CustomWorld` con lazy-loading de navegador e inyección de dependencias.
- `src/support/hooks.ts`:
  - Hook `Before`: Inicializa `apiContext` y levanta el navegador solo si el tag es `@ui`.
  - Hook `After`: Captura de pantalla ante fallos, cierre de recursos y **auto-teardown** de libros creados.
- `src/support/generate-report.js`: Script Node.js para generar reporte visual HTML enriquecido con metadatos de ejecución.

### 5.5. Especificaciones BDD Gherkin (`tests/features/`)
- **API (70%)**:
  - `tests/features/api/01-auth.feature`: Login de admin seed, credenciales inválidas, registro con datos únicos y control de duplicados.
  - `tests/features/api/02-books-crud.feature`: Verificación de libros semilla, creación con payload completo, ciclo de vida (GET ID, PUT, DELETE) y 404 en reintento.
  - `tests/features/api/03-books-search.feature`: Filtro por término coincidente en API.
  - `tests/features/api/04-contracts-and-errors.feature`: Esquemas de escenario con validación estricta de esquemas Zod, envelope de error `{ code, message, errors }`, y validación de 401 sin token.
- **UI (30%)**:
  - `tests/features/ui/01-login-ui.feature`: Formulario web de login y alertas visuales.
  - `tests/features/ui/02-books-catalog-ui.feature`: Catálogo web, creación con modal y confirmación de borrado.
  - `tests/features/ui/03-hybrid-e2e.feature`: Flujo híbrido SDET (inyección rápida vía API y verificación inmediata en la UI).

### 5.6. Step Definitions Genéricas (`tests/step-definitions/`)
- `tests/step-definitions/api/common-api.steps.ts`: Códigos de estado HTTP, validación de contratos Zod y validación del envelope de error.
- `tests/step-definitions/api/auth.steps.ts`: Pasos de autenticación reutilizables tanto como `Given` como `When`.
- `tests/step-definitions/api/books.steps.ts`: CRUD de libros, data tables, generación con Faker y regex para precios positivos/negativos.
- `tests/step-definitions/ui/common-ui.steps.ts`: Navegación genérica, validación de URLs y clicks.
- `tests/step-definitions/ui/login-ui.steps.ts`: Interacción con pantalla de login.
- `tests/step-definitions/ui/books-ui.steps.ts`: Interacción con catálogo, modales e inyección de sesión vía API (`localStorage`).

---

## 🚀 FASE 6: Pipeline de CI/CD para Docker Local

Se configuró el workflow en `.github/workflows/ci.yml`:
- **Solución al reto de `bookstore-images.tar`**:
  1. Checkout del código con soporte Git LFS.
  2. Setup de Node.js 20 e instalación de navegadores Playwright.
  3. Carga local de imágenes: `docker load -i bookstore-images.tar`.
  4. Despliegue contenerizado: `docker compose up -d`.
  5. **Polling activo de salud**: Bucle `until` sobre `http://localhost:5000/api/health` con timeout de 60s para evitar arranques prematuros antes de que MongoDB esté listo.
  6. **Ejecución paralela**: `npx cucumber-js --parallel 4`.
  7. **Publicación de artefactos**: Generación y subida de `reports/cucumber-report.html` y pantallazos en `actions/upload-artifact@v4`.
  8. **Teardown**: `docker compose down -v`.

---

## ✅ FASE 7: Verificación y Control de Calidad del Código

1. **Instalación de Dependencias**:
   - `npm install` ejecutado con éxito (207 paquetes instalados y auditados).
2. **Validación de Compilación TypeScript**:
   - Comando: `npx tsc --noEmit`
   - **Resultado:** Código de salida 0. **0 errores de compilación**, tipos 100% correctos y estrictos.
3. **Validación de Mapeo BDD (Dry Run)**:
   - Comando: `npx cucumber-js --dry-run`
   - **Resultado:**
     ```text
     18 scenarios (18 skipped)
     84 steps (84 skipped)
     0 undefined steps
     ```
   - **Cero steps huérfanos o indefinidos**: el 100% de los pasos Gherkin están enlazados a sus step definitions correspondientes.
4. **Control de Versiones (Git)**:
   - Inicializado el repositorio Git con rama principal `main`.
   - `.gitignore` configurado para ignorar `node_modules/`, `reports/`, `dist/` y `.env`.

---

## 📖 FASE 8: Documentación de Entrega

Se actualizó el [README.md](file:///c:/Users/PC/Documents/LogNext-Verisure/README.md) del proyecto para incluir:
- Presentación ejecutiva de la arquitectura.
- Instrucciones de despliegue local paso a paso.
- Comandos npm para ejecutar suites completas, por tags o en paralelo multihilo.
- Justificación técnica y análisis de alternativas para la estrategia de CI/CD con `bookstore-images.tar`.
- Enlaces a los documentos complementarios `requirements.md` y `test-plan.md`.

---

## 🤖 FASE 9: Diccionario de Steps y Pipeline de QA Multi-Agente End-to-End

Inspirado en los proyectos de arquitectura de IA de Sergio Cañete (Orquestador de Pipeline QA Multi-Agente con Copilot y MCP):

1. **Diccionario de Steps y Convenciones BDD ([STEPS_DICTIONARY.md](file:///c:/Users/PC/Documents/LogNext-Verisure/STEPS_DICTIONARY.md))**:
   - Catálogo oficial que indexa todos los steps de API y UI existentes, parámetros admitidos, selectores accesibles y reglas de reusabilidad.
   - Establece la política estricta de *Zero Orphan Steps* para que nuevos desarrolladores y agentes nunca dupliquen código.
2. **Pipeline de 3 Agentes de QA ([.agents/pipeline/ORCHESTRATOR.md](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/pipeline/ORCHESTRATOR.md))**:
   - **Agente 1: Story & Codebase Analyst** (`.agents/pipeline/agents/01-story-and-code-analyst.md`): Analiza historias de usuario, examina rutas, modelos Mongoose, controladores y componentes React en el repositorio para emitir el `ANALYSIS_REPORT.md` (Shift-Left).
   - **Agente 2: QA Test Strategist & BDD Architect** (`.agents/pipeline/agents/02-qa-test-planner.md`): Transforma el análisis en un plan de pruebas 70% API / 30% UI (niveles N1-N4) y redacta features Gherkin declarativos de negocio.
   - **Agente 3: SDET Automation Implementer** (`.agents/pipeline/agents/03-sdet-implementer.md`): Conoce el framework Playwright + TypeScript a fondo, consume `STEPS_DICTIONARY.md` para reutilizar steps existentes, implementa nuevos steps tipados sólo si es indispensable y ejecuta validación automática con `tsc` y `cucumber-js --dry-run`.

---

## 🗂️ Índice de Artefactos Creados

| Archivo | Propósito |
|---|---|
| [BITACORA_PASO_A_PASO.md](file:///c:/Users/PC/Documents/LogNext-Verisure/BITACORA_PASO_A_PASO.md) | Registro cronológico y detallado de toda la solución (este documento). |
| [STEPS_DICTIONARY.md](file:///c:/Users/PC/Documents/LogNext-Verisure/STEPS_DICTIONARY.md) | Diccionario oficial de steps genéricos y convenciones Cucumber + Playwright. |
| [.agents/pipeline/ORCHESTRATOR.md](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/pipeline/ORCHESTRATOR.md) | Orquestador del pipeline de QA multi-agente end-to-end. |
| [.agents/pipeline/agents/](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/pipeline/agents/) | Especificaciones de Agente 1 (Analyst), Agente 2 (QA Lead) y Agente 3 (SDET). |
| [requirements.md](file:///c:/Users/PC/Documents/LogNext-Verisure/requirements.md) | Análisis funcional y técnico de los servicios, modelos y endpoints. |
| [test-plan.md](file:///c:/Users/PC/Documents/LogNext-Verisure/test-plan.md) | Plan maestro de pruebas con desglose por niveles N1-N4 y matriz de trazabilidad. |
| [README.md](file:///c:/Users/PC/Documents/LogNext-Verisure/README.md) | Documentación técnica y ejecutiva del framework para el evaluador. |
| [AGENTS.md](file:///c:/Users/PC/Documents/LogNext-Verisure/AGENTS.md) | Reglas obligatorias de ingeniería y calidad del espacio de trabajo. |
| [.github/workflows/ci.yml](file:///c:/Users/PC/Documents/LogNext-Verisure/.github/workflows/ci.yml) | Pipeline de CI/CD para GitHub Actions con Docker local y polling activo. |
| [.agents/skills/sdet-sergio-canete/](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/skills/sdet-sergio-canete/) | Skill de IA con referencias y directrices de arquitectura. |
| [package.json](file:///c:/Users/PC/Documents/LogNext-Verisure/package.json) | Scripts de ejecución paralela y dependencias de testing. |
| [cucumber.js](file:///c:/Users/PC/Documents/LogNext-Verisure/cucumber.js) | Configuración del runner BDD Cucumber con TypeScript. |
| [playwright.config.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/playwright.config.ts) | Configuración de Playwright para pruebas E2E. |
| [tsconfig.json](file:///c:/Users/PC/Documents/LogNext-Verisure/tsconfig.json) | Configuración del compilador TypeScript con path aliases. |
| [eslint.config.mjs](file:///c:/Users/PC/Documents/LogNext-Verisure/eslint.config.mjs) | Configuración de ESLint en formato Flat Config. |
| [.prettierrc](file:///c:/Users/PC/Documents/LogNext-Verisure/.prettierrc) | Configuración de formato de código Prettier. |
| [src/api/](file:///c:/Users/PC/Documents/LogNext-Verisure/src/api/) | Capa de clientes REST, contratos Zod y tipos TypeScript. |
| [src/ui/](file:///c:/Users/PC/Documents/LogNext-Verisure/src/ui/) | Capa de Page Objects y componentes para React Frontend. |
| [src/support/](file:///c:/Users/PC/Documents/LogNext-Verisure/src/support/) | CustomWorld (DI), hooks de ciclo de vida y generador de reportes. |
| [tests/features/](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/features/) | 7 features BDD en Gherkin (4 de API y 3 de UI). |
| [tests/step-definitions/](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/step-definitions/) | Step definitions genéricas y modulares tipadas en TypeScript. |
