## 📋 Resumen del Cambio
Describir brevemente el propósito de esta PR y los componentes afectados.

## 🎯 Tipo de Cambio
- [ ] 🐛 Corrección de bug
- [x] ✨ Nueva funcionalidad / Step definition / Factory
- [x] 🧪 Suite de pruebas / Nuevos escenarios
- [x] 📚 Actualización de documentación
- [x] ⚙️ CI/CD y configuración de Docker

## 🛡️ Lista de Verificación de Calidad SDET
- [x] **Confidencialidad:** Las imágenes `bookstore-images.tar` NO están presentes en los commits ni en el historial de Git.
- [x] **Pirámide de Pruebas:** Mantiene la proporción aproximada 70% API / 30% UI.
- [x] **Zero Orphan Steps:** Todos los steps son genéricos, reutilizables y sin referencias a selectores o endpoints en los `.feature`.
- [x] **Aislamiento de Datos:** Las entidades creadas se limpian en el hook `After` (incluyendo detecciones en la UI).
- [x] **TypeScript & Linter:** `npx tsc --noEmit` y `npm run lint` pasan con 0 errores.
- [x] **Pruebas Unitarias:** `npm run test:unit` pasa al 100%.
- [x] **Suite BDD Completa:** `npm test` pasa al 100%.

## 📸 Evidencias de Ejecución
- Reporte Cucumber HTML generado: `reports/cucumber-html-report.html`
- Dashboard interactivo disponible: `dashboard/index.html`
