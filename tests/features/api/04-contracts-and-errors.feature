# language: es
@api @contracts @negative @regression
Característica: Validación de Contratos OpenAPI y Envelope de Error Estandarizado
  Como arquitecto de pruebas
  Quiero asegurar que la API devuelve la estructura estándar de error
  Para garantizar la estabilidad del contrato con clientes web y móviles

  Antecedentes:
    Dado que estoy autenticado como administrador en la API

  @contracts
  Esquema del escenario: Rechazo ante creación de libros con datos que violan el contrato
    Cuando intento registrar un libro con "<isbn>" y precio <price>
    Entonces la respuesta de la API tiene código de estado 400
    Y la respuesta cumple con el contrato "Error"
    Y la respuesta contiene el código de error "VALIDATION_ERROR"
    Y el detalle del error indica fallo en el campo "<campo_esperado>"

    Ejemplos:
      | isbn             | price  | campo_esperado |
      | isbn_incorrecto  | 25.00  | isbn           |
      | 9780132350884    | -15.00 | price          |

  @security
  Escenario: Rechazo ante creación de libro sin cabecera de autenticación
    Cuando intento registrar un libro sin token de autenticación
    Entonces la respuesta de la API tiene código de estado 401
    Y la respuesta cumple con el contrato "Error"

  Escenario: Consulta de un libro con identificador inexistente
    Cuando consulto un libro con identificador inexistente "64f1a2b3c4d5e6f7a8b9c0d1"
    Entonces la respuesta de la API tiene código de estado 404
    Y la respuesta cumple con el contrato "Error"
