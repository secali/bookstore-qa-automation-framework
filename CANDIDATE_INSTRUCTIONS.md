
# 🚀Desafío Técnico: QA Automation Engineer (API-First & CI/CD Focus)

¡Bienvenido al proceso de selección! Este reto está diseñado para evaluar tus capacidades en la arquitectura de frameworks de automatización con un enfoque de **Backend/API (70%)**, **UI/Integración (30%)**, y tu capacidad para integrar soluciones robustas dentro de un ciclo de vida de **CI/CD**.

---

## 📦 1. Configuración del Entorno de Pruebas

Recibirás un paquete `.zip` con el entorno local contenerizado, listo para ejecutar, que incluye la aplicación objetivo ("BookStore QA Sandbox"), su API REST, Swagger y la base de datos. La aplicación se entrega como imágenes Docker ya construidas: no necesitas compilar nada.

### Requisitos Previos:
- Docker Desktop (o Docker Engine + Docker Compose v2) instalado en tu máquina.
- Conexión a internet (la primera vez se descarga la imagen oficial de MongoDB).
- Node.js (v18+) y TypeScript.
- Git.

### Instrucciones de Despliegue Local:
1. Descomprime el paquete y abre una terminal dentro de la carpeta descomprimida.
2. Carga las imágenes de la aplicación en Docker (solo es necesario la primera vez):

   ```bash
   docker load -i bookstore-images.tar
   ```
3. Levanta la infraestructura:

   ```bash
   docker compose up -d
   ```
4. Verifica que los servicios estén arriba (`docker compose ps` debe mostrarlos como `healthy`):
   - **Frontend (UI):** `http://localhost:3000`
   - **Swagger API Docs:** `http://localhost:5000/api/docs`
   - **Credenciales Semilla por Defecto:**
     - **Email:** `admin@sandbox.com`
     - **Password:** `admin123`

Encontrarás más detalles del entorno (comandos útiles y solución de problemas) en el `README.md` del paquete.

---

## 🎯 2. El Reto, Propuesta de Cobertura y CI/CD

Debes construir desde cero un framework de automatización en un **repositorio de GitHub personal y público (Temporalmente mientras hacemos las validaciones, luego lo puedes poner como privado)**. 

### Requisitos Tecnológicos:
- **Herramienta:** Playwright con TypeScript, Java, o tu preferencia
- **Enfoque de BDD:** Cucumber (archivos `.feature` en lenguaje Gherkin).
- **Enfoque Principal:** 70% automatización de servicios/APIs (validación de schemas, contratos, flujos de autenticación y CRUD completo) y 30% UI / Integración E2E.

### Tu Propuesta de Calidad y CI/CD:
1. **Propuesta de Escenarios:** Diseña y propón la estrategia de pruebas y los escenarios Gherkin necesarios para garantizar la robustez de la plataforma (pruebas de contrato, validaciones de esquema, flujos aislados y combinados API-UI).
2. **Pipeline de CI/CD:** Incluye en tu repositorio un archivo de configuración de integración continua (ej. **GitHub Actions** en `.github/workflows/` o un **Jenkinsfile** simulado/real). El pipeline debe al menos:
   - Configurar Node.js y levantar/conectar el entorno de pruebas.
   - Instalar dependencias y ejecutar la suite de pruebas (preferiblemente en paralelo).
   - Generar y archivar los reportes de prueba como artefactos.

   > **Importante:** el entorno se entrega únicamente como imágenes Docker dentro del archivo `bookstore-images.tar` y no está publicado en ningún registro. **No publiques el paquete ni las imágenes en repositorios o registros públicos.** Decide cómo disponibilizar el entorno dentro de tu pipeline y documenta en tu `README.md` la solución elegida, sus limitaciones y las alternativas que consideraste.

---

## 📬 3. Instrucciones de Entrega

1. Crea un **repositorio** en GitHub para tu proyecto.
2. Utiliza una estrategia de ramas limpia.
3. Tu `README.md` debe incluir:
   - Pasos para instalar y ejecutar localmente.
   - Instrucciones para correr las pruebas (con soporte de ejecución en paralelo).
   - Explicación de la estrategia de CI/CD implementada.