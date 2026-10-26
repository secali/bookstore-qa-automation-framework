# language: es
@api @books @search @regression
Característica: Búsqueda y Filtrado en el Catálogo de Libros vía API
  Como usuario del sistema
  Quiero realizar búsquedas y filtros en la API
  Para localizar libros específicos con rapidez

  Antecedentes:
    Dado que estoy autenticado como administrador en la API

  Escenario: Búsqueda de libros por término coincidente
    Dado que registro un nuevo libro con los siguientes datos:
      | title                       | author        | isbn          | price | category |
      | Patrones de Diseño GoF 2026 | Erich Gamma   | 9780201633610 | 54.00 | Software |
    Cuando busco libros en la API con el término "Patrones de Diseño"
    Entonces la respuesta de la API tiene código de estado 200
    Y la respuesta cumple con el contrato "BookList"
    Y la lista de libros contiene al menos 1 libro
