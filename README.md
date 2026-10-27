<div align="center">

# 📚 BookStore QA Automation Framework

### **Estrategia API-First (70%) & UI (30%) · Validación de Contratos Zod · BDD Declarativo · CI/CD Hermético**

Framework de pruebas de automatización enterprise desarrollado en **TypeScript**, **Playwright**, **Cucumber BDD**, **Zod** y **Docker**, diseñado bajo los estándares de ingeniería y buenas prácticas de un **Senior QA Automation Engineer / SDET**.

<br>

[![CI/CD Pipeline](https://github.com/secali/bookstore-qa-automation-framework/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/secali/bookstore-qa-automation-framework/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-API%20%2B%20UI-2EAD33?logo=playwright&logoColor=white)
![Cucumber](https://img.shields.io/badge/BDD-Cucumber%2010-23D96C?logo=cucumber&logoColor=white)
![Contracts](https://img.shields.io/badge/Contracts-Zod%20Runtime-3E67B1)
![Docker](https://img.shields.io/badge/Docker-Hermetic%20Sandbox-2496ED?logo=docker&logoColor=white)

<br>

**[Defensa de Arquitectura](#-defensa-de-arquitectura-y-filosofía-sdet)** · **[Métricas y Cobertura](#-cuadro-de-mando-y-cobertura)** · **[Ejecución Local](#-guía-rápida-de-ejecución)** · **[Pipeline CI/CD](#-pipeline-de-cicd-multietapa)** · **[Documentación](#-ecosistema-documental)**

</div>

---

## 🎯 Defensa de Arquitectura y Filosofía SDET

Este framework ha sido concebido para resolver el desafío técnico de **LogNext / Verisure**, trasladando la robustez y disciplina de un perfil Senior SDET a un ecosistema moderno y de alto rendimiento. En lugar de un enfoque tradicional centrado exclusivamente en UI (lento y propenso a falsos positivos), la solución adopta una **estrategia de calidad integral**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA BDD DECLARATIVA (Gherkin)                       │
│     13 Escenarios API (REST/Contracts)  │  6 Escenarios UI / Híbridos   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│            MOTORES NATIVOS REUTILIZABLES (Zero-Orphan Steps)           │
│    JSONPath Engine  │  Template Resolver  │  DataTable Parser Agnóstico │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│         CAPA API (70%)           │ │          CAPA UI (30%)           │
│  Playwright APIRequestContext    │ │  Playwright Locator Semantics    │
│  Contratos Zod Runtime & Schemas │ │  Inyección de Sesión (Storage)   │
│  Factories Dinámicas (Faker.js)  │ │  ElementResolver & Component POM │
└──────────────────────────────────┘ └──────────────────────────────────┘
                  │                                 │
                  └────────────────┬────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             INFRAESTRUCTURA Y CI/CD HERMÉTICO (Docker)                 │
│   Contenedores Air-Gapped  │  Healthcheck Polling  │  Auto-Teardown    │
└────────────────────────────────────────────────────────────────────────┘
```

### 💡 Principios y Decisiones Clave

1. **Shift-Left y Pirámide de Pruebas Real (70% API / 30% UI):**
   - El **70% de la cobertura** se concentra en la capa de servicios REST: autenticación JWT, operaciones CRUD completas, búsqueda/filtros, validación de payloads y códigos de estado HTTP.
   - El **30% de UI** se reserva estrictamente para lo que aporta valor visual: formularios de login, catálogo interactivo con modales de alta/baja y flujos híbridos end-to-end.
   - **Feedback ultrarrápido:** La suite completa de 19 escenarios se ejecuta en ~30 segundos.

2. **Validación de Contratos en Runtime con Zod:**
   - No nos limitamos a validar el código de respuesta (e.g. `200 OK`). Cada respuesta de la API se valida dinámicamente contra contratos de esquema (`BookSchema`, `BookListSchema`, `AuthSuccessSchema`, `ErrorEnvelopeSchema`). Si el backend muta o rompe un tipo de dato, la prueba falla de inmediato en runtime.

3. **BDD Declarativo y "Zero-Orphan Steps":**
   - Los archivos `.feature` están redactados en **lenguaje de negocio declarativo**. Queda estrictamente prohibido acoplar pasos a URLs directas, endpoints crudos o selectores CSS en Gherkin.
   - Las step definitions son 100% modulares, agnósticas y parametrizables, apoyadas en tres motores nativos:
     - **JSONPath Engine:** Extracción y mutación dinámica de propiedades anidadas (`$.id`, `$.books[0].title`).
     - **Template Resolver:** Generación y reemplazo de tokens dinámicos en tiempo real (`{{random_title}}`, `{{random_isbn}}`, `{{token}}`).
     - **DataTable Parser:** Procesamiento agnóstico de tablas Gherkin para validación multicampo en una sola aserción.

4. **Inyección de Sesión y Selectores Semánticos en UI:**
   - Para evitar logins repetitivos y lentos por interfaz gráfica en cada prueba de UI, se utiliza **inyección de sesión vía API (`localStorage` / `storageState`)**, reduciendo el tiempo de ejecución en más de un 60%.
   - La capa de UI utiliza `ElementResolver` con selectores semánticos accesibles (`getByRole`, `getByLabel`), garantizando una suite inmune a cambios cosméticos de CSS.

5. **Aislamiento Total de Datos y Teardown Automático:**
   - Cada escenario genera sus propios datos dinámicos mediante **fábricas aisladas (`BookFactory`, `UserFactory`)** con `@faker-js/faker`, sin depender de datos compartidos ni mutar los registros semilla.
   - El hook `After` de Cucumber garantiza la eliminación vía API (`DELETE /api/books/:id`) de cualquier recurso creado durante la prueba, incluyendo un listener síncrono que detecta creaciones realizadas desde la interfaz gráfica.

6. **CI/CD Hermético y Cumplimiento de Confidencialidad:**
   - Las imágenes Docker del sandbox (`bookstore-images.tar`) están protegidas y **excluidas del repositorio público** según las instrucciones del desafío.
   - En GitHub Actions, la carga se realiza de forma hermética mediante GitHub Secrets, con almacenamiento en caché interno que reduce el tiempo de aprovisionamiento de 34s a solo 2s.

---

## 📊 Cuadro de Mando y Cobertura

| Métrica / Dimensión | Resultado | Detalle |
|---|:---:|---|
| **Escenarios BDD Totales** | **19** | **100% Passed (13 API / 6 UI)** |
| **Pasos Gherkin Ejecutados** | **118** | **118 Passed / 0 Failed / 0 Skipped** |
| **Distribución de Pirámide** | **68.4% API / 31.6% UI** | Alineado al objetivo 70% API / 30% UI |
| **Pruebas Unitarias de Arquitectura** | **18 / 18** | Motores JSONPath, TemplateResolver y DataTable |
| **Compilación TypeScript** | **0 errores** | Modo estricto (`tsc --noEmit`) |
| **Calidad de Código (ESLint)** | **0 errores** | Estándar limpio y consistente |
| **Tiempo de Ejecución Suite BDD** | **~31 segundos** | Feedback ágil en local y en la nube |
| **Pipelines CI/CD en GitHub Actions** | **3 Etapas Conectadas** | Quality Gates ➔ Sandbox BDD ➔ Executive Gate |

### Matriz de Cobertura por Capas

| Área Funcional | Tipo | Escenarios Clave Cubiertos |
|---|:---:|---|
| **Autenticación & Seguridad** | API + UI | Registro exitoso, login con JWT, credenciales inválidas, envelope de error 401, formulario UI. |
| **Catálogo de Libros (CRUD)** | API + UI | Listado, creación, consulta por ID, edición parcial (`PUT`), borrado idempotente y validación UI. |
| **Búsqueda & Filtros** | API | Búsqueda por término parcial, coincidencias en título/autor y validación de listas vacías. |
| **Contratos & Negocio** | API | Verificación de tipos Zod, campos obligatorios, años inválidos, precios negativos, contrato de error. |
| **Flujos Híbridos E2E** | Híbrido | Creación rápida vía API REST ➔ Validación y verificación de consistencia visual en UI. |
| **Motores del Framework** | Unit | Extracción y aserción JSONPath, tokens dinámicos y parsing de DataTables complejas. |

---

## 🏗️ Estructura del Proyecto

```text
├── .github/
│   ├── workflows/ci.yml         # Pipeline CI/CD multietapa con caché y healthcheck
│   └── pull_request_template.md # Plantilla de PR con checklist SDET
├── docs/                        # Documentación oficial y trazabilidad
│   ├── CANDIDATE_INSTRUCTIONS.md # Requisitos originales de LogNext-Verisure
│   ├── requirements.md          # Análisis funcional y técnico de endpoints
│   ├── test-plan.md             # Plan maestro de pruebas y matriz de cobertura
│   ├── STEPS_DICTIONARY.md      # Catálogo exhaustivo de steps reutilizables
│   └── BITACORA_PASO_A_PASO.md  # Registro cronológico del proceso de ingeniería
├── src/
│   ├── api/
│   │   ├── clients/             # Clientes HTTP tipados (Auth, Books, Generic)
│   │   └── schemas/             # Contratos y registro universal de esquemas Zod
│   ├── support/                 # Custom World, hooks de ciclo de vida y teardown
│   │   ├── jsonpath.ts          # Motor nativo de JSONPath
│   │   ├── template-resolver.ts # Motor dinámico de tokens y Faker
│   │   └── datatable-parser.ts  # Parser agnóstico para DataTables
│   └── ui/
│       ├── components/          # Component POM (BookModal, ConfirmModal)
│       ├── pages/               # Page Objects (LoginPage, RegisterPage, BooksPage)
│       └── support/             # ElementResolver con selectores semánticos
├── tests/
│   ├── features/
│   │   ├── api/                 # Features BDD de API (Auth, Books CRUD, Search, Errors)
│   │   └── ui/                  # Features BDD de UI (Login UI, Catalog UI, Híbridos)
│   ├── fixtures/factories/      # Fábricas dinámicas de datos (BookFactory, UserFactory)
│   ├── step-definitions/        # Step definitions consolidadas y agnósticas (api.steps, ui.steps)
│   └── unit/                    # Pruebas unitarias de los motores del framework
└── reports/                     # Reportes enriquecidos generados post-ejecución
```

---

## 🚀 Guía Rápida de Ejecución

### Prerrequisitos

- **Node.js 22 LTS** (o Node 18+) y `npm`
- **Docker Desktop** con **Docker Compose v2**
- Archivo **`bookstore-images.tar`** suministrado para la prueba técnica

### 1. Instalación de Dependencias

```bash
npm ci
npx playwright install chromium
```

*(En Linux/Ubuntu runner, instalar dependencias del sistema con `npx playwright install --with-deps chromium`)*

### 2. Despliegue del Sandbox de Pruebas (Docker)

```bash
# 1. Cargar las imágenes autorizadas
docker load -i bookstore-images.tar

# 2. Levantar la infraestructura en segundo plano
docker compose up -d

# 3. Comprobar que los contenedores estén healthy
docker compose ps
```

| Servicio | URL Local | Descripción |
|---|---|---|
| **BookStore UI** | [http://localhost:3000](http://localhost:3000) | Aplicación frontend SPA |
| **REST API** | [http://localhost:5000/api](http://localhost:5000/api) | Endpoints de negocio |
| **Swagger UI** | [http://localhost:5000/api/docs](http://localhost:5000/api/docs) | Especificación interactiva OpenAPI |
| **API Health** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Endpoint de sondeo y estado |

### 3. Comandos de Ejecución de Pruebas

| Comando | Descripción |
|---|---|
| **`npm test`** | **Ejecuta la suite BDD completa (19 escenarios, 118 pasos)** |
| `npm run test:api` | Ejecuta únicamente los escenarios de API (`@api`) |
| `npm run test:ui` | Ejecuta únicamente los escenarios de interfaz gráfica (`@ui`) |
| `npm run test:smoke` | Ejecuta el smoke test crítico (`@smoke`) |
| `npm run test:regression` | Ejecuta la batería de regresión (`@regression`) |
| `npm run test:contracts` | Ejecuta las validaciones de esquemas Zod (`@contracts`) |
| `npm run test:hybrid` | Ejecuta los flujos integrados API ➔ UI (`@hybrid`) |
| `npm run test:unit` | Ejecuta las pruebas unitarias de los motores de arquitectura |
| `npm run lint` | Ejecuta el linter ESLint en código y steps |
| `npx tsc --noEmit` | Verificación estricta de tipos de TypeScript |
| `npm run report` | Genera el reporte HTML consolidado desde los resultados JSON |

### 4. Apagado de la Infraestructura

```bash
docker compose down -v
```

*(La bandera `-v` elimina los volúmenes de datos, asegurando un entorno limpio para la siguiente ejecución).*

---

## ⚙️ Pipeline de CI/CD Multietapa

El pipeline de GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) está estructurado en **3 etapas enterprise conectadas visualmente por dependencias (`needs`)**:

```text
┌─────────────────────────────────┐
│  🛡️ 1. Quality Gates & Unit     │  Fail-fast (<20s): ESLint, TypeScript y
│        Tests                    │  Tests Unitarios de Arquitectura en paralelo.
└────────────────┬────────────────┘
                 │ (needs: quality-gates)
                 ▼
┌─────────────────────────────────┐
│  🚀 2. Docker Sandbox & BDD     │  Caché de Playwright y Docker, Healthcheck
│        Suite (70/30)            │  activo, 19 escenarios BDD y reportes HTML.
└────────────────┬────────────────┘
                 │ (needs: e2e-bdd-suite)
                 ▼
┌─────────────────────────────────┐
│  📊 3. Executive Quality &      │  Publicación de métricas y certificación
│        Compliance Gate          │  en el resumen ejecutivo ($GITHUB_STEP_SUMMARY).
└─────────────────────────────────┘
```

### Optimizaciones de Rendimiento Aplicadas al Pipeline

- **Caché Inteligente de Playwright (`~/.cache/ms-playwright`):** Evita la descarga repetitiva de 310 MB de binarios en cada push, ahorrando ~24 segundos por ejecución.
- **Caché de Tarball Docker (`/tmp/docker-images-cache`):** Tras la primera descarga protegida, las imágenes se restauran desde el caché interno en **~2 segundos** (en lugar de 34s externos).
- **Teardown Rápido (`docker compose down -v -t 1`):** Ahorro de 10 segundos en el apagado de contenedores mediante timeout controlado.
- **Disparo Único Controlado:** Configurado para evitar ejecuciones duplicadas en Pull Requests.

---

## 🗂️ Ecosistema Documental

Toda la documentación del proyecto ha sido depurada para mantener únicamente los artefactos formales que aportan valor de ingeniería:

| Documento | Enlace | Propósito |
|---|---|---|
| **Instrucciones del Candidato** | [docs/CANDIDATE_INSTRUCTIONS.md](docs/CANDIDATE_INSTRUCTIONS.md) | Especificación oficial y requisitos del desafío técnico LogNext-Verisure. |
| **Análisis de Requerimientos** | [docs/requirements.md](docs/requirements.md) | Análisis funcional y técnico exhaustivo de los servicios, modelos y endpoints. |
| **Plan Maestro de Pruebas** | [docs/test-plan.md](docs/test-plan.md) | Estrategia de pruebas, niveles N1-N4, criterios de aceptación y matriz de trazabilidad. |
| **Diccionario de Steps** | [docs/STEPS_DICTIONARY.md](docs/STEPS_DICTIONARY.md) | Catálogo oficial de steps Gherkin genéricos, motor JSONPath y taxonomía ISTQB. |
| **Bitácora Paso a Paso** | [docs/BITACORA_PASO_A_PASO.md](docs/BITACORA_PASO_A_PASO.md) | Registro cronológico detallado de todas las fases del desarrollo y decisiones técnicas. |
| **Checklist de Calidad PR** | [.github/pull_request_template.md](.github/pull_request_template.md) | Plantilla estándar de GitHub con lista de verificación SDET para revisión. |

---

<div align="center">

### Calidad de Software e Ingeniería de Pruebas Automatizadas

**Sergio Cañete Linares**  
*Senior QA Automation Engineer / SDET & AI Test Automation Architect*  
[LinkedIn](https://linkedin.com/in/secali) · [GitHub](https://github.com/secali) · sergio13896@gmail.com

<sub>TypeScript · Playwright · Cucumber · Zod · Docker · Shift-Left Testing</sub>

</div>
