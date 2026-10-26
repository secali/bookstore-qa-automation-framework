/**
 * OmniSpec SDET Framework — Lógica Interactiva del Panel
 * Arquitecto: Sergio Cañete Linares (Senior QA Automation Engineer / SDET)
 */

// ============================================================================
// 1. Matriz de los 21 Escenarios Automatizados (Taxonomía ISTQB)
// ============================================================================
const ESCENARIOS = [
  // Capa API REST (15 Escenarios)
  {
    id: "API-01",
    archivo: "01-auth.feature",
    titulo: "Login exitoso de administrador retorna token JWT",
    capa: "API",
    tags: ["@system-test", "@functional", "@security", "@authentication", "@smoke", "@p1"]
  },
  {
    id: "API-02",
    archivo: "01-auth.feature",
    titulo: "Registro de un nuevo usuario en la plataforma",
    capa: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@smoke", "@p1"]
  },
  {
    id: "API-03",
    archivo: "01-auth.feature",
    titulo: "Rechazo de login ante credenciales inexistentes",
    capa: "API",
    tags: ["@system-test", "@functional", "@negative-testing", "@security", "@p1"]
  },
  {
    id: "API-04",
    archivo: "01-auth.feature",
    titulo: "Rechazo de registro si el correo electrónico ya existe",
    capa: "API",
    tags: ["@system-test", "@functional", "@negative-testing", "@equivalence-partitioning", "@p1"]
  },
  {
    id: "API-05",
    archivo: "02-books-crud.feature",
    titulo: "Creación de un nuevo libro con payload válido",
    capa: "API",
    tags: ["@system-test", "@functional", "@positive-testing", "@smoke", "@p1"]
  },
  {
    id: "API-06",
    archivo: "02-books-crud.feature",
    titulo: "Actualización de precio de libro y verificación de persistencia",
    capa: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@p1"]
  },
  {
    id: "API-07",
    archivo: "02-books-crud.feature",
    titulo: "Eliminación de un libro y confirmación de ausencia (404)",
    capa: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@smoke", "@p1"]
  },
  {
    id: "API-08",
    archivo: "03-books-search.feature",
    titulo: "Búsqueda de libros por título retorna registros coincidentes",
    capa: "API",
    tags: ["@system-test", "@functional", "@positive-testing", "@smoke", "@p1"]
  },
  {
    id: "API-09",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Validación de esquema OpenAPI Zod en runtime para Book",
    capa: "API",
    tags: ["@contract", "@integration-test", "@regression", "@smoke", "@p1"]
  },
  {
    id: "API-10",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Petición sin cabecera Authorization retorna 401 Unauthorized",
    capa: "API",
    tags: ["@security", "@system-test", "@negative-testing", "@p1"]
  },
  {
    id: "API-11",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Rechazo con envelope 400 cuando faltan campos requeridos",
    capa: "API",
    tags: ["@boundary-value-analysis", "@equivalence-partitioning", "@negative-testing", "@p1"]
  },
  {
    id: "API-12",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Consulta de ID inexistente retorna 404 con envelope estándar",
    capa: "API",
    tags: ["@boundary-value-analysis", "@negative-testing", "@error-guessing", "@p1"]
  },
  {
    id: "API-13",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Prueba de valor límite para precio menor o igual a cero",
    capa: "API",
    tags: ["@boundary-value-analysis", "@negative-testing", "@p1"]
  },
  {
    id: "API-14",
    archivo: "05-atomic-puzzle-api.feature",
    titulo: "Mutación dinámica por JSONPath y CRUD encadenado sin DTOs",
    capa: "API",
    tags: ["@atomic", "@generic", "@system-test", "@smoke", "@p1"]
  },
  {
    id: "API-15",
    archivo: "05-atomic-puzzle-api.feature",
    titulo: "Aislamiento de datos: seed, aserción, borrado y teardown",
    capa: "API",
    tags: ["@atomic", "@generic", "@reliability", "@state-transition", "@p1"]
  },

  // Capa UI (6 Escenarios)
  {
    id: "UI-01",
    archivo: "01-login-ui.feature",
    titulo: "Inicio de sesión exitoso mediante formulario web",
    capa: "UI",
    tags: ["@system-test", "@functional", "@security", "@authentication", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-02",
    archivo: "01-login-ui.feature",
    titulo: "Alerta de error visible ante intento de login fallido",
    capa: "UI",
    tags: ["@system-test", "@functional", "@negative-testing", "@security", "@error-guessing", "@p1"]
  },
  {
    id: "UI-03",
    archivo: "02-books-catalog-ui.feature",
    titulo: "Carga inicial del catálogo muestra registros semilla",
    capa: "UI",
    tags: ["@system-test", "@functional", "@positive-testing", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-04",
    archivo: "02-books-catalog-ui.feature",
    titulo: "Alta de libro en modal interactivo y borrado directo en tabla",
    capa: "UI",
    tags: ["@system-test", "@functional", "@state-transition", "@boundary-value-analysis", "@usability", "@p1"]
  },
  {
    id: "UI-05",
    archivo: "03-hybrid-e2e.feature",
    titulo: "Libro creado vía API es indexado y visible en UI de inmediato",
    capa: "UI (Híbrido)",
    tags: ["@system-integration-test", "@functional", "@hybrid", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-06",
    archivo: "04-atomic-puzzle-ui.feature",
    titulo: "Recorrido completo: navegación, modal de alta y borrado en tabla",
    capa: "UI (Atómico)",
    tags: ["@system-test", "@functional", "@state-transition", "@usability", "@atomic", "@generic", "@smoke", "@p1"]
  }
];

// ============================================================================
// 2. Catálogo Universal de Pasos (Steps Dictionary)
// ============================================================================
const PASOS = [
  {
    categoria: "api-req",
    patron: 'When the user sends a "{method}" request to "{endpoint}"',
    descripcion: 'Envía una petición HTTP con cualquier verbo a cualquier ruta sin cuerpo.',
    ejemplo: 'When the user sends a "GET" request to "/books"'
  },
  {
    categoria: "api-req",
    patron: 'When the user sends a "{method}" request to "{endpoint}" with body:',
    descripcion: 'Envía una petición HTTP con payload JSON multilínea (DocString).',
    ejemplo: 'When the user sends a "POST" request to "/books" with body:\n  """\n  { "title": "Microservices", "price": 39.99 }\n  """'
  },
  {
    categoria: "api-json",
    patron: 'When the user sets JSONPath "{path}" to "{value}"',
    descripcion: 'Modifica o inyecta dinámicamente un valor string en el payload preparado.',
    ejemplo: 'When the user sets JSONPath "$.title" to "Arquitectura Limpia"'
  },
  {
    categoria: "api-json",
    patron: 'When the user sets JSONPath "{path}" to the number {float}',
    descripcion: 'Modifica o inyecta dinámicamente un valor numérico en el JSONPath objetivo.',
    ejemplo: 'When the user sets JSONPath "$.price" to the number 49.99'
  },
  {
    categoria: "api-json",
    patron: 'When the user removes JSONPath "{path}"',
    descripcion: 'Elimina una propiedad del payload para pruebas negativas de campos requeridos.',
    ejemplo: 'When the user removes JSONPath "$.isbn"'
  },
  {
    categoria: "api-json",
    patron: 'When the user saves the response JSONPath "{path}" as "{alias}"',
    descripcion: 'Extrae un valor de la respuesta y lo almacena para encadenar llamadas.',
    ejemplo: 'When the user saves the response JSONPath "$.id" as "createdId"'
  },
  {
    categoria: "api-assert",
    patron: 'Then the response status code should be {int}',
    descripcion: 'Comprueba el código de estado HTTP recibido en la última llamada.',
    ejemplo: 'Then the response status code should be 201'
  },
  {
    categoria: "api-assert",
    patron: 'Then the response JSONPath "{path}" should equal "{expected}"',
    descripcion: 'Verifica la igualdad de valor de texto en un nodo específico de la respuesta.',
    ejemplo: 'Then the response JSONPath "$.title" should equal "Arquitectura Limpia"'
  },
  {
    categoria: "api-assert",
    patron: 'Then the response should match the "{schemaName}" contract',
    descripcion: 'Valida la respuesta completa contra el contrato OpenAPI Zod en runtime.',
    ejemplo: 'Then the response should match the "Book" contract'
  },
  {
    categoria: "ui-nav",
    patron: 'Given the user navigates to "{path}"',
    descripcion: 'Navega en navegador a la ruta relativa con sincronización DOM automática.',
    ejemplo: 'Given the user navigates to "/login"'
  },
  {
    categoria: "ui-nav",
    patron: 'Given the user opens "{path}" with preloaded API session',
    descripcion: 'Inyecta token JWT en localStorage vía API y accede a la vista autenticada.',
    ejemplo: 'Given the user opens "/books" with preloaded API session'
  },
  {
    categoria: "ui-form",
    patron: 'When the user enters "{value}" into the "{identifier}" field',
    descripcion: 'Resuelve un campo por testid, etiqueta accesible, placeholder o name.',
    ejemplo: 'When the user enters "admin@sandbox.com" into the "email" field'
  },
  {
    categoria: "ui-form",
    patron: 'When the user clicks the "{identifier}" button',
    descripcion: 'Localiza un botón por accesibilidad, testid o texto y ejecuta el clic.',
    ejemplo: 'When the user clicks the "Add Book" button'
  },
  {
    categoria: "ui-modal",
    patron: 'When in the active modal, the user enters "{value}" into the "{field}" field',
    descripcion: 'Acota la resolución del campo estrictamente al contenedor modal visible.',
    ejemplo: 'When in the active modal, the user enters "Clean Code" into the "title" field'
  },
  {
    categoria: "ui-modal",
    patron: 'When in the active modal, the user clicks the "{buttonText}" button',
    descripcion: 'Busca y pulsa un botón ubicado exclusivamente dentro del diálogo activo.',
    ejemplo: 'When in the active modal, the user clicks the "Save" button'
  },
  {
    categoria: "ui-modal",
    patron: 'When in the table, the user finds the row containing "{text}" and clicks the "{button}" button',
    descripcion: 'Localiza una fila por texto y pulsa el botón de acción en esa fila.',
    ejemplo: 'When in the table, the user finds the row containing "Clean Code" and clicks the "Delete" button'
  },
  {
    categoria: "ui-modal",
    patron: 'Then the table should display at least {int} row(s)',
    descripcion: 'Verifica el recuento mínimo de filas en la tabla principal.',
    ejemplo: 'Then the table should display at least 5 rows'
  }
];

// ============================================================================
// 3. Plantillas del Simulador
// ============================================================================
const PLANTILLAS = {
  api: `@api @atomic @regression
Feature: Dynamic API CRUD with JSONPath Mutation
  Scenario: Create book, update price dynamically, and verify
    Given the user is authenticated as an admin in the API
    When the user prepares a JSON payload:
      """
      {
        "title": "Clean Architecture in TypeScript",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "price": 29.99,
        "category": "Engineering"
      }
      """
    And the user sets JSONPath "$.price" to the number 45.00
    And the user sends a "POST" request to "/books" with the prepared payload
    Then the response status code should be 201
    And the response should match the "Book" contract
    When the user saves the response JSONPath "$.id" as "bookId"
    And the user sends a "GET" request to "/books/{{bookId}}"
    Then the response status code should be 200
    And the response JSONPath "$.price" should equal the number 45.00`,

  ui: `@ui @atomic @regression
Feature: Page-Agnostic UI Modal and Table Journey
  Scenario: Open catalog, create item via modal and delete row
    Given the user opens "/books" with preloaded API session
    Then the current URL should contain "/books"
    When the user clicks the "Add Book" button
    Then the modal should be visible
    When in the active modal, the user enters "Cloud Testing Handbook" into the "title" field
    And in the active modal, the user enters "Sergio Cañete" into the "author" field
    And in the active modal, the user enters "9788424115549" into the "isbn" field
    And in the active modal, the user enters "39.90" into the "price" field
    And in the active modal, the user clicks the "Save" button
    Then the modal should not be visible
    And in the table, the row containing "Cloud Testing Handbook" should be visible`,

  hybrid: `@ui @hybrid @smoke
Feature: Hybrid Fast State Injection and Instant UI Search
  Scenario: Seed state via fast REST API and verify in UI instantly
    Given the user is authenticated as an admin in the API
    And the user sends a "POST" request to "/books" with body:
      """
      {
        "title": "Enterprise SDET Architecture",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "price": 55.00,
        "category": "Architecture"
      }
      """
    Then the response status code should be 201
    Given the user opens "/books" with preloaded API session
    When the user enters "Enterprise SDET Architecture" into the "search" field
    Then in the table, the row containing "Enterprise SDET Architecture" should be visible`
};

// ============================================================================
// 4. Inicialización
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderizarEscenarios(ESCENARIOS);
  renderizarPasos(PASOS);
  cargarPlantilla("api");
});

function cargarPlantilla(tipo) {
  const editor = document.getElementById("gherkin-editor");
  if (!editor) return;

  editor.value = PLANTILLAS[tipo] || PLANTILLAS.api;

  const botones = document.querySelectorAll(".toolbar-group .btn-tab");
  botones.forEach(b => b.classList.remove("active"));
  const btnActivo = document.getElementById(`btn-tpl-${tipo}`);
  if (btnActivo) btnActivo.classList.add("active");

  const consola = document.getElementById("console-view");
  if (consola) {
    consola.innerHTML = `
      <div class="log-row info">[Plantilla cargada: ${tipo.toUpperCase()}]</div>
      <div class="log-row muted">Listo. Pulsa "Ejecutar Simulación" para ver la traza de ejecución del motor.</div>
    `;
  }

  const status = document.getElementById("console-status");
  if (status) {
    status.textContent = "Listo";
    status.className = "console-badge";
  }
}

function restablecerGherkin() {
  cargarPlantilla("api");
  mostrarNotificacion("Simulador restablecido a la plantilla inicial.");
}

// ============================================================================
// 5. Ejecución del Simulador
// ============================================================================
let ejecutando = false;

async function ejecutarSimulacion() {
  if (ejecutando) return;
  ejecutando = true;

  const editor = document.getElementById("gherkin-editor");
  const consola = document.getElementById("console-view");
  const status = document.getElementById("console-status");
  const runBtn = document.getElementById("btn-run-sim");

  if (!editor || !consola) return;

  runBtn.disabled = true;
  runBtn.textContent = "Ejecutando...";
  status.textContent = "En progreso";
  status.style.color = "#f59e0b";
  consola.innerHTML = "";

  const lineas = editor.value.split("\n").filter(l => l.trim().length > 0 && !l.trim().startsWith("#"));
  const agregarLog = (texto, clase = "info") => {
    const div = document.createElement("div");
    div.className = `log-row ${clase}`;
    div.textContent = texto;
    consola.appendChild(div);
    consola.scrollTop = consola.scrollHeight;
  };

  agregarLog("[OmniSpec Engine] Inicializando contexto de ejecución...", "info");
  await delay(200);

  const mockId = "res-" + Math.floor(1000 + Math.random() * 9000);

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (linea.startsWith("@") || linea.startsWith("Feature:") || linea.startsWith("Scenario:")) {
      agregarLog(`• ${linea}`, "muted");
      continue;
    }

    await delay(160);

    if (linea.includes("the user is authenticated as an admin")) {
      agregarLog("  [Auth] POST /auth/login -> 200 OK (JWT guardado en context.token)", "success");
    } else if (linea.includes("prepares a JSON payload")) {
      agregarLog("  [JSON Engine] Plantilla base cargada en context.preparedPayload", "info");
    } else if (linea.includes("sets JSONPath")) {
      const m = linea.match(/sets JSONPath "([^"]+)" to (?:the number )?([^"]+)/);
      const ruta = m ? m[1] : "$.campo";
      const val = m ? m[2] : "valor";
      agregarLog(`  [JSONPath] Mutación dinámica: ${ruta} => ${val}`, "info");
    } else if (linea.includes('sends a "POST" request to "/books"')) {
      agregarLog("  [GenericHttpClient] POST http://localhost:5000/api/books (28ms) -> 201 Created", "success");
    } else if (linea.includes("the response status code should be")) {
      const cod = linea.match(/\d+/)?.[0] || "200";
      agregarLog(`  [Aserción] Status Code == ${cod} [CORRECTO]`, "success");
    } else if (linea.includes("the response should match the")) {
      const sch = linea.match(/"([^"]+)"/)?.[1] || "Book";
      agregarLog(`  [SchemaRegistry] Validación Zod en runtime para '${sch}' [CORRECTO en 2ms]`, "success");
    } else if (linea.includes("saves the response JSONPath")) {
      agregarLog(`  [State] Extraído $.id (${mockId}) asignado al alias 'bookId'`, "info");
    } else if (linea.includes('sends a "GET" request')) {
      agregarLog(`  [GenericHttpClient] GET http://localhost:5000/api/books/${mockId} (14ms) -> 200 OK`, "success");
    } else if (linea.includes("opens") && linea.includes("preloaded API session")) {
      agregarLog("  [Session] Token inyectado en localStorage vía addInitScript -> DOM cargado en 42ms", "info");
    } else if (linea.includes("clicks the")) {
      const btn = linea.match(/"([^"]+)"/)?.[1] || "Botón";
      agregarLog(`  [ElementResolver] Botón "${btn}" resuelto y pulsado`, "info");
    } else if (linea.includes("in the active modal, the user enters")) {
      const m = linea.match(/enters "([^"]+)" into the "([^"]+)" field/);
      if (m) agregarLog(`  [ElementResolver] Modal: campo "${m[2]}" completado con "${m[1]}"`, "info");
    } else if (linea.includes("in the table, the row containing")) {
      const txt = linea.match(/"([^"]+)"/)?.[1] || "item";
      agregarLog(`  [ElementResolver] Fila con texto "${txt}" visible en tabla [CORRECTO]`, "success");
    } else if (linea.includes("the current URL should contain")) {
      agregarLog("  [Aserción] URL verificada según patrón esperado [CORRECTO]", "success");
    } else if (linea.includes("the modal should")) {
      agregarLog("  [Aserción] Estado de visibilidad del modal confirmado [CORRECTO]", "success");
    } else {
      agregarLog(`  [Paso] ${linea}`, "muted");
    }
  }

  await delay(200);
  agregarLog("[OmniSpec Engine] Escenario completado exitosamente. 0 fallos, 0 código generado.", "success");

  status.textContent = "Aprobado (100%)";
  status.style.color = "#10b981";
  runBtn.disabled = false;
  runBtn.textContent = "Ejecutar Simulación";
  ejecutando = false;
}

