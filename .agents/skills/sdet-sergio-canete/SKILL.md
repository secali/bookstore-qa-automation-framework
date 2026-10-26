---
name: sdet-sergio-canete
description: >-
  Aplica el perfil técnico, estándares de arquitectura y metodología de Sergio Cañete Linares
  (Senior QA Automation Engineer / SDET & AI Test Automation Architect) para resolver el desafío
  técnico LogNext-Verisure (BookStore QA Sandbox). Utilízala al diseñar la estrategia de pruebas (70% API / 30% UI),
  estructurar el framework en TypeScript con Playwright y Cucumber (BDD), validar contratos y esquemas OpenAPI/Zod,
  diseñar el pipeline de CI/CD para Docker sin registros públicos, y orquestar flujos de automatización de alta calidad.
---

# 🧠 Skill: SDET Architecture & Testing Standards — Sergio Cañete Linares

Esta skill configura el comportamiento, criterios de decisión técnica y metodología de trabajo del agente para alinearse al 100% con el perfil profesional de **Sergio Cañete Linares** (**Senior QA Automation Engineer / SDET | Test Automation Architect | AI-Driven Testing**).

---

## 🎯 Objetivo de la Skill

Guiar la resolución integral del **Desafío Técnico: QA Automation Engineer (API-First & CI/CD Focus)** sobre el proyecto **BookStore QA Sandbox**, aplicando los principios de:
1. **Shift-Left & Testability by Design**: Criterios de calidad desde el análisis de requisitos y Swagger/OpenAPI.
2. **Pirámide de Pruebas 70% API / 30% UI**: Máxima velocidad, estabilidad y cobertura en capa de servicios; flujos críticos en UI.
3. **Spec-Driven Development (SDD) & BDD Limpio**: Gherkin declarativo de negocio, validación rigurosa de contratos/esquemas, y cero steps huérfanos.
4. **Arquitectura Modular en TypeScript**: Playwright + Cucumber BDD + Zod, con tipado estricto, gestión desacoplada de sesión/tokens y Page Objects resilientes.
5. **CI/CD Eficiente y Seguro**: Solución para imágenes Docker locales (`bookstore-images.tar`) en GitHub Actions, ejecución en paralelo y archivado de reportes.
6. **AI-Ready & Living Documentation**: Diseñado para integrarse fluidamente con agentes de IA, servidores MCP y trazabilidad continua.

---

## 🧭 Principios Rectores de Sergio Cañete

| Principio | Aplicación en BookStore QA Sandbox |
|---|---|
| **API-First (70% Backend)** | Cobertura exhaustiva de CRUD, códigos de respuesta HTTP (200, 201, 400, 401, 403, 404, 409), autenticación JWT y validación del envelope de error `{ code, message, errors }`. |
| **UI Resiliente (30% Frontend)** | Pruebas E2E de valor con Playwright usando `getByRole` y `getByLabel`. Inyección de sesión vía API (`storageState`) para saltarse logins lentos y repetitivos en flujos que no prueban autenticación. |
| **BDD Declarativo (Gherkin)** | Escenarios expresados en lenguaje de dominio de librería/catálogo, sin exponer selectores CSS ni endpoints crudos en el `.feature`. |
| **Zero Orphan Steps** | Diseño de step definitions altamente reutilizables y modulares. Evitar duplicación o steps muertos (inspirado en su plugin Cucumber Unused Steps Analyzer). |
| **Contratos Fuertes** | Esquemas Zod / JSON Schema derivados de `http://localhost:5000/api/docs.json` para garantizar que la API no rompa retrocompatibilidad. |
| **Aislamiento & Limpieza de Datos** | Cada prueba genera sus propios datos (con identificadores únicos/Faker) y los limpia en el teardown (`After` hooks o API delete), sin depender de libros preexistentes. |
| **CI/CD Docker Hermético** | El archivo `bookstore-images.tar` no se sube a registros públicos: se carga con `docker load -i` y se orquesta con `docker compose` en el runner con healthcheck activo. |

---

## 🏗️ Flujo de Trabajo Operativo (Paso a Paso)

Cuando el usuario pida avanzar, generar código o resolver cualquier parte del proyecto, sigue este flujo riguroso:

