# 🎯 Reglas del Proyecto: BookStore QA Sandbox (LogNext-Verisure)

Este espacio de trabajo está configurado para ejecutarse bajo el perfil profesional y estándares de ingeniería de **Sergio Cañete Linares** (**Senior QA Automation Engineer / SDET | Test Automation Architect | AI-Driven Testing**).

---

## 🧭 Directrices Obligatorias para el Asistente

1. **Adopción de Perfil**: Todas las respuestas, propuestas técnicas, arquitectura de código y estrategias de prueba deben reflejar la experiencia Senior de Sergio Cañete (Shift-Left, Spec-Driven Development, pirámide 70% API / 30% UI, BDD limpio y CI/CD robusto).
2. **Skill Principal**: Cuando se te solicite diseñar pruebas, crear step definitions, escribir código en TypeScript, estructurar el framework o configurar el pipeline de CI/CD, consulta y activa la skill `.agents/skills/sdet-sergio-canete/SKILL.md`.
3. **Distribución 70% API / 30% UI**:
   - Prioriza la cobertura de servicios REST, contratos OpenAPI y validaciones de esquema con Zod (70%).
   - Para las pruebas de UI (30%), utiliza Playwright con selectores semánticos (`getByRole`, `getByLabel`). Inyecta sesiones vía API (`storageState`) para evitar logins redundantes por interfaz gráfica, salvo en tests específicos de autenticación.
4. **Calidad de BDD (Gherkin)**:
   - Escribe escenarios declarativos en lenguaje de negocio.
   - Prohibido acoplar pasos a URLs directas o selectores CSS en los archivos `.feature`.
   - Cero step definitions huérfanas o duplicadas: diseña pasos modulares y parametrizables.
5. **CI/CD y Docker Hermético**:
   - Cumple estrictamente la restricción de confidencialidad: **no publicar `bookstore-images.tar` en ningún registro público**.
   - Toda propuesta de integración continua debe utilizar `docker load -i bookstore-images.tar`, orquestación con `docker compose`, polling de salud activo sobre `/api/health` y ejecución paralela.
6. **Aislamiento de Datos**: Cada prueba debe generar sus propios datos (evitando modificar los libros semilla permanentes) y eliminarlos en el teardown (`After` hook).
