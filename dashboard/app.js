/**
 * OmniSpec SDET Framework — Lógica Interactiva del Panel
 * Arquitecto: Sergio Cañete Linares (Senior QA Automation Engineer / SDET)
 */

// ============================================================================
// 1. Matriz de los 19 Escenarios Automatizados (Taxonomía ISTQB)
// ============================================================================
const ESCENARIOS = [
  // Capa API REST (13 Escenarios)
  {
    id: "API-01",
    archivo: "01-auth.feature",
    titulo: "Login exitoso con credenciales semilla de administrador retorna token JWT",
    capa: "API",
    tags: ["@system-test", "@functional", "@security", "@authentication", "@smoke", "@p1"]
  },
  {
    id: "API-02",
    archivo: "01-auth.feature",
    titulo: "Registro exitoso de un nuevo usuario con datos dinámicos Faker",
    capa: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@smoke", "@p1"]
  },
  {
    id: "API-03",
    archivo: "01-auth.feature",
    titulo: "Rechazo de login ante credenciales inválidas (Scenario Outline)",
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
    titulo: "Consulta del catálogo y verificación de los libros semilla",
    capa: "API",
    tags: ["@integration-test", "@functional", "@positive-testing", "@contract", "@smoke", "@p1"]
  },
  {
    id: "API-06",
    archivo: "02-books-crud.feature",
    titulo: "Creación exitosa de libro con payload válido y validación DataTable",
    capa: "API",
    tags: ["@integration-test", "@functional", "@positive-testing", "@contract", "@datatable", "@p1"]
  },
  {
    id: "API-07",
    archivo: "02-books-crud.feature",
    titulo: "Mutación de payload vía JSONPath y DataTable con validación de persistencia",
    capa: "API",
    tags: ["@integration-test", "@functional", "@atomic", "@generic", "@datatable", "@p1"]
  },
  {
    id: "API-08",
    archivo: "02-books-crud.feature",
    titulo: "Ciclo de vida completo: Crear, Consultar por ID, Actualizar y Borrar",
    capa: "API",
    tags: ["@integration-test", "@functional", "@state-transition", "@crud", "@smoke", "@p1"]
  },
  {
    id: "API-09",
    archivo: "03-books-search.feature",
    titulo: "Búsqueda de libros por término coincidente en título",
    capa: "API",
    tags: ["@integration-test", "@functional", "@positive-testing", "@smoke", "@p1"]
  },
  {
    id: "API-10",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Validación de esquema OpenAPI Zod en runtime (Scenario Outline)",
    capa: "API",
    tags: ["@contract", "@integration-test", "@regression", "@zod", "@smoke", "@p1"]
  },
  {
    id: "API-11",
    archivo: "04-contracts-and-errors.feature",
    titulo: "Petición sin cabecera Authorization retorna 401 Unauthorized",
    capa: "API",
    tags: ["@security", "@system-test", "@negative-testing", "@p1"]
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
    titulo: "Rechazo con envelope estándar cuando faltan campos requeridos (Outline)",
    capa: "API",
    tags: ["@boundary-value-analysis", "@equivalence-partitioning", "@negative-testing", "@p1"]
  },

  // Capa UI (6 Escenarios)
  {
    id: "UI-01",
    archivo: "01-login-ui.feature",
    titulo: "Inicio de sesión exitoso mediante formulario web en navegador",
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
    titulo: "Carga inicial del catálogo muestra al menos 5 registros semilla",
    capa: "UI",
    tags: ["@system-test", "@functional", "@positive-testing", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-04",
    archivo: "02-books-catalog-ui.feature",
    titulo: "Alta de libro en modal con formulario DataTable y borrado reactivo en tabla",
    capa: "UI",
    tags: ["@system-test", "@functional", "@state-transition", "@datatable", "@usability", "@p1"]
  },
  {
    id: "UI-05",
    archivo: "03-hybrid-e2e.feature",
    titulo: "Libro creado vía API es inmediatamente visible y buscable en UI",
    capa: "UI (Híbrido)",
    tags: ["@system-integration-test", "@functional", "@hybrid", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-06",
    archivo: "03-hybrid-e2e.feature",
    titulo: "Inyección de sesión vía API bypass de login repetitivo en navegador",
    capa: "UI (Híbrido)",
    tags: ["@system-test", "@functional", "@performance", "@hybrid", "@smoke", "@p1"]
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
    patron: 'When the user updates the prepared payload with data:',
    descripcion: 'Aplica mutaciones dinámicas masivas en el payload mediante tabla Gherkin (DataTable).',
    ejemplo: 'When the user updates the prepared payload with data:\n  | jsonPath | Value |\n  | $.title  | {{random_title}} |\n  | $.price  | 49.99 |'
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
    patron: 'Then the response FROM "{endpoint}" is validated with data:',
    descripcion: 'Valida múltiples nodos JSONPath de la respuesta en un solo paso mediante DataTable.',
    ejemplo: 'Then the response FROM "/books" is validated with data:\n  | jsonPath | Value |\n  | $.title  | Kafka |\n  | $.price  | 45.50 |'
  },
  {
    categoria: "api-assert",
    patron: 'Then the API response status code should be {int}',
    descripcion: 'Comprueba el código de estado HTTP recibido en la última llamada.',
    ejemplo: 'Then the API response status code should be 201'
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
    patron: 'When in the active modal, the user fills the form with data:',
    descripcion: 'Rellena múltiples campos de un modal o formulario en un único paso mediante DataTable.',
    ejemplo: 'When in the active modal, the user fills the form with data:\n  | field  | value |\n  | title  | Clean Code |\n  | price  | 29.99 |'
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
  "api-crud": `@api @books @datatable @smoke
Feature: Dynamic API CRUD with JSONPath & DataTables
  Scenario: Create book with mutation, assert via DataTable
    Given the user is authenticated as an admin in the API
    When the user prepares a JSON payload:
      """
      {
        "title": "Base Architecture",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "price": 10.00,
        "category": "Tech"
      }
      """
    And the user updates the prepared payload with data:
      | jsonPath | Value |
      | $.title  | Kafka Architecture in Verisure |
      | $.price  | 49.99 |
    When the user sends a "POST" request to "/books" with the prepared payload
    Then the API response status code should be 201
    And the response should match the "Book" contract
    And the response is validated with data:
      | jsonPath | Value |
      | $.title  | Kafka Architecture in Verisure |
      | $.price  | 49.99 |`,

  "ui-modal": `@ui @books @datatable @regression
Feature: Page-Agnostic UI Modal with DataTable Form Filling
  Scenario: Open catalog, create item via modal and delete row
    Given the user opens "/books" with preloaded API session
    Then the table should display at least 5 rows
    When the user clicks the "Add Book" button
    Then the modal should be visible
    When in the active modal, the user fills the form with data:
      | field  | value |
      | title  | Playwright Automation in TypeScript |
      | author | Sergio Cañete |
      | isbn   | {{random_isbn}} |
      | price  | 35.50 |
    And in the active modal, the user clicks the "Save" button
    Then the modal should not be visible
    And in the table, the row containing "Playwright Automation in TypeScript" should be visible`,

  "hybrid-state": `@ui @hybrid @smoke @performance
Feature: Hybrid Fast State Injection and Instant UI Search
  Scenario: Seed state via fast REST API and verify in UI instantly
    Given the user is authenticated as an admin in the API
    And the user sends a "POST" request to "/books" with body:
      """
      {
        "title": "Enterprise SDET Architecture",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "price": 49.99,
        "category": "Architecture"
      }
      """
    Then the API response status code should be 201
    Given the user opens "/books" with preloaded API session
    When the user enters "Enterprise SDET Architecture" into the "search" field
    Then in the table, the row containing "Enterprise SDET Architecture" should be visible`
};

// ============================================================================
// 4. Inicialización e Interacciones DOM
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderMatriz(ESCENARIOS);
  renderCatalogo(PASOS);
  cargarPlantilla("api-crud");
});

function renderMatriz(lista) {
  const tbody = document.getElementById("scenario-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  lista.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge-id">${item.id}</span></td>
      <td><span class="badge-capa ${item.capa.toLowerCase().includes("api") ? "capa-api" : "capa-ui"}">${item.capa}</span></td>
      <td class="font-mono text-muted text-xs">${item.archivo}</td>
      <td class="scenario-title">${item.titulo}</td>
      <td>
        <div class="tags-cluster">
          ${item.tags.map(t => `<span class="tag-pill">${t}</span>`).join("")}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarMatriz(criterio) {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");

  if (criterio === "todos") {
    renderMatriz(ESCENARIOS);
  } else if (criterio === "API") {
    renderMatriz(ESCENARIOS.filter(s => s.capa === "API"));
  } else if (criterio === "UI") {
    renderMatriz(ESCENARIOS.filter(s => s.capa.includes("UI")));
  } else if (criterio === "contrato") {
    renderMatriz(ESCENARIOS.filter(s => s.tags.includes("@contract")));
  } else if (criterio === "limite") {
    renderMatriz(ESCENARIOS.filter(s => s.tags.includes("@boundary-value-analysis")));
  }
}

function renderCatalogo(lista) {
  const container = document.getElementById("steps-container");
  if (!container) return;
  container.innerHTML = "";

  lista.forEach(paso => {
    const card = document.createElement("div");
    card.className = "step-card";
    card.onclick = () => copiarTexto(paso.patron);
    card.innerHTML = `
      <div class="step-card-header">
        <span class="step-cat-tag ${paso.categoria}">${paso.categoria.toUpperCase()}</span>
        <span class="step-copy-hint">Click para copiar</span>
      </div>
      <div class="step-pattern font-mono">${escaparHtml(paso.patron)}</div>
      <div class="step-desc">${paso.descripcion}</div>
    `;
    container.appendChild(card);
  });
}

function buscarPasos() {
  const query = document.getElementById("input-buscar-step").value.toLowerCase();
  const filtrados = PASOS.filter(p => 
    p.patron.toLowerCase().includes(query) || 
    p.descripcion.toLowerCase().includes(query)
  );
  renderCatalogo(filtrados);
}

function filtrarCategoriaPasos(categoria) {
  const pills = document.querySelectorAll(".cat-pill");
  pills.forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");

  if (categoria === "todos") {
    renderCatalogo(PASOS);
  } else {
    renderCatalogo(PASOS.filter(p => p.categoria === categoria));
  }
}

function cargarPlantilla(tipo) {
  const textarea = document.getElementById("gherkin-input");
  if (textarea && PLANTILLAS[tipo]) {
    textarea.value = PLANTILLAS[tipo];
  }

  const btns = document.querySelectorAll(".btn-template");
  btns.forEach(b => b.classList.remove("active"));
  if (event && event.target && event.target.classList.contains("btn-template")) {
    event.target.classList.add("active");
  }
}

function ejecutarSimulacion() {
  const terminal = document.getElementById("console-output");
  const statusEl = document.getElementById("console-status");
  const gherkin = document.getElementById("gherkin-input").value;

  statusEl.textContent = "Ejecutando...";
  statusEl.style.color = "#3b82f6";
  terminal.innerHTML = "";

  const lineas = gherkin.split("\n").filter(l => l.trim().length > 0);
  let delay = 60;

  appendLog("info", `[START] Parseando escenario Gherkin (${lineas.length} líneas)...`);

  lineas.forEach((linea, idx) => {
    const raw = linea.trim();
    if (raw.startsWith("@") || raw.startsWith("Feature:") || raw.startsWith("Scenario:") || raw.startsWith("|") || raw.startsWith('"""')) {
      return;
    }

    setTimeout(() => {
      resolverPasoEnTerminal(raw);
    }, delay);

    delay += 120;
  });

  setTimeout(() => {
    appendLog("success", "[PASSED] Escenario completado exitosamente con 0 ambigüedades (100% verde).");
    statusEl.textContent = "Exitoso (Passed)";
    statusEl.style.color = "#10b981";
  }, delay + 100);
}

function resolverPasoEnTerminal(paso) {
  if (paso.includes("authenticated as an admin")) {
    appendLog("exec", `[API AUTH] POST /auth/login &rarr; 200 OK (JWT guardado en context.authToken)`);
  } else if (paso.includes("POST") && paso.includes("/books")) {
    appendLog("exec", `[HTTP CALL] POST /api/books (Body con datos Faker resueltos) &rarr; 201 Created`);
    appendLog("zod", `[ZOD VALIDATION] SchemaRegistry.validate("Book", response.body) &rarr; Schema Validated (0.4ms)`);
  } else if (paso.includes("GET") && paso.includes("/books")) {
    appendLog("exec", `[HTTP CALL] GET /api/books &rarr; 200 OK`);
  } else if (paso.includes("updates the prepared payload with data:")) {
    appendLog("jsonpath", `[DATATABLE MUTATION] Parseando DataTable y mutando nodos JSONPath en memoria`);
  } else if (paso.includes("validated with data:")) {
    appendLog("assert", `[DATATABLE ASSERT] Validando 2 aserciones JSONPath en un solo paso &rarr; MATCH`);
  } else if (paso.includes("preloaded API session")) {
    appendLog("playwright", `[SESSION INJECT] page.addInitScript() precargó sesión JWT en localStorage`);
  } else if (paso.includes("fills the form with data:")) {
    appendLog("playwright", `[DATATABLE UI] Modal interactivo: 4 campos rellenados secuencialmente vía ElementResolver`);
  } else if (paso.includes("clicks the") && paso.includes("button")) {
    appendLog("playwright", `[ELEMENT RESOLVER] Clic en botón accesible con auto-wait Playwright &rarr; Triggered`);
  } else if (paso.includes("should be visible")) {
    appendLog("assert", `[ASSERTION] Elemento visible y sincronizado en DOM`);
  } else {
    appendLog("exec", `[STEP RESOLVED] ${paso}`);
  }
}

function appendLog(tipo, msg) {
  const terminal = document.getElementById("console-output");
  if (!terminal) return;
  const div = document.createElement("div");
  div.className = `console-line ${tipo}`;
  div.innerHTML = msg;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

function copiarTexto(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast("Copiado al portapapeles: " + texto.substring(0, 40) + "...");
  });
}

function copiarComandoRapido() {
  copiarTexto("docker load -i bookstore-images.tar && docker compose up -d && npm test");
}

function mostrarToast(msg) {
  const toast = document.getElementById("toast-notice");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function escaparHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
