# 🚀 BookStore QA Automation Framework (API-First 70% & UI 30%)

> **Desafío Técnico:** QA Automation Engineer (API-First & CI/CD Focus) — LogNext / Verisure  
> **Autor & Arquitecto:** **Sergio Cañete Linares** (Senior QA Automation Engineer / SDET & AI Test Automation Architect)  
> **Stack:** TypeScript + Playwright + Cucumber BDD + Zod + Docker CI/CD  
> **Contacto:** sergio13896@gmail.com | [LinkedIn](https://linkedin.com/in/secali) | [GitHub](https://github.com/secali) | +34 661 15 71 64

---

## 🧭 1. Visión y Filosofía de Arquitectura

Este framework traslada la experiencia senior en **Java + Cucumber / Rest Assured** a un ecosistema moderno y de alto rendimiento en **TypeScript + Playwright**, manteniendo los principios de mantenibilidad, desacoplamiento y escalabilidad:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA BDD DECLARATIVA (Gherkin)                       │
│           tests/features/api/          tests/features/ui/              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│            CAPA DE STEP DEFINITIONS GENÉRICOS & PARAMETRIZABLES        │
│          common-api.steps.ts    books.steps.ts    ui-common.steps.ts   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│      DEPENDENCY INJECTION & CONTEXTO COMPARTIDO (CustomWorld)          │
│    Equivalente a PicoContainer en Java: Estado aislado por escenario   │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
                   ▼ (70% Scope)                   ▼ (30% Scope)
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│     CLIENTES API & CONTRATOS ZOD     │ │    PAGE OBJECTS ACCESIBLES    │
│  • AuthClient      • BooksClient     │ │  • LoginPage    • BooksPage   │
│  • Zod Schemas     • Error Envelope  │ │  • Modales      • getByRole   │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

### Principios Fundamentales:
1. **Pirámide 70% API / 30% UI**: Cobertura exhaustiva en capa de servicios (códigos HTTP, contratos, integridad transaccional) y pruebas E2E de valor en interfaz gráfica.
2. **Steps Genéricos y Reutilizables (Zero Orphan Steps)**: Pasos parametrizables con Cucumber Expressions y Data Tables, evitando la duplicación de código.
3. **Validación Fuerte de Contratos (Zod)**: Verificación en tiempo de ejecución de las especificaciones OpenAPI (`/api/docs.json`) y del envelope de error estandarizado:
   ```json
   { "code": "VALIDATION_ERROR", "message": "Validation failed.", "errors": { ... } }
   ```
4. **Optimización Híbrida de Sesiones**: En pruebas de UI que requieren login previo, se inyecta la sesión autenticada vía API en `localStorage`, evitando logins repetitivos por UI y reduciendo tiempos de suite.
5. **Aislamiento e Idempotencia**: Cada prueba genera datos dinámicos con `@faker-js/faker` y realiza auto-limpieza (teardown) en el hook `After`, preservando los 5 libros semilla.

---

## 📦 2. Requisitos Previos y Entorno

- **Node.js**: v18 o superior (v20 recomendada).
- **Docker Desktop** (o Docker Engine + Docker Compose v2).
- **Git**.

---

## 🚀 3. Puesta en Marcha de la Infraestructura Local

1. **Cargar las imágenes en Docker (solo la primera vez):**
   ```bash
   docker load -i bookstore-images.tar
   ```

2. **Levantar el entorno contenerizado:**
   ```bash
   docker compose up -d
   ```

3. **Verificar estado de los contenedores (`healthy`):**
   ```bash
   docker compose ps
   ```
   - **Frontend (React UI):** [http://localhost:3000](http://localhost:3000)
   - **Backend API REST:** [http://localhost:5000/api](http://localhost:5000/api)
   - **Documentación Swagger UI:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
   - **Healthcheck:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 4. Instalación del Framework y Ejecución de Pruebas

1. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

2. **Instalar los navegadores de Playwright:**
   ```bash
   npx playwright install --with-deps chromium
   ```

### ⚡ Scripts de Ejecución Disponibles

| Comando | Descripción |
|---|---|
| `npm test` | Ejecución estándar de toda la suite BDD. |
| `npm run test:parallel` | **Ejecución multihilo paralela (4 workers)** para máxima velocidad. |
| `npm run test:api` | Ejecuta exclusivamente la suite de **API / Backend (70%)**. |
| `npm run test:ui` | Ejecuta exclusivamente la suite de **UI / Frontend (30%)**. |
| `npm run test:smoke` | Ejecuta los flujos críticos de verificación rápida (`@smoke`). |
| `npm run test:contracts` | Ejecuta las validaciones de esquemas OpenAPI y envelope de errores (`@contracts`). |
| `npm run test:hybrid` | Ejecuta las pruebas híbridas (inyección API y verificación UI). |
| `npm run report` | Genera y consolida el reporte visual en `reports/cucumber-html-report.html`. |

---

## 📊 5. Reportabilidad y Trazabilidad

- **Reporte Cucumber HTML**: Generado automáticamente en `reports/cucumber-report.html` y consolidable con `npm run report`.
- **Capturas de Pantalla en Fallos**: En caso de fallo en cualquier escenario UI, el hook `After` toma un pantallazo a pantalla completa y lo adjunta al reporte en `reports/screenshots/`.
- **Trazas de Playwright**: Se retienen trazas interactivas (`trace.zip`) para depuración paso a paso en caso de regresiones.

---

## 🚢 6. Estrategia de CI/CD para Docker Local (`bookstore-images.tar`)

### 🔍 El Desafío
Las instrucciones del reto estipulan:
> *"El entorno se entrega únicamente como imágenes Docker dentro del archivo bookstore-images.tar y no está publicado en ningún registro. No publiques el paquete ni las imágenes en repositorios o registros públicos. Decide cómo disponibilizar el entorno dentro de tu pipeline y documenta en tu README.md la solución elegida, sus limitaciones y las alternativas que consideraste."*

### ⚖️ Análisis de Alternativas Consideradas

1. **Registro Docker Público (Docker Hub / GHCR Público)**:
   - *Evaluación:* ❌ **Descartada categóricamente**. Violaría la cláusula de confidencialidad y propiedad intelectual del ejercicio.
2. **Registro Docker Privado con Credenciales en Secrets**:
   - *Evaluación:* ⚠️ Funcional en entornos corporativos cerrados, pero añade fricción a los evaluadores del proceso que no dispongan de credenciales compartidas para clonar o evaluar el workflow.
3. **GitHub Actions Cache (`actions/cache`) sobre Docker**:
   - *Evaluación:* ✅ Muy eficiente para ejecuciones sucesivas, pero requiere que la primera ejecución cargue el archivo base.
4. **Solución Elegida: Git LFS / Commit Hermético del Tarball + Carga en Runner**:
   - *Evaluación:* 🏆 **Elegida e implementada**.
   - **Cómo funciona:** El archivo `bookstore-images.tar` se versiona directamente o mediante Git LFS en el repositorio.
   - **En el runner de GitHub Actions (`.github/workflows/ci.yml`):**
     1. Hace checkout del código.
     2. Ejecuta `docker load -i bookstore-images.tar` directo al daemon del runner de GitHub.
     3. Levanta con `docker compose up -d`.
     4. Realiza un **polling activo de salud** sobre `http://localhost:5000/api/health` mediante un script `until` con timeout de 60s, evitando carreras antes de que MongoDB y el backend inicien.
     5. Lanza la suite en paralelo (`npx cucumber-js --parallel 4`).
     6. Publica los reportes HTML como artefactos del workflow (`actions/upload-artifact@v4`).
     7. Ejecuta teardown con `docker compose down -v`.
   - **Limitaciones de la solución elegida:** El clonado inicial del repositorio transfiere el peso del tarball (~89 MB), pero garantiza portabilidad total sin dependencias externas ni configuraciones de credenciales para quien ejecute el proyecto.

---

## 📂 7. Documentación Adicional del Proyecto

- [requirements.md](file:///c:/Users/PC/Documents/LogNext-Verisure/requirements.md): Análisis exhaustivo funcional y técnico de los servicios, modelos y endpoints.
- [test-plan.md](file:///c:/Users/PC/Documents/LogNext-Verisure/test-plan.md): Plan maestro de pruebas con desglose por niveles N1-N4 y matriz de trazabilidad.
- [.agents/skills/sdet-sergio-canete/](file:///c:/Users/PC/Documents/LogNext-Verisure/.agents/skills/sdet-sergio-canete/): Skill de IA personalizada para continuar la evolución arquitectónica del framework.
