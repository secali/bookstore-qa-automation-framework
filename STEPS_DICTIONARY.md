# 📖 Diccionario de Steps y Convenciones BDD (Cucumber + Playwright)

> **Framework:** BookStore QA Sandbox Automation  
> **Propósito:** Catálogo oficial de Step Definitions genéricas, reutilizables y parametrizables.  
> **Destinatario Principal:** **Agente 3 (SDET Automation Implementer)** y equipo de QA para evitar la duplicación de código, eliminar steps huérfanos y acelerar la redacción de pruebas.

---

## 🎯 Reglas de Oro del Agente 3 (SDET Implementer)

1. **Reutilizar antes de Crear:** Antes de implementar una nueva step definition, consulta este diccionario. El 85% de las necesidades de prueba se resuelven combinando los steps existentes.
2. **Cero Steps Huérfanos (*Zero Orphan Steps*):** Todo step creado debe ser parametrizable y de propósito general. No crees steps acoplados a valores únicos o estáticos.
3. **Lenguaje Declarativo de Negocio:** Prohibido usar selectores CSS, IDs técnicos o endpoints HTTP en los archivos `.feature`.
4. **Tipado Estricto:** Toda nueva step definition debe estar fuertemente tipada en TypeScript y usar `CustomWorld` como contenedor de contexto e inyección de dependencias.
5. **Auto-Teardown Obligatorio:** Cualquier step que cree entidades en la base de datos debe registrar su identificador en `this.context.createdBookIds`.

---

## 🔌 1. Capa API: Steps Genéricos y Aserciones Comunes

**Archivo de origen:** `tests/step-definitions/api/common-api.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Descripción / Acción |
|---|---|---|
| `Entonces la respuesta de la API tiene código de estado {int}` | `{int}`: ej. `200`, `201`, `400`, `401`, `404`, `409` | Valida el código de estado HTTP recibido en `this.context.lastResponse`. |
| `Y la respuesta cumple con el contrato {string}` | `{string}`: `"Book"`, `"BookList"`, `"Error"`, `"Auth"` | Ejecuta la validación estricta del esquema Zod contra el cuerpo JSON recibido. |
| `Y la respuesta contiene el código de error {string}` | `{string}`: ej. `"VALIDATION_ERROR"`, `"INVALID_CREDENTIALS"`, `"EMAIL_ALREADY_EXISTS"` | Valida el atributo `code` en el envelope estándar de error. |
| `Y el detalle del error indica fallo en el campo {string}` | `{string}`: ej. `"isbn"`, `"price"`, `"email"` | Comprueba que el objeto `errors` contenga la clave especificada. |
| `Y la respuesta contiene el campo {string}` | `{string}`: ej. `"token"`, `"user"`, `"id"` | Valida la presencia de un atributo en la raíz de la respuesta JSON. |

---

## 🔑 2. Capa API: Autenticación y Usuarios (`@auth`)

**Archivo de origen:** `tests/step-definitions/api/auth.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Descripción / Acción |
|---|---|---|
| `Dado que estoy autenticado como administrador en la API` | *Ninguno* | Inicia sesión con `admin@sandbox.com` y guarda el token JWT en `this.context.token`. |
| `Cuando inicio sesión en la API con credenciales válidas de administrador` | *Ninguno* | Realiza la llamada `POST /api/auth/login` con credenciales seed. |
| `Cuando inicio sesión en la API con el email {string} y la contraseña {string}` | `{string}`, `{string}` | Dispara el login con credenciales arbitrarias (positivo o negativo). |
| `Cuando registro un nuevo usuario con nombre {string}, email {string} y contraseña {string}` | `{string}`, `{string}`, `{string}` | Llama a `POST /api/auth/register` con los datos especificados. |
| `Dado/Cuando registro un nuevo usuario con datos aleatorios válidos` | *Ninguno* | Genera usuario único con `@faker-js/faker` y lo registra. Guarda datos en `storedData`. |
| `Cuando intento registrar un usuario con el mismo email ya utilizado` | *Ninguno* | Reintenta el registro con el email previo para provocar colisión `409 Conflict`. |