// ============================================================================
// 6. Matriz de Escenarios y Filtros
// ============================================================================
function renderizarEscenarios(lista) {
  const tbody = document.getElementById("scenario-tbody");
  if (!tbody) return;

  tbody.innerHTML = lista.map(e => {
    const claseCapa = e.capa.includes("API") ? "tag-api" : "tag-ui";
    const badgesTags = e.tags.map(t => {
      let c = "tag-istqb";
      if (t.includes("smoke")) c = "tag-smoke";
      else if (t.includes("security") || t.includes("negative")) c = "tag-sec";
      return `<span class="tag ${c}">${t}</span>`;
    }).join(" ");

    return `
      <tr>
        <td><strong>${e.id}</strong></td>
        <td><code>${e.archivo}</code></td>
        <td>${e.titulo}</td>
        <td><span class="tag ${claseCapa}">${e.capa}</span></td>
        <td>${badgesTags}</td>
      </tr>
    `;
  }).join("");
}

function filtrarMatriz(categoria) {
  const botones = document.querySelectorAll(".filter-chips .chip");
  botones.forEach(b => b.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");

  if (categoria === "todos") {
    renderizarEscenarios(ESCENARIOS);
  } else if (categoria === "api") {
    renderizarEscenarios(ESCENARIOS.filter(e => e.capa.includes("API")));
  } else if (categoria === "ui") {
    renderizarEscenarios(ESCENARIOS.filter(e => e.capa.includes("UI")));
  } else if (categoria === "smoke") {
    renderizarEscenarios(ESCENARIOS.filter(e => e.tags.some(t => t.includes("smoke"))));
  } else if (categoria === "seguridad") {
    renderizarEscenarios(ESCENARIOS.filter(e => e.tags.some(t => t.includes("security"))));
  } else if (categoria === "limites") {
    renderizarEscenarios(ESCENARIOS.filter(e => e.tags.some(t => t.includes("boundary") || t.includes("equivalence"))));
  }
}

// ============================================================================
// 7. Catálogo de Pasos y Búsqueda
// ============================================================================
function renderizarPasos(lista) {
  const cont = document.getElementById("steps-container");
  if (!cont) return;

  if (lista.length === 0) {
    cont.innerHTML = `<div class="log-row muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No se encontraron pasos coincidentes.</div>`;
    return;
  }

  cont.innerHTML = lista.map(p => `
    <div class="step-card">
      <div class="step-code">${escapeHtml(p.patron)}</div>
      <p class="step-description">${p.descripcion}</p>
      <div class="step-actions">
        <span class="step-cat-label">${p.categoria}</span>
        <button class="btn-copy-mini" onclick="copiarTexto('${escapeQuotes(p.patron)}')">Copiar</button>
      </div>
    </div>
  `).join("");
}

function buscarPasos() {
  const q = document.getElementById("input-buscar-step").value.toLowerCase().trim();
  if (!q) {
    renderizarPasos(PASOS);
    return;
  }
  const filtrados = PASOS.filter(p => 
    p.patron.toLowerCase().includes(q) || 
    p.descripcion.toLowerCase().includes(q) ||
    p.categoria.toLowerCase().includes(q)
  );
  renderizarPasos(filtrados);
}

function filtrarCategoriaPasos(cat) {
  const pills = document.querySelectorAll(".catalog-categories .cat-pill");
  pills.forEach(p => p.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");

  if (cat === "todos") {
    renderizarPasos(PASOS);
  } else {
    renderizarPasos(PASOS.filter(p => p.categoria === cat));
  }
}

// ============================================================================
// 8. Utilidades
// ============================================================================
function copiarComandoRapido() {
  const cmd = "docker load -i bookstore-images.tar && docker compose up -d && npm test";
  copiarTexto(cmd);
}

function copiarTexto(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    mostrarNotificacion(`Copiado: ${texto.substring(0, 45)}...`);
  }).catch(() => {
    const input = document.createElement("input");
    input.value = texto;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    mostrarNotificacion("Copiado al portapapeles.");
  });
}

function mostrarNotificacion(msg) {
  const toast = document.getElementById("toast-notice");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
