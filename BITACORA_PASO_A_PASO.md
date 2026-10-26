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

## 🎯 FASE 10: Generalización Total, Taxonomía ISTQB y Auditoría Integral SDET

Atendiendo a la instrucción explícita del evaluador para reforzar la filosofía de **cero tests acoplados a una sola página o endpoint**, se realizaron las siguientes actuaciones clave:

1. **Ampliación del Motor Atómico y Agnóstico (`ElementResolver` y `GenericHttpClient`)**:
   - Incorporación de resolución universal de alertas, mensajes de error y notificaciones (`findAlert(textSubstring)`).
   - Incorporación de soporte universal para checkboxes y selectores accesibles (`findCheckbox`).
   - Métodos en `GenericHttpClient` para control programático de tokens (`setAuthToken`, `clearAuthToken`).
2. **Eliminación de Pasos Específicos Redundantes**:
   - Se refactorizó `tests/step-definitions/ui/login-ui.steps.ts` para eliminar el step acoplado de alerta y utilizar el step universal de `tests/step-definitions/ui/atomic-ui.steps.ts` (`Then an error alert message should be displayed on screen`).
   - Todos los modales, tablas, alertas y campos operan bajo los steps genéricos de `atomic-ui.steps.ts` y `atomic-api.steps.ts`.
3. **Etiquetado Formal según Estándares ISTQB**:
   - Los 21 escenarios de la suite (9 archivos `.feature`) fueron etiquetados exhaustivamente con taxonomía ISTQB:
     - **Niveles**: `@integration-test`, `@system-test`, `@system-integration-test`.
     - **Tipos**: `@functional`, `@security`, `@contract`, `@usability`, `@reliability`.
     - **Técnicas de Diseño**: `@boundary-value-analysis`, `@equivalence-partitioning`, `@state-transition`, `@error-guessing`.
     - **Enfoque / Polaridad**: `@positive-testing`, `@negative-testing`.
     - **Ejecución y Alcance**: `@smoke`, `@regression`, `@p1`, `@atomic`, `@generic`, `@hybrid`.
4. **Actualización de Agentes del Pipeline (`.agents/pipeline/`)**:
   - `03-sdet-implementer.md` actualizado con la Regla de Oro: **Prohibido crear tests o steps específicos de una sola página o endpoint**.
   - `02-qa-test-planner.md` y `01-story-and-code-analyst.md` actualizados con la taxonomía ISTQB y directrices de abstracción en piezas de puzzle.
   - `STEPS_DICTIONARY.md` actualizado con todos los nuevos steps y la tabla de taxonomía ISTQB.