---

## 📚 3. Capa API: Gestión de Libros y CRUD (`@books`)

**Archivo de origen:** `tests/step-definitions/api/books.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Descripción / Acción |
|---|---|---|
| `Cuando solicito el listado completo de libros a la API` | *Ninguno* | Envía `GET /api/books` con headers de autenticación. |
| `Cuando busco libros en la API con el término {string}` | `{string}`: ej. `"Kafka"`, `"GoF"` | Envía `GET /api/books?search=<término>`. |
| `Dado/Cuando registro un nuevo libro con los siguientes datos:` | `DataTable`: columnas `title`, `author`, `isbn`, `price`, `category` | Crea un libro desde tabla Gherkin y registra su ID para auto-teardown. |
| `Dado/Cuando registro un libro con datos válidos aleatorios` | *Ninguno* | Crea un libro con Faker y registra su ID para auto-teardown. |
| `Cuando intento registrar un libro con "{isbn}" y precio {price}` | `{string}` (ISBN), `{float}` (precio positivo o negativo) | Prueba de contrato negativo (ISBN inválido, precio <= 0). |
| `Cuando intento registrar un libro sin token de autenticación` | *Ninguno* | Envía `POST /api/books` omitiendo la cabecera `Authorization`. |
| `Cuando consulto el libro por su identificador recién creado` | *Ninguno* | Envía `GET /api/books/:id` usando el último ID generado. |
| `Cuando consulto un libro con identificador inexistente {string}` | `{string}`: ID no existente | Envía `GET /api/books/<id>` esperando un 404. |
| `Cuando actualizo el precio del libro recién creado a {float}` | `{float}`: ej. `89.99` | Envía `PUT /api/books/:id` actualizando el precio. |
| `Cuando elimino el libro recién creado` | *Ninguno* | Envía `DELETE /api/books/:id` sobre el último libro creado. |
| `Cuando reintento eliminar el mismo libro recién borrado` | *Ninguno* | Reintenta el `DELETE` sobre el mismo ID esperando `404 Not Found`. |
| `Entonces la lista de libros contiene al menos {int} libro(s)` | `{int}`: ej. `5`, `1` | Comprueba la cantidad mínima de elementos en la respuesta. |
| `Y el libro registrado contiene el título {string}` | `{string}`: título esperado | Valida el campo `title` devuelto. |
| `Y el libro registrado contiene los datos enviados` | *Ninguno* | Compara los atributos devueltos con los enviados en la tabla. |
| `Y el precio del libro obtenido es {float}` | `{float}`: precio esperado | Valida el campo `price` numérico. |

---

## 🖥️ 4. Capa UI: Steps Genéricos y Resilientes (Playwright)

**Archivo de origen:** `tests/step-definitions/ui/common-ui.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Acción Playwright |
|---|---|---|
| `Dado que el usuario navega a la página {string}` | `{string}`: ej. `"/login"`, `"/register"` | `page.goto(path)` con espera de DOM. |
| `Entonces la URL actual contiene {string}` | `{string}`: ej. `"/books"` | `page.waitForURL(regex)` con auto-retry. |
| `Cuando hace clic en el botón {string}` | `{string}`: texto o rol del botón | `page.getByRole('button', { name: regex }).click()` con auto-waiting. |
| `Entonces el botón {string} está visible` | `{string}`: nombre del botón | `expect(page.getByRole('button', ...)).toBeVisible()`. |
| `Entonces el botón {string} está habilitado` | `{string}`: nombre del botón | `expect(page.getByRole('button', ...)).toBeEnabled()`. |
| `Cuando escribe {string} en el campo {string}` | `{string}` (valor), `{string}` (etiqueta/placeholder) | Resuelve por `getByLabel`, `getByPlaceholder` o `name` y hace `.fill()`. |
| `Entonces visualiza el texto {string} en la pantalla` | `{string}`: texto esperado | `expect(page.getByText(regex)).toBeVisible()`. |
| `Entonces no visualiza el texto {string} en la pantalla` | `{string}`: texto que no debe estar | `expect(page.getByText(regex)).not.toBeVisible()`. |
| `Cuando espera {int} segundo(s)` | `{int}`: segundos | Espera explícita para casos especiales. |

