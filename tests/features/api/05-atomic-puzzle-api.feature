# language: es
@api @atomic @lego @regression
Característica: Gestión Atómica de Recursos API (Piezas de Puzzle)
  Como ingeniero SDET
  Quiero contar con steps genéricos parametrizables
  Para probar cualquier recurso o endpoint sin tener que escribir nuevo código TypeScript

  Antecedentes:
    Dado que estoy autenticado como administrador en la API

  @smoke
  Escenario: Crear un recurso mediante payload JSON y recuperarlo usando variables en contexto
    Cuando envío una petición "POST" a "/books" con el siguiente payload JSON:
      """
      {
        "title": "{{random_title}}",
        "author": "{{random_name}}",
        "isbn": "{{random_isbn}}",
        "price": 49.99,
        "category": "Architecture"
      }
      """
    Entonces la respuesta de la API tiene código de estado 201
    Y el campo "title" de la respuesta no es nulo ni vacío
    Y el campo "price" de la respuesta es igual al número 49.99
    Cuando guardo el valor de la respuesta "id" con el alias "createdItemId"
    Y envío una petición "GET" a "/books/{{createdItemId}}"
    Entonces la respuesta de la API tiene código de estado 200
    Y el campo "id" de la respuesta es igual a "{{createdItemId}}"

  Escenario: Actualizar y eliminar recurso usando referencias dinámicas
    Dado que registro un libro con datos válidos aleatorios
    Cuando guardo el valor de la respuesta "id" con el alias "targetId"
    Y envío una petición "PUT" a "/books/{{targetId}}" con los siguientes campos:
      | price | 75.50 |
    Entonces la respuesta de la API tiene código de estado 200
    Y el campo "price" de la respuesta es igual al número 75.50
    Cuando envío una petición "DELETE" a "/books/{{targetId}}"
    Entonces la respuesta de la API tiene código de estado 200
    Cuando envío una petición "GET" a "/books/{{targetId}}"
    Entonces la respuesta de la API tiene código de estado 404