5. **Auditoría Técnica SDET ([AUDITORIA_CALIDAD_SDET.md](file:///c:/Users/PC/Documents/LogNext-Verisure/AUDITORIA_CALIDAD_SDET.md))**:
   - Informe exhaustivo evaluando el aprovechamiento de Playwright (`APIRequestContext`, Web-First Assertions, inyección de sesión con `addInitScript`), el desacoplamiento de páginas/endpoints, y el paso exitoso del Quality Gate de 4 pasos (0 errores, 0 warnings, 0 steps huérfanos).

---

## 🚀 FASE 11: Purificación de la Arquitectura: Cero Steps de Dominio y Motor Universal JSONPath

En respuesta al análisis arquitectónico planteado por el evaluador, se ejecutó la consolidación definitiva hacia la arquitectura pura de **piezas de puzzle genéricas**:

1. **Eliminación Total de Step Definitions de Dominio Específico**:
   - Se auditaron y eliminaron los archivos `auth.steps.ts`, `books.steps.ts`, `login-ui.steps.ts` y `books-ui.steps.ts`, erradicando el acoplamiento a entidades y pantallas individuales.
   - La suite queda estructurada exclusivamente en 4 motores universales:
     - `tests/step-definitions/api/atomic-api.steps.ts`
     - `tests/step-definitions/api/common-api.steps.ts`
     - `tests/step-definitions/ui/atomic-ui.steps.ts`
     - `tests/step-definitions/ui/common-ui.steps.ts`
2. **Implementación del Motor Universal JSONPath ([src/support/jsonpath.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/support/jsonpath.ts))**:
   - Módulo tipado en TypeScript con cero dependencias externas para resolver, mutar y eliminar propiedades por ruta JSONPath (`$.title`, `$.data[0].id`, `$.errors.isbn`).
   - Permite preparar plantillas JSON base (`Given the user prepares a JSON payload:`) y mutar atributos dinámicamente (`When the user sets JSONPath "$.price" to 49.99` o `When the user removes JSONPath "$.isbn"`).
   - Valida respuestas complejas sin acoplamiento a DTOs (`Then the response JSONPath "$.token" should not be null or empty`).
3. **Refactorización Coherente de los 21 Escenarios BDD**:
   - Todas las features (`01-auth.feature`, `02-books-crud.feature`, `03-books-search.feature`, `04-contracts-and-errors.feature`, etc.) fueron reescritas para invocar exclusivamente peticiones HTTP con cuerpos multilínea (`body:`), mutaciones JSONPath y elementos de UI agnósticos.
   - **Quality Gate:** 21 escenarios (21 skipped), 150 pasos (150 skipped), 0 pasos indefinidos, 0 ambigüedades, compilación estricta al 100%.

---

## 🎨 FASE 12: Purificación Exhaustiva de Lógica de Steps y Dashboard Interactivo "OmniSpec"

1. **Purificación de Lógica de Steps Residuales**:
   - Se auditaron y eliminaron steps con pseudocobertura o texto de dominio específico:
     - En UI: se eliminó `Then the books table should display at least {int} row(s)` sustituyéndolo por el step universal `Then the table should display at least {int} row(s)` y el parametrizado `Then the {string} table should display at least {int} row(s)`.
     - En UI: se eliminaron los prefijos artificiales `on the "Login" page` y `on the "Books" page` en `01-login-ui.feature` y `03-hybrid-e2e.feature`, adoptando los steps universales `When the user enters {string} into the {string} field` y `When the user clicks the {string} button`.
     - En UI: se flexibilizó la inyección de sesión con `addInitScript` en `atomic-ui.steps.ts` para leer dinámicamente las credenciales y rol desde el contexto en vez de valores hardcodeados.
     - En API: se creó [src/api/schemas/registry.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/api/schemas/registry.ts) (`SchemaRegistry`) desacoplando completamente `common-api.steps.ts` de sentencias `switch` y esquemas estáticos.
     - En API: la autenticación en `atomic-api.steps.ts` pasó a realizarse mediante `GenericHttpClient` (`POST /auth/login`), eliminando cualquier dependencia de métodos de cliente dedicados.
2. **Creación del Dashboard Interactivo de Defensa ([dashboard/index.html](file:///c:/Users/PC/Documents/LogNext-Verisure/dashboard/index.html))**:
   - Se bautizó el framework como **OmniSpec SDET Engine** (*The Generic Zero-Code QA Automation Engine for Playwright & TypeScript*).
   - Implementado en Vanilla HTML5, Vanilla CSS3 (diseño glassmorphic dark, fuentes Outfit/Inter/JetBrains Mono, gradientes cyber) y Vanilla JavaScript (sin frameworks pesados).
   - **Módulos Interactivos Incorporados:**
     - **Hero & Metrics Strip:** Métricas en vivo (0 líneas de TS por test, 100% genérico, 70/30 pirámide, 100% Docker hermético).
     - **2-Minute Interview Elevator Pitch:** 4 tarjetas ejecutivas listas para deslumbrar al entrevistador (Shift-Left, Lego Core, Hybrid Acceleration, Hermetic CI/CD).
     - **Lego vs POM Visualizer:** Comparador interactivo entre la explosión tradicional de Page Objects y el motor atómico de OmniSpec.
     - **Live Puzzle Step Simulator:** Simulador ejecutable en tiempo real con 3 plantillas (API CRUD + JSONPath, UI Modal & Table, Hybrid Fast State) y terminal animado con logs de resolución en milisegundos.
     - **Pirámide 70/30 & Matriz ISTQB:** Pirámide visual y tabla filtrable de los 21 escenarios por nivel, tipo, técnicas de diseño y tags.
     - **Pipeline Multi-Agente:** Diagrama visual de los 3 agentes autónomos de QA.
     - **Catálogo Interactivo de Steps:** Buscador con chips de categoría y botón de copiado de Gherkin con un solo clic.
     - **Guía Rápida de Docker Offline:** Comandos CLI copiables para auditoría y ejecución local.
   - Script npm agregado en `package.json`: `npm run dashboard` para lanzamiento directo.

---

## 🗂️ Índice de Artefactos Creados y Vigentes

| Archivo | Propósito |
|---|---|
| [dashboard/index.html](file:///c:/Users/PC/Documents/LogNext-Verisure/dashboard/index.html) | Dashboard interactivo visual para defender el framework ante entrevistadores. |
| [dashboard/styles.css](file:///c:/Users/PC/Documents/LogNext-Verisure/dashboard/styles.css) | Sistema de diseño visual glassmorphic y paleta cyber dark en Vanilla CSS. |
| [dashboard/app.js](file:///c:/Users/PC/Documents/LogNext-Verisure/dashboard/app.js) | Lógica interactiva del simulador, filtros ISTQB, diccionario y portapapeles. |
| [BITACORA_PASO_A_PASO.md](file:///c:/Users/PC/Documents/LogNext-Verisure/BITACORA_PASO_A_PASO.md) | Registro cronológico y detallado de toda la solución (este documento). |
| [AUDITORIA_CALIDAD_SDET.md](file:///c:/Users/PC/Documents/LogNext-Verisure/AUDITORIA_CALIDAD_SDET.md) | Informe de auditoría técnica y dictamen sobre la eliminación de steps de dominio. |
| [STEPS_DICTIONARY.md](file:///c:/Users/PC/Documents/LogNext-Verisure/STEPS_DICTIONARY.md) | Diccionario universal de steps genéricos, motor JSONPath y taxonomía ISTQB. |
| [.agents/pipeline/ORCHESTRATOR.md](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/pipeline/ORCHESTRATOR.md) | Orquestador del pipeline de QA multi-agente end-to-end. |
| [.agents/pipeline/agents/](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/pipeline/agents/) | Especificaciones de Agente 1 (Analyst), Agente 2 (QA Lead) y Agente 3 (SDET). |
| [requirements.md](file:///c:/Users/PC/Documents/LogNext-Verisure/requirements.md) | Análisis funcional y técnico de los servicios, modelos y endpoints. |
| [test-plan.md](file:///c:/Users/PC/Documents/LogNext-Verisure/test-plan.md) | Plan maestro de pruebas con desglose por niveles N1-N4 y matriz de trazabilidad. |
| [src/api/schemas/registry.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/api/schemas/registry.ts) | Registro dinámico universal de esquemas OpenAPI / Zod. |
| [src/support/jsonpath.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/support/jsonpath.ts) | Motor nativo de extracción y mutación por JSONPath en runtime. |
| [src/support/template-resolver.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/support/template-resolver.ts) | Generador de tokens aleatorios dinámicos (`{{random_*}}`, `{{token}}`, `{{alias}}`). |
| [src/ui/support/element-resolver.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/ui/support/element-resolver.ts) | Resolutor agnóstico de páginas, modales, campos, botones y tablas. |
| [src/api/clients/generic-http.client.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/api/clients/generic-http.client.ts) | Cliente HTTP desacoplado para cualquier verbo y endpoint. |
| [tests/features/](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/features/) | 9 features BDD expresadas exclusivamente en pasos genéricos con JSONPath y tags ISTQB. |
| [tests/step-definitions/](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/step-definitions/) | 4 archivos únicos de steps 100% genéricos y agnósticos (2 API + 2 UI). |



