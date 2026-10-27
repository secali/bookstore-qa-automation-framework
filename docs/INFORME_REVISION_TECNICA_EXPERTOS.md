# 📋 Informe de Arquitectura y Revisión Técnica para Expertos SDET / QA Architects

> **Proyecto:** BookStore QA Sandbox — Desafío Técnico de Automatización (LogNext - Verisure)  
> **Candidato / Arquitecto:** Sergio Cañete Linares (*Senior QA Automation Engineer / SDET & AI Test Automation Architect*)  
> **Fecha:** Octubre 2026  
> **Propósito:** Documento de revisión técnica (*Peer Review*) y defensa de arquitectura para la entrevista técnica. Expone los requisitos, el diseño del framework, los compromisos de ingeniería (*trade-offs*), las limitaciones conocidas y el plan de mitigación.

---

## 🧭 Resumen Ejecutivo y Tesis de la Solución

El objetivo de este proyecto es construir un framework de automatización para el sandbox contenerizado **BookStore QA Sandbox**, respetando una distribución **70% API / 30% UI**, garantizando **confidencialidad estricta de las imágenes Docker** (prohibido subirlas a registros públicos) y aplicando un enfoque de **máxima reusabilidad de pasos (Lego Architecture)** en Playwright + TypeScript + Cucumber BDD.

### Postura de Ingeniería y Trade-Off Central:
> En este desafío, **la abstracción genérica fue un requisito expreso del evaluador** para evitar la duplicidad de código y la creación masiva de clases Page Object en cada sprint.  
> Como Senior SDET, **reconozco los riesgos de llevar la abstracción al extremo** (Gherkin imperativo, cascada de selectores o mantenimiento de utilidades propias). Este documento expone las decisiones adoptadas para cumplir los requisitos del evaluador, documentando con transparencia sus límites, mitigaciones y alternativas de nivel corporativo.

---

## 🎯 1. Contexto y Requerimientos de Entrada (Lo que necesitábamos hacer)

### 1.1. Sistema Bajo Prueba (SUT)
El entorno entregado consiste en un archivo empaquetado `bookstore-images.tar` que contiene:
- **API REST (Node.js/Express):** Escuchando en el puerto `5000` (`http://localhost:5000/api`), con endpoints de autenticación (`/auth/login`, `/auth/register`), catálogo CRUD (`/books`, `/books/:id`), búsqueda (`/books?search=...`) y healthcheck (`/health`).
- **Frontend Web (React SPA):** Escuchando en el puerto `3000` (`http://localhost:3000`), con vistas de Login (`/login`), Registro (`/register`) y Catálogo interactivo (`/books`) con modales de alta/confirmación y tablas de inventario.
- **Base de Datos (MongoDB 7):** Puerto `27017` con usuarios y catálogo pre-semillados.

### 1.2. Restricciones y Reglas de Calidad Obligatorias
1. **Stack Tecnológico:** Playwright con TypeScript y Cucumber (archivos `.feature` en sintaxis Gherkin).
2. **Pirámide de Pruebas (70% API / 30% UI):**
   - 70% del esfuerzo focalizado en servicios/APIs: validación de contratos, esquemas Zod en runtime, flujos de autenticación JWT y operaciones CRUD completas.
   - 30% en UI e integración E2E: inicio de sesión, alta vía modal interactivo, eliminación en tabla y flujos híbridos.
3. **Confidencialidad Estricta de Contenedores:**
   - **No publicar el paquete ni las imágenes en repositorios o registros públicos.** Todo el despliegue local y en CI debe basarse en `docker load -i bookstore-images.tar`.
4. **Filosofía de Pasos Universales:**
   - Extrapolar la experiencia en BDD para lograr un framework con pasos altamente parametrizables, evitando step definitions huérfanas o acopladas a controladores específicos.
5. **Aislamiento y Limpieza:**
   - Cada prueba debe generar sus propios datos dinámicos y destruirlos en el teardown (hook `After`), sin alterar los registros semilla permanentes.

---

## 🏗️ 2. Arquitectura del Framework: Componentes e Implementación Técnica

### 2.1. Estructura Unificada de Motores de Steps
En lugar de dispersar archivos de steps por cada entidad o pantalla, se consolidó la ejecución en **dos únicos motores modulares altamente cohesivos**:

```
tests/step-definitions/
├── api/
│   └── api.steps.ts   # Peticiones HTTP genéricas, DataTables, mutación JSONPath, JWT y contratos Zod
└── ui/
    └── ui.steps.ts    # ElementResolver universal, modales, tablas reactivas, DataTables y sesión rápida
```

---

### 2.2. Motor de Rutas y Mutación de Payloads ([src/support/jsonpath.ts](../src/support/jsonpath.ts))
Para posibilitar la preparación de payloads dinámicos directamente en Gherkin sin depender de DTOs rígidos:
- **Alcance Real del Módulo:** Implementa un subconjunto de acceso a rutas por notación de punto (`user.email`), corchetes (`items[0].id`) y prefijo raíz (`$.title`), complementado con operaciones de mutación (`setJsonPath`) y borrado (`deleteJsonPath`).
- **Seguridad (Protección Anti-Polución de Prototipos):**
  ```typescript
  const BLOCKED_PROPERTIES = new Set(['__proto__', 'constructor', 'prototype']);
  // Bloquea explícitamente cualquier intento de mutación sobre propiedades del prototipo
  ```
