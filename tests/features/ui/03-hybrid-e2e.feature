# language: es
@ui @hybrid @smoke
Característica: Flujo E2E Híbrido (Inyección API y Verificación en UI)
  Como ingeniero SDET
  Quiero poblar estados complejos a través de la API y verificarlos en la UI
  Para acelerar las pruebas E2E eliminando pasos lentos y flakiness

  Escenario: Libro creado por API es inmediatamente visible y filtrable en la UI
    Dado que se ha creado previamente vía API un libro con título "Arquitectura Multi-Agente QA" y precio 49.99
    Y que el usuario accede a la vista de libros con sesión activa
    Cuando busca en el catálogo el término "Arquitectura Multi-Agente"
    Entonces la tabla de libros muestra un libro con el título "Arquitectura Multi-Agente QA"
