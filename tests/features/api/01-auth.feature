# language: es
@api @auth @regression
Característica: Autenticación y Gestión de Usuarios en la API
  Como usuario de la plataforma BookStore QA Sandbox
  Quiero autenticarme y registrarme a través de la API REST
  Para obtener acceso a las operaciones del catálogo

  @smoke @p1
  Escenario: Inicio de sesión exitoso con credenciales de administrador seed
    Cuando inicio sesión en la API con credenciales válidas de administrador
    Entonces la respuesta de la API tiene código de estado 200
    Y la respuesta cumple con el contrato "AuthResponse"
    Y la respuesta contiene el campo "token"

  @negative @security
  Esquema del escenario: Rechazo de autenticación con credenciales inválidas
    Cuando inicio sesión en la API con el email "<email>" y la contraseña "<password>"
    Entonces la respuesta de la API tiene código de estado 401
    Y la respuesta contiene el código de error "INVALID_CREDENTIALS"

    Ejemplos:
      | email              | password       |
      | admin@sandbox.com  | clave_erronea  |
      | noexiste@test.com  | admin123       |

  @smoke @p1
  Escenario: Registro exitoso de un nuevo usuario con datos aleatorios válidos
    Cuando registro un nuevo usuario con datos aleatorios válidos
    Entonces la respuesta de la API tiene código de estado 201
    Y la respuesta cumple con el contrato "AuthResponse"

  @negative @contracts
  Escenario: Rechazo de registro ante colisión de email ya existente
    Dado que registro un nuevo usuario con datos aleatorios válidos
    Cuando intento registrar un usuario con el mismo email ya utilizado
    Entonces la respuesta de la API tiene código de estado 409
    Y la respuesta contiene el código de error "EMAIL_ALREADY_EXISTS"
