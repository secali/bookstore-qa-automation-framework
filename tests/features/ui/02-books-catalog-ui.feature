# language: es
@ui @books @regression
Característica: Gestión del Catálogo de Libros en el Dashboard Web
  Como administrador autenticado
  Quiero interactuar con la tabla de libros y sus modales
  Para gestionar visualmente el inventario

  Antecedentes:
    Dado que el usuario accede a la vista de libros con sesión activa

  @smoke
  Escenario: Carga inicial de la tabla y verificación de libros semilla
    Entonces la tabla de libros muestra al menos 5 filas

  Escenario: Creación de un libro mediante modal en la UI y posterior borrado
    Cuando abre el modal y registra un nuevo libro con título "Playwright con TypeScript en Verisure", autor "Sergio Cañete", isbn "9788424115549" y precio 29.99
    Entonces la tabla de libros muestra un libro con el título "Playwright con TypeScript en Verisure"
    Cuando elimina el libro con título "Playwright con TypeScript en Verisure" desde la interfaz
    Entonces el libro con título "Playwright con TypeScript en Verisure" ya no aparece en la tabla
