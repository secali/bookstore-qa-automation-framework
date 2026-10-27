# 📋 Análisis de Requerimientos Funcionales y Técnicos: BookStore QA Sandbox

**Proyecto:** BookStore QA Sandbox  
**Autor:** Sergio Cañete Linares (Senior QA Automation Engineer / SDET & AI Test Automation Architect)  
**Versión del Sandbox:** 1.0.0  
**Stack Objetivo del Sistema:** Node.js / Express (API REST), MongoDB 7, React (Frontend SPA)

---

## 1. Visión General del Sistema y Contexto de Calidad

El sistema **BookStore QA Sandbox** es una plataforma web completa para la gestión de inventario y catálogo de libros. Se distribuye como una arquitectura contenerizada compuesta por tres capas independientes:

```text
┌────────────────┐      HTTP/REST      ┌─────────────────┐      Mongoose/TCP      ┌────────────────┐
│ Frontend React │ ──────────────────> │ Backend API     │ ─────────────────────> │ MongoDB 7      │
│ (Port 3000)    │                     │ (Port 5000)     │                        │ (Port 27017)   │
└────────────────┘                     └─────────────────┘                        └────────────────┘
        │                                       │
        ▼                                       ▼
  Rutas SPA (/login,                    Swagger & OpenAPI (/api/docs)
  /register, /books)                    Healthcheck (/api/health)
```

### Principio de Diseño para la Automatización:
Siguiendo la metodología de **Sergio Cañete** (Senior SDET), el framework no trata al sistema como una caja negra superficial, sino como un ecosistema de servicios donde:
- El **70% de las pruebas** validan los contratos, la lógica transaccional, las autorizaciones y la integridad de datos en la **API REST**.
- El **30% restante** valida los flujos críticos de usuario (E2E) en el **Frontend React**, asegurando la sincronización visual, la reactividad de modales y la experiencia de usuario, reutilizando sesiones API (`storageState`) para optimizar el tiempo de ejecución.

---

## 2. Requerimientos Técnicos y Arquitectura de Servicios

### 2.1. Infraestructura y Red Local
| Servicio | Imagen / Versión | Puerto Interno | Puerto Host | Dependencias y Condiciones |
|---|---|---|---|---|
| `mongo` | `mongo:7` | 27017 | 27017 | Volumen `mongo-data` para persistencia. Healthcheck nativo vía `mongosh`. |
| `backend` | `bookstore-qa-sandbox-backend:1.0.0` | 5000 | 5000 | Depende de `mongo` (condition: `service_healthy`). Healthcheck vía `GET /api/health`. |
| `frontend` | `bookstore-qa-sandbox-frontend:1.0.0` | 80 | 3000 | Depende de `backend` (condition: `service_healthy`). |

### 2.2. Sembrado de Datos Inicial (Seeding)
En cada arranque con base de datos limpia:
1. **Usuario Administrador Semilla**:
   - `email`: `admin@sandbox.com`
   - `password`: `admin123`
   - `role`: `admin`
   - `name`: `Sandbox Admin`
2. **Catálogo Semilla**:
   - Si la colección `books` está vacía, se inyectan automáticamente **5 libros de ejemplo** para visualización inmediata en el catálogo.

### 2.3. Estándar de Comunicación y Envelope de Errores
- Todas las peticiones y respuestas utilizan formato `application/json`.
- Esquema de autorización: Cabecera estándar HTTP `Authorization: Bearer <jwt_token>`.
- **Envelope de Error Estandarizado**: Todo fallo 4xx/5xx devuelve una estructura estricta:
  ```json
  {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "errors": {
      "isbn": "isbn must be a valid ISBN-10 or ISBN-13."
    }
  }
  ```

---

## 3. Especificación Funcional y Técnica de la API REST (70% Scope)

### 3.1. Módulo de Autenticación (`/api/auth`)

#### `POST /api/auth/register`
- **Propósito:** Registro de nuevos usuarios en el sistema.
- **Payload Requerido:**
  ```json
  {
    "name": "string (min 2)",
    "email": "string (email válido, único)",
    "password": "string (min 6 caracteres)"
  }
  ```
- **Comportamiento Esperado:**
  - `201 Created`: Usuario creado exitosamente. Retorna `{ user: { id, name, email, role }, token }` o mensaje de éxito.
  - `400 Bad Request`: Formato de email inválido o longitud de contraseña insuficiente (`VALIDATION_ERROR`).
  - `409 Conflict`: Email ya registrado en el sistema.

#### `POST /api/auth/login`
- **Propósito:** Autenticación de usuarios existentes y emisión de JWT.
- **Payload Requerido:**
  ```json
  {
    "email": "string (requerido)",
    "password": "string (requerido)"
  }
  ```
- **Comportamiento Esperado:**
  - `200 OK`: Retorna token JWT y datos de perfil del usuario autenticado.
  - `401 Unauthorized`: Contraseña errónea o credenciales inexistentes (`INVALID_CREDENTIALS`).
  - `400 Bad Request`: Formato de petición inválido.

---

### 3.2. Módulo de Catálogo de Libros (`/api/books`)

#### Modelo de Datos del Libro (`BookDTO`)
```typescript
interface Book {
  id?: string;
  _id?: string;
  title: string;       // Requerido, no vacío
  author: string;      // Requerido, no vacío
  isbn: string;        // Requerido, formato ISBN-10 o ISBN-13 válido
  price: number;       // Requerido, número positivo > 0
  category?: string;   // Opcional (ej: Fiction, Tech, Classic)
  createdAt?: string;  // Generado por backend
  updatedAt?: string;  // Generado por backend
}
```