---

## 🔐 5. Capa UI: Login y Autenticación en Pantalla

**Archivo de origen:** `tests/step-definitions/ui/login-ui.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Acción Playwright |
|---|---|---|
| `Cuando el usuario ingresa sus credenciales de administrador en la pantalla de login` | *Ninguno* | Rellena `admin@sandbox.com` / `admin123` y hace submit vía `LoginPage`. |
| `Cuando el usuario ingresa el email {string} y la contraseña {string}` | `{string}`, `{string}` | Rellena credenciales específicas en el formulario. |
| `Entonces se muestra un mensaje de error en pantalla` | *Ninguno* | Espera y valida la visibilidad de alertas de error en la UI. |

---

## 📊 6. Capa UI: Dashboard de Libros y Modales

**Archivo de origen:** `tests/step-definitions/ui/books-ui.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Acción Playwright |
|---|---|---|
| `Dado que el usuario accede a la vista de libros con sesión activa` | *Ninguno* | **Optimización SDET:** Obtiene JWT vía API y lo inyecta en `localStorage`. Entra directo a `/books` autenticado. |
| `Cuando busca en el catálogo el término {string}` | `{string}`: término de búsqueda | Rellena la barra de búsqueda reactiva del dashboard. |
| `Cuando abre el modal y registra un nuevo libro con título {string}, autor {string}, isbn {string} y precio {float}` | `{string}`, `{string}`, `{string}`, `{float}` | Abre modal, completa formulario vía `BookModalComponent` y guarda. |
| `Cuando elimina el libro con título {string} desde la interfaz` | `{string}`: título de libro en tabla | Localiza la fila, pulsa botón de papelera y confirma en `DeleteModalComponent`. |
| `Entonces la tabla de libros muestra al menos {int} fila(s)` | `{int}`: número de filas | Valida el recuento de filas en la tabla del catálogo. |
| `Entonces la tabla de libros muestra un libro con el título {string}` | `{string}`: título del libro | Valida que la fila con el título esté visible en la tabla. |
| `Entonces el libro con título {string} ya no aparece en la tabla` | `{string}`: título del libro | Valida que la fila ya no exista en el DOM. |

---

## ⚡ 7. Flujos Híbridos (Inyección API + Verificación UI)

**Archivo de origen:** `tests/step-definitions/ui/books-ui.steps.ts`

| Step Gherkin (Sintaxis Exacta) | Parámetros | Acción Playwright |
|---|---|---|
| `Dado que se ha creado previamente vía API un libro con título {string} y precio {float}` | `{string}`, `{float}` | Crea el libro instantáneamente por llamada REST `POST /api/books` antes de abrir el navegador. |

---

## 🛠️ Convenciones de Código para el Agente 3 al Crear Nuevos Steps

Si una nueva historia de usuario requiere crear un step no cubierto:
1. **Ubicación:**
   - Si es de API genérica ➔ `src/step-definitions/api/common-api.steps.ts`
   - Si es de API de entidad ➔ `src/step-definitions/api/<entidad>.steps.ts`
   - Si es de UI genérica ➔ `src/step-definitions/ui/common-ui.steps.ts`
   - Si es de UI de vista ➔ `src/step-definitions/ui/<vista>.steps.ts`
2. **Estructura del Step:**
   ```typescript
   When('acción genérica con {string} y {int}', async function (this: CustomWorld, texto: string, numero: number) {
     // 1. Acceder a this.apiClient o this.page / Page Object
     // 2. Ejecutar la acción
     // 3. Almacenar el resultado en this.context si otro paso lo necesita
   });
   ```
3. **Validación:** Ejecuta `npm run format && npm run lint && npx tsc --noEmit && npx cucumber-js --dry-run` para garantizar cero roturas en la suite.
