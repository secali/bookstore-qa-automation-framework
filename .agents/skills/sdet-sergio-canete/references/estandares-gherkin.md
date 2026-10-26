# ✍️ Estándares BDD y Guía de Estilo Gherkin

Como autor de herramientas de análisis de step definitions (Plugin IntelliJ IDEA — *Cucumber Unused Steps Analyzer*) y arquitecto BDD, **Sergio Cañete Linares** promueve un estándar estricto para la redacción de especificaciones ejecutables.

---

## 💎 Principios Fundamentales de BDD

1. **Lenguaje Declarativo vs Imperativo**:
   - ❌ **Incorrecto (Imperativo / Acoplado a la UI)**:
     ```gherkin
     Dado que hago clic en el botón con id "#login-btn"
     Y escribo "admin@sandbox.com" en el input "#email"
     Y escribo "admin123" en el input "#password"
     Cuando presiono la tecla Enter
     Entonces espero 3 segundos y veo el texto "Dashboard"
     ```
   - ✅ **Correcto (Declarativo / Enfocado en Negocio)**:
     ```gherkin
     Dado que el usuario inicia sesión con credenciales de administrador
     Cuando consulta el catálogo de libros
     Entonces visualiza los libros disponibles en el inventario
     ```

2. **Zero Orphan Steps (Cero Steps Huérfanos)**:
   - Cada Step Definition debe ser genérico, modular y reutilizable en múltiples features.
   - Si un paso solo se usa una vez y contiene lógica muy específica, refactorizarlo para parametrizar valores mediante `{string}`, `{int}` o Data Tables.

3. **Independencia de Escenarios**:
   - Ningún escenario debe depender de que otro escenario se haya ejecutado previamente.
   - Cada escenario debe preparar su propio estado en el `Dado (Given)` y limpiar sus datos en el hook de teardown.

---

## 🏷️ Taxonomía de Tags Semánticos

Los tags permiten filtrar ejecuciones selectivas en local y en el pipeline de CI/CD:

| Tag | Propósito | Ejemplo de Uso |
|---|---|---|
| `@api` | Pruebas de backend (70% de la suite). No levantan navegador. | `npx cucumber-js --tags "@api"` |
| `@ui` | Pruebas de interfaz gráfica con Playwright (30% de la suite). | `npx cucumber-js --tags "@ui"` |
| `@smoke` | Flujos vitales mínimos (Health check, login válido, listado inicial). | En cada PR o commit rápido. |
| `@regression` | Suite completa con casos borde y variaciones de datos. | En ejecuciones nocturnas o pre-release. |
| `@contracts` | Validaciones estrictas de esquemas OpenAPI y tipos de datos. | En cambios de versión de API. |
| `@security` | Escenarios de autorización, token JWT inválido/expirado, accesos prohibidos. | Auditoría de endpoints protegidos. |
| `@hybrid` | Escenarios que combinan acciones vía API con validación en UI. | E2E cruzado. |

---

## 📝 Estructura Canónica de Features

### Ejemplo 1: Feature de API (`tests/features/api/02-books-crud.feature`)
```gherkin
@api @books @regression
Característica: Gestión del Catálogo de Libros (CRUD vía API REST)
  Como administrador autenticado del sistema
  Quiero gestionar los libros a través de la API
  Para mantener actualizado el catálogo de la librería

  Antecedentes:
    Dado que estoy autenticado como administrador en la API

  @smoke @p1
  Escenario: Creación exitosa de un nuevo libro en el catálogo
    Cuando registro un nuevo libro con los siguientes datos:
      | title          | author           | isbn          | price | category |
      | El Quijote II  | Miguel Cervantes | 9788424115549 | 24.95 | Classic  |
    Entonces la respuesta de la API tiene código de estado 201
    Y la respuesta cumple con el esquema de contrato "BookResponse"
    Y el libro registrado contiene los datos enviados

  @contracts @negative
  Esquema del escenario: Rechazo al crear libro con datos inválidos
    Cuando intento registrar un libro con "<isbn>" y precio <price>
    Entonces la respuesta de la API tiene código de estado 400
    Y la respuesta contiene el código de error "VALIDATION_ERROR"
    Y el detalle del error especifica el campo con fallo

    Ejemplos:
      | isbn          | price  |
      | isbn-invalido | 20.00  |
      | 9788424115549 | -5.00  |
```

### Ejemplo 2: Feature de UI con Setup Híbrido (`tests/features/ui/03-hybrid-e2e.feature`)
```gherkin
@ui @hybrid @smoke
Característica: Visualización Inmediata de Libros Creados por API en la UI
  Como usuario de la aplicación BookStore
  Quiero que los libros creados en el backend se reflejen en el catálogo web
  Para tener una visión consistente de los datos

  Escenario: Un libro inyectado por API es visible en la tabla web
    Dado que existe un libro creado previamente vía API con título "Microservicios con Kafka"
    Y que el usuario accede a la vista del catálogo en la web
    Cuando busca el libro por el título "Microservicios con Kafka"
    Entonces la tabla del catálogo muestra exactamente 1 resultado
    Y el resultado muestra el título "Microservicios con Kafka" y su precio correspondiente
```