- **Cobertura con Tests Unitarios:** El módulo cuenta con su propia suite de pruebas unitarias ejecutables vía `npm run test:unit` ([tests/unit/jsonpath.test.ts](./tests/unit/jsonpath.test.ts)), verificando extracción, mutación de arrays y defensa contra inyección de prototipos.

---

### 2.3. Resolución de Variables con Fail-Fast ([src/support/template-resolver.ts](./src/support/template-resolver.ts))
Permite inyectar tokens dinámicos en tiempo de ejecución:
- `{{random_email}}`, `{{random_isbn}}`, `{{random_price}}`, `{{random_uuid}}`.
- `{{token}}`, `{{lastId}}`, o cualquier alias guardado previamente (`{{alias}}`).
- **Mitigación de Variables Indefinidas:** Si un escenario referencia un alias no registrado en el contexto, el motor **lanza un error explícito inmediatamente** (fail-fast), impidiendo que se sustituya silenciosamente por cadenas vacías que enmascaren defectos.
- Cubierto con pruebas unitarias en [tests/unit/template-resolver.test.ts](./tests/unit/template-resolver.test.ts).

---

### 2.4. Localización Resiliente con Prioridad Accesible ([src/ui/support/element-resolver.ts](./src/ui/support/element-resolver.ts))
Para resolver elementos sin crear clases Page Object para cada pantalla:
1. **Jerarquía de Búsqueda:**
   - **Campos:** 1º Etiqueta accesible (`getByLabel`), 2º Contrato de test (`data-testid`), 3º Placeholder, 4º Atributo `name`, 5º `#id`.
   - **Botones:** 1º Rol accesible (`getByRole('button')` con coincidencia exacta), 2º Contrato (`data-testid`), 3º Texto visible, 4º `#id`.
2. **Salida de Emergencia (Registro de Nombres Lógicos):**
   - Incorpora el método `registerLogicalName(alias, selector)` para elementos sin accesibilidad o con selectores complejos, manteniendo el desacoplamiento sin requerir Page Objects.
3. **Aislamiento de Modales y Tablas:**
   - `getActiveModal(nombre?)` acota la búsqueda al diálogo visible (`.modal, [role="dialog"]`).
   - `findTableRowByText(texto)` acota las acciones de fila (ej. pulsar "Delete") a la tupla exacta de la tabla.

---

### 2.5. Fábrica de Datos de Prueba Aislados ([tests/fixtures/factories/](../tests/fixtures/factories/))
Para evitar el acoplamiento de datos a controladores o componentes de interfaz:
- **`book.factory.ts`**: Genera payloads de libros válidos, dinámicos y únicos (`createBookPayload`), permitiendo sobrescrituras parciales (`overrides`) para pruebas de límites (`boundary-value-analysis`) y escenarios negativos.
- **`user.factory.ts`**: Genera credenciales de usuario con emails únicos y no colisionables (`createUserPayload`).
- **Independencia Arquitectónica:** Los clientes API solo transportan peticiones; los localizadores UI solo interactúan con controles; los datos residen en la capa de fixtures de prueba.

---

### 2.6. Aislamiento y Teardown Completo (UI + API)
Para resolver la fuga potencial de datos creados en tests de interfaz gráfica:
- **Playwright Network Response Listener ([src/support/world.ts](../src/support/world.ts)):** Al inicializar la página web, Playwright intercepta en segundo plano cualquier respuesta HTTP `POST /api/books` con código `201 Created` y añade su ID automáticamente a `this.context.createdBookIds`.
- **Garantía de Auto-Limpieza en Hook `After` ([src/support/hooks.ts](../src/support/hooks.ts)):** Incluso si un test de UI falla antes de pulsar el botón de borrado en la tabla, el teardown detecta el ID y ejecuta la eliminación vía REST API (`DELETE /api/books/:id`), preservando intactos los 5 libros semilla.
- **Aislamiento de Usuarios:** Dado que la API del SUT no expone borrado REST de usuarios (`DELETE /api/users`), el aislamiento se garantiza mediante emails dinámicos aleatorios de Faker.

---

### 2.7. Pipeline de CI/CD Hermético y Confidencial ([.github/workflows/ci.yml](../.github/workflows/ci.yml))
Diseñado para respetar estrictamente la confidencialidad de `bookstore-images.tar`:
1. **Desvinculación Total de Git:** `bookstore-images.tar` está añadido a `.gitignore` y desvinculado del repositorio para evitar fugas de propiedad intelectual al publicar el repo en GitHub.
2. **Aprovisionamiento Flexible en Runner:** Soporta runner local/self-hosted con imágenes cacheadas, carga condicional de archivo local o descarga privada autenticada mediante GitHub Secret (`DOCKER_IMAGES_SECURE_URL`).
3. **Node.js 22 LTS & Quality Gates Tempranos:** `lint` y `tsc --noEmit` antes de arrancar Docker.
4. **Sonda de Salud Activa:** Polling con `curl --retry-connrefused` sobre `/api/health`.
5. **Ejecución y Artefactos:** Ejecución con `npm test` y archivado de reportes HTML enriquecidos en `reports/`.

