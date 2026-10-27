# 📑 Plan Maestro de Pruebas: BookStore QA Sandbox (API-First & CI/CD Focus)

**Proyecto:** Framework de Automatización E2E & Contratos  
**Autor:** Sergio Cañete Linares (Senior QA Automation Engineer / SDET & AI Test Automation Architect)  
**Versión:** 1.0.0  
**Metodología:** BDD Declarativo, Spec-Driven Development (SDD) & Shift-Left  
**Distribución de Cobertura:** 70% API Backend / 30% UI Frontend

---

## 1. Objetivos y Alcance del Plan

### 1.1. Objetivo Principal
Garantizar la calidad funcional, la integridad de contratos y la robustez transaccional de la plataforma **BookStore QA Sandbox** mediante una suite automatizada en **TypeScript + Playwright + Cucumber BDD**, integrada en un pipeline de integración continua hermético (Docker local sin registros públicos).

### 1.2. Alcance (In Scope)
- **70% API REST (Backend)**:
  - Validación de contratos OpenAPI contra esquemas `Zod` (estructuras 200/201 y envelope de error `{ code, message, errors }`).
  - Módulo de autenticación (`/api/auth/register`, `/api/auth/login`) con gestión de JWT.
  - Ciclo de vida CRUD completo de libros (`/api/books` - GET, POST, PUT, DELETE, GET by ID).
  - Búsqueda, paginación, filtros y validación de casos frontera (precios negativos, ISBNs inválidos, campos vacíos).
  - Health check y disponibilidad del servicio (`/api/health`).
- **30% UI React (Frontend)**:
  - Flujos de autenticación en interfaz (`/login`, `/register`).
  - Gestión visual del inventario en `/books` (renderizado de tabla, creación por modal, edición y confirmación de borrado).
  - Búsqueda reactiva en tiempo real.
  - Flujos híbridos de alto rendimiento: creación de datos vía API y verificación instantánea en la interfaz gráfica.
- **CI/CD & DevOps**:
  - Carga y orquestación de imágenes Docker locales (`bookstore-images.tar`) con `docker compose`.
  - Polling activo de salud antes de iniciar pruebas.
  - Ejecución paralela multihilo (`cucumber-js --parallel 4`).
  - Generación de reportes HTML enriquecidos y captura de trazas/pantallazos ante fallos.

### 1.3. Fuera de Alcance (Out of Scope)
- Pruebas de estrés y volumen masivo (previstas para fase posterior con Gatling).
- Pruebas de compatibilidad móvil nativa (se cubre diseño responsive web en Desktop Chrome).

---

## 2. Niveles de Prueba y Estrategia de Pirámide (N1 - N4)

