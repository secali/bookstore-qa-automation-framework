# language: es
@ui @atomic @lego @smoke
Característica: Interacción Web Atómica Tipo Puzzle (Zero Boilerplate UI)
  Como ingeniero SDET
  Quiero orquestar pruebas de UI combinando piezas de puzzle atómicas
  Para validar cualquier vista, formulario, modal o tabla sin programar nuevos selectores

  Escenario: Flujo completo de navegación, formulario modal y eliminación en tabla
    Dado que el usuario accede a la vista "/books" con sesión precargada vía API
    Entonces la URL actual contiene "/books"
    Cuando hace clic en el botón "Añadir Libro"
    Entonces el modal está visible
    Cuando en el modal activo escribe "El Arte de la Automatización Atómica" en el campo "title"
    Y en el modal activo escribe "Sergio Cañete" en el campo "author"
    Y en el modal activo escribe "9788424115549" en el campo "isbn"
    Y en el modal activo escribe "35.00" en el campo "price"
    Y en el modal activo hace clic en el botón "Guardar"
    Entonces el modal no está visible
    Y en la tabla la fila con texto "El Arte de la Automatización Atómica" está visible
    Cuando en la tabla localiza la fila con texto "El Arte de la Automatización Atómica" y hace clic en el botón "Eliminar"
    Entonces el modal está visible
    Cuando en el modal activo hace clic en el botón "Confirmar"
    Entonces el modal no está visible
    Y en la tabla la fila con texto "El Arte de la Automatización Atómica" no está visible