### Paso 1: Exploración y Análisis de Especificaciones (SDD)
- Consulta la especificación OpenAPI en `http://localhost:5000/api/docs.json` (o los modelos de datos en `README.md` y `docker-compose.yml`).
- Identifica entidades clave: `User` (registro, login, token JWT), `Book` (title, author, isbn, price, category, etc.).
- Identifica el contrato de error estándar: `{ "code": "VALIDATION_ERROR", "message": "...", "errors": { ... } }`.
- Detalle en: [references/estrategia-pruebas-70-30.md](./references/estrategia-pruebas-70-30.md).

### Paso 2: Diseño de la Arquitectura del Framework
- Estructurar el proyecto en TypeScript modular:
  - `src/api/`: Clientes REST tipados con Playwright `APIRequestContext`, validación Zod y DTOs.
  - `src/ui/`: Page Objects (`LoginPage`, `BooksDashboardPage`) con selectores semánticos accesibles.
  - `src/support/`: `CustomWorld` (mantiene estado compartido entre steps), `hooks.ts` (setup/teardown/screenshots) y utilidades.
  - `tests/features/api/`: Features BDD para autenticación, catálogo, contratos y validación de errores.
  - `tests/features/ui/`: Features BDD para flujos de usuario, modales y validación reactiva.
- Detalle en: [references/arquitectura-framework.md](./references/arquitectura-framework.md).

### Paso 3: Redacción de Escenarios BDD Gherkin
- Redactar features legibles para negocio y desarrollo.
- Aplicar tags estratégicos: `@api`, `@ui`, `@smoke`, `@regression`, `@contracts`, `@security`.
- Detalle en: [references/estandares-gherkin.md](./references/estandares-gherkin.md).

### Paso 4: Implementación de Step Definitions
- Steps desacoplados de detalles de implementación.
- Los steps de API invocan `this.apiClient`.
- Los steps de UI interactúan con `this.page` o sus Page Objects.
- Verificar tipado estricto en cada paso.

### Paso 5: Estrategia de CI/CD para Docker Local
- Diseñar el pipeline en GitHub Actions (`.github/workflows/ci.yml`).
- Solucionar el reto del artefacto `bookstore-images.tar`:
  - `docker load -i bookstore-images.tar`
  - `docker compose up -d`
  - Healthcheck loop verificando `http://localhost:5000/api/health`
  - Ejecución paralela con `@cucumber/cucumber` o Playwright
  - Generación y archivado de reportes HTML como artefactos
  - `docker compose down -v`
- Detalle en: [references/cicd-docker-pipeline.md](./references/cicd-docker-pipeline.md).

---

## 📚 Documentación de Referencia y Plantillas

| Documento | Descripción |
|---|---|
| [Perfil y Filosofía](./references/perfil-filosofia.md) | Trayectoria, especializaciones y mentalidad SDET de Sergio Cañete Linares. |
| [Arquitectura del Framework](./references/arquitectura-framework.md) | Estructura de carpetas, componentes, World y tipado TypeScript. |
| [Estrategia de Pruebas 70/30](./references/estrategia-pruebas-70-30.md) | Matriz completa de casos API y UI, niveles N1-N4 y validaciones. |
| [Estándares Gherkin](./references/estandares-gherkin.md) | Reglas de estilo BDD, buenas prácticas y tagging. |
| [Estrategia CI/CD Docker](./references/cicd-docker-pipeline.md) | Configuración de GitHub Actions con Docker local y ejecución paralela. |
| [Plantilla Setup Playwright + Cucumber](./templates/playwright-cucumber-setup.md) | `package.json`, `cucumber.js`, `tsconfig.json`. |
| [Plantilla API Client & World](./templates/api-client-and-world.md) | Cliente REST tipado y Custom World de Cucumber. |
| [Plantilla Features & Steps](./templates/sample-feature-and-steps.md) | Ejemplos canónicos de `.feature` y step definitions. |
| [Plantilla GitHub Actions Workflow](./templates/github-actions-workflow.yml) | Workflow CI/CD completo listo para usar. |

---

## ⚡ Comandos Rápidos y Buenas Prácticas

- **Ejecutar suite completa en paralelo**:
  ```bash
  npx cucumber-js --parallel 4
  ```
- **Ejecutar solo API (70%)**:
  ```bash
  npx cucumber-js --tags "@api"
  ```
- **Ejecutar solo UI (30%)**:
  ```bash
  npx cucumber-js --tags "@ui"
  ```
- **Ejecutar Smoke Tests**:
  ```bash
  npx cucumber-js --tags "@smoke"
  ```
