# language: es
@ui @auth @smoke
Característica: Flujo de Inicio de Sesión en la Interfaz Web
  Como usuario de la aplicación BookStore
  Quiero iniciar sesión mediante el formulario web
  Para acceder al panel de administración del catálogo

  Escenario: Inicio de sesión exitoso desde la interfaz gráfica
    Dado que el usuario navega a la página "/login"
    Cuando el usuario ingresa sus credenciales de administrador en la pantalla de login
    Entonces la URL actual contiene "/books"

  @negative
  Escenario: Error visible al intentar iniciar sesión con credenciales erróneas
    Dado que el usuario navega a la página "/login"
    Cuando el usuario ingresa el email "admin@sandbox.com" y la contraseña "password_incorrecta"
    Entonces se muestra un mensaje de error en pantalla
    Y la URL actual contiene "/login"
