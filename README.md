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
│          api.steps.ts (API Engine)      ui.steps.ts (UI Engine)        │
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
| `npm run test:unit` | Ejecuta las **pruebas unitarias** de los motores internos (`jsonpath` y `template-resolver`). |
| `npm run test:smoke` | Ejecuta los flujos críticos de verificación rápida (`@smoke`). |
| `npm run test:contracts` | Ejecuta las validaciones de esquemas OpenAPI y envelope de errores (`@contracts`). |
| `npm run test:hybrid` | Ejecuta las pruebas híbridas (inyección API y verificación UI). |
| `npm run dashboard` | Abre el **dashboard interactivo** visual en español para la defensa técnica. |
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
4. **Solución Elegida: Aislamiento Total en `.gitignore` + Carga Condicional Hermética**:
   - *Evaluación:* 🏆 **Elegida e implementada**.
   - **Garantía de Confidencialidad:** El archivo `bookstore-images.tar` está **estrictamente ignorado en `.gitignore` y desvinculado de Git**. De este modo, al publicar el repositorio en GitHub, **nunca se expone ni se sube el paquete de imágenes a internet**, respetando la cláusula de confidencialidad al 100%.
   - **Estrategia en el Runner de CI/CD (`.github/workflows/ci.yml`):**
     1. **Runner Self-Hosted / Entorno Corporativo Air-Gapped:** Si el runner dispone de las imágenes pre-cacheadas en su daemon Docker local, las reutiliza inmediatamente.
     2. **Almacenamiento Privado Seguro (GitHub Secret):** Si se ejecuta en runners efímeros de GitHub Actions (`ubuntu-latest`), el workflow soporta la descarga autenticada desde una URL privada temporal mediante el secret `DOCKER_IMAGES_SECURE_URL`.
     3. **Fallback Local:** Si el archivo `bookstore-images.tar` existe en el runner (ejecución local o runner dedicado), ejecuta `docker load -i bookstore-images.tar`.
     4. Realiza un **polling activo de salud** (`curl --retry-connrefused`) sobre `http://localhost:5000/api/health` antes de iniciar pruebas.
     5. Lanza la suite BDD completa (`npm test`).
     6. Publica los reportes HTML enriquecidos como artefactos del workflow (`actions/upload-artifact@v4`).
     7. Ejecuta teardown con `docker compose down -v`.

---

## 📂 7. Documentación Oficial y Ecosistema de Arquitectura

- [docs/CANDIDATE_INSTRUCTIONS.md](./docs/CANDIDATE_INSTRUCTIONS.md): **Especificación y Requisitos Oficiales** del desafío técnico entregado por LogNext-Verisure.
- [docs/STEPS_DICTIONARY.md](./docs/STEPS_DICTIONARY.md): **Diccionario Oficial de Steps Genéricos**, motor dinámico JSONPath, soporte de DataTables y taxonomía ISTQB.
- [docs/BITACORA_PASO_A_PASO.md](./docs/BITACORA_PASO_A_PASO.md): **Bitácora Integral Paso a Paso** con el registro cronológico y detallado de todas las fases del desarrollo y arquitectura.
- [dashboard/index.html](./dashboard/index.html): **Dashboard Interactivo SDET** con métricas en tiempo real, simulador interactivo de steps y pitch ejecutivo de defensa.