#### `GET /api/books`
- **Propósito:** Consulta y filtrado del catálogo de libros.
- **Parámetros Opcionales:** `search` (búsqueda por texto), `limit`, `page`.
- **Comportamiento Esperado:**
  - `200 OK`: Retorna lista de libros (array o paginado `{ data: Book[], total, page }`).

#### `POST /api/books` (Protegido por JWT)
- **Propósito:** Creación de un nuevo libro en el catálogo.
- **Cabeceras:** `Authorization: Bearer <token>`
- **Comportamiento Esperado:**
  - `201 Created`: Libro insertado en la base de datos con ID asignado.
  - `401 Unauthorized`: Ausencia o token JWT inválido/expirado.
  - `400 Bad Request`: Error de validación en campos obligatorios (ISBN inválido, precio menor o igual a 0, título vacío).

#### `GET /api/books/:id`
- **Propósito:** Obtener detalle de un libro específico por su identificador.
- **Comportamiento Esperado:**
  - `200 OK`: Retorna el objeto `Book` correspondiente.
  - `404 Not Found`: Si el ID no existe en la base de datos o formato de ID inválido.

#### `PUT /api/books/:id` (Protegido por JWT)
- **Propósito:** Actualización de atributos de un libro existente.
- **Cabeceras:** `Authorization: Bearer <token>`
- **Comportamiento Esperado:**
  - `200 OK`: Retorna el libro con las modificaciones aplicadas.
  - `400 Bad Request`: Datos de actualización inválidos.
  - `401 Unauthorized`: Falta de token de autenticación.
  - `404 Not Found`: Libro no encontrado.

#### `DELETE /api/books/:id` (Protegido por JWT)
- **Propósito:** Eliminación de un libro del catálogo.
- **Cabeceras:** `Authorization: Bearer <token>`
- **Comportamiento Esperado:**
  - `200 OK` / `204 No Content`: Libro eliminado satisfactoriamente.
  - `401 Unauthorized`: Petición no autenticada.
  - `404 Not Found`: Si el libro ya no existe o ya fue eliminado.

---

### 3.3. Módulo de Observabilidad y Salud (`/api/health`)
- **`GET /api/health`**:
  - `200 OK`: Retorna `{ "status": "ok", "uptime": number, "timestamp": string }` confirmando conectividad activa con MongoDB.

---

## 4. Especificación Funcional del Frontend Web (30% Scope)

La interfaz gráfica es una Single Page Application (SPA) construida en React que consume la API REST local.

### 4.1. Vista de Inicio de Sesión (`/login`)
- **Elementos UI:** Campo de texto `email`, campo de contraseña `password`, botón `Iniciar Sesión` / `Login`, enlace hacia `/register`.
- **Comportamiento:**
  - Login válido: Redirige al usuario inmediatamente a `/books` y persiste el token JWT (localStorage/cookies).
  - Login erróneo: Muestra mensaje de alerta visible en el DOM sin redirigir.

### 4.2. Vista de Registro (`/register`)
- **Elementos UI:** Campo `name`, `email`, `password`, botón `Registrarse`, enlace a `/login`.
- **Comportamiento:**
  - Registro exitoso: Redirige automáticamente a `/login` mostrando notificación de bienvenida/éxito.
  - Fallo de validación: Muestra errores inline bajo los campos correspondientes.

### 4.3. Vista del Dashboard de Libros (`/books` - Ruta Protegida)
- **Control de Acceso:** Si el usuario no tiene sesión activa, redirige a `/login`.
- **Elementos UI:**
  - **Tabla de Libros:** Columnas: Título, Autor, ISBN, Precio, Categoría, Acciones (Editar, Eliminar).
  - **Barra de Búsqueda:** Input reactivo que filtra los libros de la tabla en tiempo real por título o autor.
  - **Botón "Añadir Libro" / "Nuevo":** Abre el modal de creación.
  - **Modal de Creación / Edición:** Formulario emergente con campos de libro, botón de cancelación y botón de guardado.
  - **Modal de Confirmación de Borrado:** Diálogo de seguridad que solicita confirmación antes de disparar el `DELETE`.
  - **Botón de Cerrar Sesión:** Limpia el token y redirige a `/login`.

---

## 5. Matriz de Trazabilidad y Riesgos de Automatización

| Requerimiento | Riesgo de Prueba Identificado | Mitigación Arquitectónica en el Framework |
|---|---|---|
| **Persistencia de MongoDB** | Los tests pueden contaminarse entre sí si mutan los libros semilla. | Cada prueba crea sus libros con identificadores únicos (`Faker`) y los borra automáticamente en el hook `After` (auto-teardown). |
| **Tiempo de Login en UI** | Hacer login por interfaz gráfica en cada test de UI genera lentitud y flakiness. | Se inyecta la sesión autenticada directamente en el contexto del navegador (`storageState`) vía llamada API previa, aislando los tests de login UI únicamente a su feature específica. |
| **Arranque Asíncrono en CI** | `docker compose up -d` arranca antes de que Node y Mongo estén listos. | Script de polling activo con reintentos sobre `/api/health` antes de invocar los tests. |
| **Cambios de Contrato en la API** | Modificaciones en los payloads rompen tests sin previo aviso. | Validación tipada de contratos con esquemas `Zod` en tiempo de ejecución para cada endpoint. |
