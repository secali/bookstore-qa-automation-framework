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

### 2.1. Estructura de 4 Motores Universales
En lugar de crear archivos de steps por cada entidad (`auth.steps.ts`, `books.steps.ts`, `login-ui.steps.ts`), se consolidó la ejecución en 4 motores modulares:

```
tests/step-definitions/
├── api/
│   ├── atomic-api.steps.ts   # Peticiones HTTP arbitrarias, DocStrings, mutación JSON y aserciones
│   └── common-api.steps.ts   # Códigos de estado HTTP, contratos Zod OpenAPI y envelope de errores
└── ui/
    ├── atomic-ui.steps.ts    # Interacciones en modales, tablas, checkboxes, alertas y sesión
    └── common-ui.steps.ts    # Navegación básica, validación de URLs y aserción de textos
```

---

### 2.2. Motor de Rutas y Mutación de Payloads ([src/support/jsonpath.ts](./src/support/jsonpath.ts))
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

### 2.5. Gestión de Sesión e Inyección de JWT
Para optimizar el tiempo de ejecución de la suite de UI:
- En escenarios no centrados en el flujo de login, `openPageWithSession` obtiene el token vía API e inyecta la sesión en `localStorage` mediante `addInitScript`.
- **Mitigación frente a Re-inyección en Logout:** Se incorporó control de estado idempotente (`sessionStorage.getItem('explicit_logout')`) para asegurar que, si un test ejecuta un logout deliberado, la recarga de página no reinyecte credenciales no deseadas.
- **Tests dedicados de Login/Logout:** Los escenarios de autenticación gráfica ([01-login-ui.feature](./tests/features/ui/01-login-ui.feature)) utilizan el formulario real de la aplicación, verificando credenciales válidas y rechazo ante credenciales erróneas.

---

### 2.6. Validación de Contratos con `SchemaRegistry` ([src/api/schemas/registry.ts](./src/api/schemas/registry.ts))
- Desacopla los step definitions de los esquemas Zod concretos.
- Los esquemas Zod (`BookSchema`, `ErrorResponseSchema`, `AuthSuccessSchema`) incorporan validación estricta de tipos numéricos y obligatoriedad de campos.
- *Trade-off reconocido:* En proyectos donde el documento OpenAPI estático es la única fuente de verdad contractual, la solución ideal es generar automáticamente los esquemas Zod desde `openapi.yaml` o utilizar un validador AJV de respuestas. En este sandbox, `SchemaRegistry` aísla el mecanismo de validación permitiendo sustituir el motor sin alterar las pruebas en Gherkin.

---

### 2.7. Pipeline de CI/CD Hermético ([.github/workflows/ci.yml](./.github/workflows/ci.yml))
Diseñado para respetar la confidencialidad de `bookstore-images.tar`:
1. **Node.js 22 LTS:** Actualizado desde Node 20 (que alcanza fin de soporte en 2026).
2. **Quality Gate Estático Temprano:** Ejecuta `lint` y compilación estricta `tsc --noEmit` antes de inicializar contenedores.
3. **Carga Local de Imágenes:** `docker load -i bookstore-images.tar` importa los contenedores en el daemon local sin conexión a Docker Hub ni GHCR.
4. **Sonda de Salud Robusta:**
   - Utiliza `curl -s -f --retry-connrefused` con tiempo límite estricto sobre `/api/health`.
   - Comprueba la disponibilidad del frontend React en el puerto `3000`.
5. **Ejecución Paralela y Reporte:**
   - Ejecuta `npx cucumber-js --parallel 4`.
   - Genera reportes HTML y archiva capturas de pantalla de fallos como artefactos del workflow (`reports/`).

---

## ⚖️ 3. Análisis de Trade-Offs y Limitaciones Conocidas

Un aspecto distintivo de un perfil Senior SDET es el reconocimiento honesto de las concesiones de diseño:

| Decisión de Diseño | Beneficio Obtenido | Riesgo o Limitación | Mitigación Implementada |
|---|---|---|---|
| **Pasos Genéricos con JSONPath** | Cero código nuevo para cubrir nuevos endpoints o mutar payloads. | Gherkin puede volverse excesivamente técnico/imperativo. | Uso de *Scenario Outline*, tablas y *Backgrounds* para mantener la legibilidad de negocio. |
| **Parser JSONPath Ligero Propio** | Cero dependencias externas en el entorno de evaluación. | No soporta sintaxis de consulta compleja RFC 9535 (`[?(@.price>10)]`). | Módulo acotado a dot-notation/índices, protegido contra polución de prototipos y con tests unitarios. En producción masiva se adoptaría `jsonpath-plus`. |
| **ElementResolver en Cascada** | Resuelve elementos en cualquier pantalla sin crear decenas de clases POM. | Riesgo de coincidencia accidental si un selector desaparece. | Prioridad estricta a roles y etiquetas accesibles de Playwright, coincidencia exacta y registro de nombres lógicos. |
| **Inyección de Sesión con JWT** | Ahorro masivo de tiempo en la suite UI (evita 3 interacciones de formulario por test). | Puede reinyectar credenciales en tests de cierre de sesión. | Control de bandera de logout explícito en sesión y mantenimiento de tests de login/logout por formulario real. |
| **Métrica de Pirámide por Escenarios** | 15 API / 6 UI aproxima el ratio 71.4% / 28.6% (cercano al 70/30). | El recuento de escenarios no refleja por sí solo la profundidad de cobertura. | Trazabilidad exhaustiva: validación de contratos, CRUD, búsquedas, valores límite y códigos de error. |
| **CI Hermético con GitHub Actions** | Simula el flujo air-gapped con `docker load`. | Los runners públicos de GitHub se conectan a internet para descargar dependencias. | En producción corporativa, esta arquitectura se despliega sobre runners *self-hosted* con imágenes y dependencias pre-cacheadas. |

---

## 📊 4. Estado Actual de Verificación y Quality Gates

El framework cuenta con verificación estricta de compilación y pruebas unitarias de sus componentes base:

| Puerta de Calidad | Comando | Evidencia / Resultado | Estado |
|---|---|---|:---:|
| **Tests Unitarios del Motor** | `npm run test:unit` | Tests de `jsonpath` y `template-resolver` aprobados (incluyendo polución de prototipo) | 🟢 APROBADO |
| **Compilación Estricta** | `npx tsc --noEmit` | Exit code 0, 0 errores en modo TypeScript estricto | 🟢 APROBADO |
| **Linters y Formato** | `npm run lint` | ESLint y Prettier aprobados sin advertencias | 🟢 APROBADO |
| **Resolución de Steps** | `npx cucumber-js --dry-run` | **21 escenarios / 150 pasos**, 0 pasos indefinidos, 0 colisiones | 🟢 APROBADO |
| **Control de Versiones** | `git status` | Repositorio limpio en rama `main` | 🟢 APROBADO |

> **Nota de Transparencia Técnica sobre Ejecución Funcional:**  
> La validación actual (`--dry-run`) certifica que la gramática Gherkin, las expresiones regulares de los steps, la resolución de tipos y los motores internos compilan y enlazan al 100%. La ejecución funcional completa (21/21 en verde contra el SUT) se ejecuta una vez levantados los contenedores mediante `docker compose up -d` y `npm test`.

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