---

## ⚖️ 3. Análisis de Trade-Offs y Limitaciones Conocidas

Un aspecto distintivo de un perfil Senior SDET es el reconocimiento honesto de las concesiones de diseño:

| Decisión de Diseño | Beneficio Obtenido | Riesgo o Limitación | Mitigación Implementada |
|---|---|---|---|
| **Pasos Genéricos con JSONPath y DataTables** | Cero código nuevo para cubrir nuevos endpoints o mutar payloads. | Gherkin puede volverse excesivamente técnico/imperativo. | Uso de *DataTables* (`And the response FROM "/books" is validated with data:`) para compactar pasos y mantener alta legibilidad. |
| **Parser JSONPath y DataTable Propios** | Cero dependencias externas adicionales en tiempo de ejecución. | Mantenimiento de código utilitario interno. | Suites de pruebas unitarias dedicadas en `tests/unit/` (`npm run test:unit`) con validación de seguridad anti-prototipo. |
| **ElementResolver en Cascada** | Resuelve elementos en cualquier pantalla sin crear decenas de clases POM. | Riesgo de coincidencia accidental si un selector desaparece. | Prioridad estricta a roles y etiquetas accesibles de Playwright (`getByRole`, `data-testid`). |
| **Inyección de Sesión con JWT** | Ahorro masivo de tiempo en la suite UI (evita logins repetitivos por interfaz). | Podría interferir en tests específicos de logout. | Control de bandera de logout explícito en sesión y tests de login UI con formulario real. |
| **Confidencialidad de Imágenes Docker** | Previene la exposición pública de `bookstore-images.tar` en GitHub. | El runner público de GitHub requiere aprovisionar las imágenes de forma segura. | Configuración condicional en `ci.yml`: soporte de runner local, runner self-hosted o endpoint privado seguro. |
| **Auto-Teardown con Interceptor UI** | Garantiza la eliminación de recursos creados por UI aunque el test falle a mitad. | Depende de la interceptación de tráfico HTTP en el navegador. | Listener síncrono registrado en el evento `response` de Playwright sobre `/api/books`. |

---

## 📊 4. Estado Actual de Verificación y Quality Gates

El framework cuenta con verificación estricta de compilación, linters y ejecución funcional completa al 100%:

| Puerta de Calidad | Comando | Evidencia / Resultado | Estado |
|---|---|---|:---:|
| **Tests Unitarios del Motor** | `npm run test:unit` | 3 suites aprobadas (JSONPath, TemplateResolver, DataTableParser) | 🟢 APROBADO |
| **Compilación Estricta** | `npx tsc --noEmit` | Exit code 0, 0 errores en modo TypeScript estricto | 🟢 APROBADO |
| **Linters y Formato** | `npm run lint` | ESLint y Prettier aprobados sin advertencias | 🟢 APROBADO |
| **Ejecución Funcional BDD** | `npm test` | **19 escenarios aprobados / 118 pasos aprobados (100% verde)** | 🟢 APROBADO |
| **Reportabilidad** | `npm run report` | Reporte visual HTML enriquecido en `reports/cucumber-html-report.html` | 🟢 APROBADO |
| **Control de Versiones** | `git status` | Repositorio limpio, tarball ignorado en `.gitignore` | 🟢 APROBADO |

---

## ❓ 5. Preguntas para el Revisor Técnico / Evaluador

Agradeceré tu criterio especializado sobre los siguientes puntos durante la sesión técnica:

1. **Equilibrio BDD:** ¿Consideras que la flexibilidad de mutación dinámica por JSONPath compensa la pérdida de declaratividad de negocio en escenarios técnicos de API, o preferirías steps de dominio más rígidos?
2. **Evolución Contractual:** Si el proyecto escalara a 50 microservicios, ¿recomendarías generar los esquemas Zod en build-time desde el Swagger de Express o validar directamente con un plugin de OpenAPI para Playwright?
3. **Estrategia de Localizadores:** ¿Ves suficiente la jerarquía accesible implementada en `ElementResolver` junto con el registro de nombres lógicos para evitar el mantenimiento del Page Object Model tradicional?
4. **Veredicto:** A la luz de los requisitos del desafío, ¿consideras que esta arquitectura demuestra las competencias esperadas de un Senior QA Automation Engineer / SDET?

---

### 📂 Enlaces a Artefactos Clave en el Repositorio:
- [Diccionario Universal de Steps](./STEPS_DICTIONARY.md)
- [Informe de Auditoría de Calidad SDET](./AUDITORIA_CALIDAD_SDET.md)
- [Bitácora Cronológica de Implementación](./BITACORA_PASO_A_PASO.md)
- [Workflow de Integración Continua CI/CD](./.github/workflows/ci.yml)
- [Dashboard Técnico Interactivo](./dashboard/index.html)
