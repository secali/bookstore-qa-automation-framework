# language: es
@api @books @regression
Característica: Gestión del Catálogo de Libros (CRUD vía API REST)
  Como administrador autenticado en BookStore
  Quiero realizar operaciones CRUD sobre los libros
  Para mantener actualizado y consistente el catálogo

  Antecedentes:
    Dado que estoy autenticado como administrador en la API

  @smoke @p1
  Escenario: Consultar el listado de libros y verificar libros semilla
    Cuando solicito el listado completo de libros a la API
    Entonces la respuesta de la API tiene código de estado 200
    Y la respuesta cumple con el contrato "BookList"
    Y la lista de libros contiene al menos 5 libros

  @smoke @p1
  Escenario: Creación exitosa de un libro con payload válido
    Cuando registro un nuevo libro con los siguientes datos:
      | title                     | author         | isbn          | price | category |
      | Architecture with Kafka   | Sergio Cañete  | 9780132350884 | 45.50 | Tech     |
    Entonces la respuesta de la API tiene código de estado 201
    Y la respuesta cumple con el contrato "Book"
    Y el libro registrado contiene los datos enviados

  @p1
  Escenario: Ciclo de vida completo: Crear, Consultar por ID, Modificar y Eliminar
    Dado que registro un libro con datos válidos aleatorios
    Y la respuesta de la API tiene código de estado 201
    Cuando consulto el libro por su identificador recién creado
    Entonces la respuesta de la API tiene código de estado 200
    Y la respuesta cumple con el contrato "Book"
    Cuando actualizo el precio del libro recién creado a 89.99
    Entonces la respuesta de la API tiene código de estado 200
    Y el precio del libro obtenido es 89.99
    Cuando elimino el libro recién creado
    Entonces la respuesta de la API tiene código de estado 200
    Cuando reintento eliminar el mismo libro recién borrado
    Entonces la respuesta de la API tiene código de estado 404
