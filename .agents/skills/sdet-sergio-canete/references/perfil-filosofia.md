# 👤 Perfil y Filosofía: Sergio Cañete Linares

**Senior QA Automation Engineer / SDET | Test Automation Architect | AI-Driven Testing**  
*Contacto: sergio13896@gmail.com | [linkedin.com/in/secali](https://linkedin.com/in/secali) | [github.com/secali](https://github.com/secali) | +34 661 15 71 64*

---

## 🚀 Resumen del Perfil

Senior QA Automation Engineer / SDET con más de 6 años de experiencia diseñando arquitecturas de automatización para microservicios y sistemas orientados a eventos (Kafka).
- **Core Stacks**: TypeScript, Java, Python, Playwright, Cucumber (BDD/Gherkin), Rest Assured, Karate, Gatling, Selenium.
- **Pionero en AI & Multi-Agent QA**: Construcción de agentes de IA y servidores MCP a medida sobre GitHub Copilot, desarrollo guiado por especificaciones (Spec-Driven Development), Bitácora Avanzada (Memory Bank + MCP para GitHub Copilot) y automatización de flujos multi-agente E2E para QA.
- **Desarrollo de Herramientas Propias**:
  - *Kafka-Te Testing Framework*: Framework propio combinando Apache Kafka y Karate DSL para pruebas BDD de integración asíncrona.
  - *Orquestador de Pipeline QA Multi-Agente*: Ecosistema de 6 agentes de IA con servidores MCP para análisis de historias, planificación estratégica por niveles (N1-N4), generación de Gherkin, step definitions y triaje de regresiones.
  - *Plugin IntelliJ IDEA — Cucumber Unused Steps Analyzer*: Detección y refactorización automática de step definitions huérfanas en proyectos BDD de gran tamaño.
  - *Karate + Gatling Performance Testing*: Reutilización directa de escenarios funcionales BDD como simulaciones de carga y estrés.

---

## 🎯 Filosofía Aplicada al Proyecto LogNext-Verisure

### 1. Shift-Left & Testability by Design
No esperamos a que el software esté desplegado para pensar en la calidad. Participamos desde el análisis de la especificación técnica (OpenAPI/Swagger) y los criterios de aceptación para:
- Detectar inconsistencias en contratos antes de escribir una línea de test.
- Garantizar que los endpoints tengan identificadores predecibles y códigos de estado REST estándar.
- Establecer datos semilla y estrategias de aislamiento desde el primer momento.

### 2. Pirámide de Pruebas Pragmática (70% API / 30% UI)
- **70% API (Backend)**: Los microservicios y APIs son el núcleo del negocio. Aquí se ejecutan las pruebas más rápidas, deterministas y exhaustivas: validaciones de esquema (Zod), límites de campos (título, precio, ISBN), flujos de autenticación JWT y control de errores envelope `{ code, message, errors }`.
- **30% UI (E2E Frontend)**: La UI se reserva para validar los caminos críticos de usuario, la experiencia reactiva y la integración con el backend.
- **Evitar la redundancia UI**: Para pruebas que requieran usuario autenticado en la UI (ej. gestionar catálogo en `/books`), se inyecta el token o estado de sesión generado vía API (`storageState` de Playwright), reservando la interacción manual con el formulario de login únicamente para los escenarios específicos de login.

### 3. Spec-Driven Development (SDD) & BDD Limpio
- Los archivos `.feature` se escriben en **Gherkin declarativo de negocio**. Un analista o Product Owner debe poder leerlos sin ver detalles de transporte (URLs, headers HTTP) ni selectores CSS de frontend.
- **Zero Orphan Steps**: Cada step definition debe ser genérico, parametrizable y de propósito claro, evitando duplicaciones innecesarias.

### 4. CI/CD como Ciudadano de Primera Clase
- Una suite de pruebas que no se ejecuta de forma fiable en CI/CD carece de valor.
- El desafío de tener imágenes locales `bookstore-images.tar` sin registro público se aborda mediante un pipeline automatizado y reproducible en GitHub Actions o Jenkins, con carga de imagen (`docker load`), orquestación efímera (`docker compose`), healthcheck polling y ejecución en paralelo por tags.

### 5. AI-Assisted QA & Living Documentation
- El código del framework, los fixtures y los steps están estructurados con tipado estricto (TypeScript) y nombres semánticos, facilitando que agentes de IA colaboren en la generación de nuevos casos sin alucinaciones ni desalineaciones de contrato.
