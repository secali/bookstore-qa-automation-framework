# 📊 Estrategia de Pruebas: Distribución 70% API / 30% UI y Niveles N1-N4

Esta estrategia traduce el desafío técnico de **LogNext-Verisure** al marco de trabajo por niveles de prueba (N1-N4) característico de la metodología de **Sergio Cañete Linares**.

---

## ⚖️ Distribución de Esfuerzo y Cobertura

```text
              ▲
             / \
            /   \       30% UI / E2E
           /  UI \      (Flujos críticos de negocio, UX reactiva, validaciones visuales)
          /───────\
         /   API   \    70% API / Backend
        / Contratos \   (Contratos OpenAPI, Schemas Zod, CRUD, Auth JWT, Errores estándar)
       /─────────────\
```

---

## 🪜 Clasificación de Pruebas por Niveles (N1 - N4)

### Nivel N1: Pruebas de Contrato y Esquema (API)
- **Objetivo**: Asegurar que las respuestas de la API cumplen estrictamente con la especificación OpenAPI (`/api/docs.json`).
- **Validaciones Clave**:
  - Esquema exitoso de libro individual: campos obligatorios (`id`/`_id`, `title`, `author`, `isbn`, `price`), tipos de datos correctos.
  - Esquema de lista de libros: array de objetos válidos y metadatos de paginación.
  - **Envelope de error estandarizado**: Todas las respuestas 4xx/5xx deben cumplir con:
    ```json
    {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed.",
      "errors": {
        "isbn": "isbn must be a valid ISBN-10 or ISBN-13."
      }
    }
    ```

### Nivel N2: Pruebas Funcionales Aisladas de Componentes API (API)
- **Objetivo**: Cobertura exhaustiva de cada endpoint REST bajo condiciones nominales y de frontera.
- **Matriz de Endpoints**:
  1. `POST /api/auth/register`:
     - Registro exitoso con email único y contraseña válida.
     - Fallo con email duplicado (`409 Conflict`).
     - Fallo con campos vacíos o contraseñas débiles (`400 Bad Request`).
  2. `POST /api/auth/login`:
     - Login exitoso con credenciales seed (`admin@sandbox.com` / `admin123`) -> retorna JWT.
     - Fallo con credenciales erróneas (`401 Unauthorized`).
     - Fallo con formato de email inválido (`400 Bad Request`).
  3. `GET /api/books`:
     - Listar libros sin autenticación (o con autenticación según spec).
     - Validación de libros semilla (5 libros iniciales).
  4. `POST /api/books`:
     - Creación de libro con payload completo válido (`201 Created`).
     - Intento de creación sin token JWT (`401 Unauthorized`).
     - Creación con ISBN inválido o precio negativo (`400 Validation Error`).
  5. `GET /api/books/:id`:
     - Obtención por ID existente (`200 OK`).
     - ID inexistente o formato inválido (`404 Not Found`).
  6. `PUT /api/books/:id`:
     - Actualización parcial/total de campos (`200 OK`).
     - Intento de modificar libro inexistente (`404 Not Found`).
  7. `DELETE /api/books/:id`:
     - Borrado exitoso (`200 OK` o `204 No Content`).
     - Reintento de borrado sobre el mismo ID (`404 Not Found`).

### Nivel N3: Pruebas de Integración y Búsqueda (API)
- **Objetivo**: Validar el comportamiento del backend ante consultas complejas y concurrencia.
- **Casos Clave**:
  - Búsqueda por término parcial de título o autor.
  - Filtro por categorías o rangos de precio.
  - Integridad transaccional: un libro borrado no debe aparecer en los resultados de búsqueda posteriores.

### Nivel N4: Pruebas E2E en Frontend (30% UI) y Flujos Híbridos
- **Objetivo**: Validar la experiencia de usuario en la aplicación React (`http://localhost:3000`).
- **Casos Clave en UI**:
  1. **Autenticación en UI**:
     - Inicio de sesión con credenciales válidas redirige a `/books`.
     - Error visual en pantalla ante contraseña incorrecta.
     - Registro de nuevo usuario en `/register` y redirección a `/login`.
  2. **Gestión del Catálogo en UI (`/books`)**:
     - Carga de la tabla y verificación de libros semilla.
     - Apertura del modal "Nuevo Libro", completado de formulario y verificación de aparición en la tabla.
     - Filtro en vivo mediante la barra de búsqueda.
     - Apertura de modal de confirmación y borrado de un libro.
  3. **Flujos Híbridos (El Sello SDET)**:
     - *Setup por API -> Verificación en UI*: Se crea un libro vía `POST /api/books` con Faker y se valida su renderizado inmediato en el dashboard de React.
     - *Acción en UI -> Verificación en API*: Se edita el precio de un libro mediante el modal de la UI y se consulta `GET /api/books/:id` para confirmar la persistencia en MongoDB.

---

## 🧹 Gestión y Aislamiento de Datos de Prueba

Para garantizar la idempotencia de las ejecuciones (incluso en paralelo):
- **Evitar mutar libros semilla** de forma permanente.
- **Creación dinámica**: En cada test que requiera un libro, se crea mediante el helper API con datos aleatorios (`@faker-js/faker`).
- **Auto-Teardown**: El `CustomWorld` almacena `createdBookIds = []`. Al terminar el escenario, el hook `After` elimina automáticamente todos los libros creados mediante llamadas `DELETE /api/books/:id`.