```text
  ┌──────────────────────────────────────────────────────────────┐
  │ N4: UI E2E & Flujos Híbridos (30%)                          │
  │ • Playwright Web, Modales React, Búsqueda, Inyección Storage│
  ├──────────────────────────────────────────────────────────────┤
  │ N3: Integración y Búsqueda API (20%)                        │
  │ • Filtros complejos, transacciones y concurrencia           │
  ├──────────────────────────────────────────────────────────────┤
  │ N2: Componentes y CRUD API Aislado (30%)                    │
  │ • POST, GET, PUT, DELETE, Códigos HTTP 200..409             │
  ├──────────────────────────────────────────────────────────────┤
  │ N1: Contratos y Esquemas OpenAPI (20%)                      │
  │ • Schemas Zod, Envelope de Error, Tipado estricto           │
  └──────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Escenarios de Prueba por Módulo

### Módulo 1: Autenticación y Autorización API (`@api @auth`)
| ID | Nivel | Escenario BDD (Gherkin) | Tipo | Código HTTP Esperado |
|---|---|---|---|---|
| `TC-AUTH-01` | N2 | Login exitoso con credenciales seed de administrador (`admin@sandbox.com`) | Positivo / Smoke | `200 OK` (retorna JWT) |
| `TC-AUTH-02` | N2 | Intento de login con contraseña incorrecta | Negativo | `401 Unauthorized` |
| `TC-AUTH-03` | N2 | Intento de login con email no existente | Negativo | `401 Unauthorized` |
| `TC-AUTH-04` | N1 | Intento de login con formato de email inválido | Contrato | `400 Bad Request` |
| `TC-AUTH-05` | N2 | Registro exitoso de nuevo usuario con datos únicos | Positivo | `201 Created` |
| `TC-AUTH-06` | N2 | Intento de registro con email ya existente | Negativo | `409 Conflict` |
| `TC-AUTH-07` | N1 | Intento de registro con contraseña de longitud menor a la requerida | Contrato | `400 Bad Request` |

### Módulo 2: CRUD y Contratos del Catálogo de Libros (`@api @books`)
| ID | Nivel | Escenario BDD (Gherkin) | Tipo | Código HTTP Esperado |
|---|---|---|---|---|
| `TC-BOOK-01` | N2 | Listar todos los libros del catálogo (incluye verificación de los 5 libros semilla) | Positivo / Smoke | `200 OK` |
| `TC-BOOK-02` | N1 | Validar que el schema de la lista de libros cumple con el contrato OpenAPI | Contrato | `200 OK` (Zod validation) |
| `TC-BOOK-03` | N2 | Crear un nuevo libro con payload válido y token de administrador | Positivo | `201 Created` |
| `TC-BOOK-04` | N1 | Validar que la respuesta de creación de libro cumple con `BookSchema` | Contrato | `201 Created` (Zod validation) |
| `TC-BOOK-05` | N2 | Consultar un libro por su ID recién generado | Positivo | `200 OK` |
| `TC-BOOK-06` | N2 | Consultar un libro con ID inexistente | Negativo | `404 Not Found` |
| `TC-BOOK-07` | N2 | Actualizar atributos de un libro existente (`PUT /api/books/:id`) | Positivo | `200 OK` |
| `TC-BOOK-08` | N2 | Eliminar un libro existente (`DELETE /api/books/:id`) | Positivo | `200 OK` / `204 No Content` |
| `TC-BOOK-09` | N2 | Reintentar la eliminación del mismo libro ya borrado | Negativo | `404 Not Found` |
| `TC-BOOK-10` | N1 | Intento de creación sin cabecera `Authorization` | Seguridad | `401 Unauthorized` |
| `TC-BOOK-11` | N1 | Intento de creación con ISBN inválido (no ISBN-10 ni 13) | Contrato | `400 Bad Request` (`VALIDATION_ERROR`) |
| `TC-BOOK-12` | N1 | Intento de creación con precio negativo o cero | Contrato | `400 Bad Request` (`VALIDATION_ERROR`) |
| `TC-BOOK-13` | N1 | Intento de creación con título vacío | Contrato | `400 Bad Request` (`VALIDATION_ERROR`) |
| `TC-BOOK-14` | N3 | Filtrado y búsqueda de libros por término coincidente (`GET /api/books?search=...`) | Integración | `200 OK` |

### Módulo 3: Interfaz Web y Flujos Críticos E2E (`@ui`)
| ID | Nivel | Escenario BDD (Gherkin) | Tipo | Resultado Visual / Técnico |
|---|---|---|---|---|
| `TC-UI-01` | N4 | Inicio de sesión exitoso en la UI (`/login`) | Positivo / Smoke | Redirección a `/books` y renderizado del catálogo |
| `TC-UI-02` | N4 | Intento de inicio de sesión con credenciales inválidas | Negativo | Mensaje de error visible en pantalla, permanece en `/login` |
| `TC-UI-03` | N4 | Registro de usuario nuevo desde la UI y redirección a login | Positivo | Redirección a `/login` con mensaje de confirmación |
| `TC-UI-04` | N4 | Visualización y conteo de libros en la tabla del catálogo | Positivo | Muestra filas correspondientes con columnas completas |
| `TC-UI-05` | N4 | Búsqueda reactiva mediante el input de búsqueda de libros | Positivo | La tabla filtra los resultados en tiempo real |
| `TC-UI-06` | N4 | Creación de libro mediante el modal "Añadir Libro" en la UI | Positivo | Modal se cierra y el nuevo libro aparece en la tabla |
| `TC-UI-07` | N4 | Eliminación de un libro mediante el modal de confirmación | Positivo | El libro desaparece de la vista tras confirmar |
| `TC-UI-08` | N4 | Flujo Híbrido: Creación vía API -> Verificación inmediata en UI | Híbrido / SDET | Máxima velocidad de setup y verificación visual |

---

## 4. Política de Aislamiento y Teardown de Datos

Para que la suite sea 100% confiable y ejecutable en paralelo sin carreras:
1. **Generación con Faker**: Ningún test utiliza títulos estáticos o ISBNs duplicados; se generan mediante `@faker-js/faker`.
2. **Registro de Recursos en el Contexto (`CustomWorld`)**:
   - Cada vez que el cliente API crea un libro (`POST`), almacena su identificador en `this.context.createdBookIds`.
3. **Auto-Limpieza en el Hook `After`**:
   - Al finalizar cada escenario (incluso si falló), el hook recorre la lista de IDs creados y ejecuta `DELETE /api/books/:id`.
   - Se preservan intactos los 5 libros semilla iniciales de la base de datos.

---

## 5. Estrategia de CI/CD para `bookstore-images.tar`

El pipeline implementado en GitHub Actions resuelve el reto técnico de las imágenes locales sin registros externos:
1. **Checkout del código** (incluyendo el archivo `.tar` mediante Git LFS o commit directo).
2. **Carga en el Docker daemon local**: `docker load -i bookstore-images.tar`.
3. **Despliegue efímero**: `docker compose up -d`.
4. **Healthcheck Activo**: Bucle de sondeo (`until curl -s -f http://localhost:5000/api/health`) que espera hasta 60s a que MongoDB y Backend estén `healthy`.
5. **Ejecución Paralela**: `npx cucumber-js --parallel 4`.
6. **Reportes y Evidencias**:
   - Generación de `reports/cucumber-report.html` y JSON unificado.
   - Captura automática de pantallazo en fallos de UI.
   - Publicación como artefacto de GitHub Actions (`actions/upload-artifact@v4`).
7. **Limpieza**: `docker compose down -v`.

---

## 6. Criterios de Aceptación y Calidad (Quality Gates)

- **Tasa de Aprobación**: 100% de los escenarios críticos (`@smoke` y `@p1`) pasando.
- **Validación de Contratos**: 0 fallos de schema Zod en respuestas de API.
- **Flakiness**: 0 tests indeterminados gracias a selectores semánticos (`getByRole`) y esperas automáticas de Playwright.
- **Reutilización de Steps**: 100% de los steps redactados bajo la política de pasos genéricos y parametrizables, sin step definitions duplicadas ni huérfanas.
