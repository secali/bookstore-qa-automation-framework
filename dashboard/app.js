/**
 * OmniSpec SDET Engine — Interactive Dashboard Logic
 * Architect: Sergio Cañete Linares (Senior QA Automation Engineer / SDET)
 */

// ============================================================================
// 1. Data Store: 21 Automated Scenarios across 9 Feature Files
// ============================================================================
const SCENARIOS = [
  // API Layer (15 Scenarios)
  {
    id: "API-01",
    file: "01-auth.feature",
    title: "Successful administrator login returns JWT token",
    layer: "API",
    tags: ["@system-test", "@functional", "@security", "@authentication", "@smoke", "@p1"]
  },
  {
    id: "API-02",
    file: "01-auth.feature",
    title: "Registration of a new user in the platform",
    layer: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@smoke", "@p1"]
  },
  {
    id: "API-03",
    file: "01-auth.feature",
    title: "Rejected login with non-existent user credentials",
    layer: "API",
    tags: ["@system-test", "@functional", "@negative-testing", "@security", "@p1"]
  },
  {
    id: "API-04",
    file: "01-auth.feature",
    title: "Registration rejected when email is already in use",
    layer: "API",
    tags: ["@system-test", "@functional", "@negative-testing", "@equivalence-partitioning", "@p1"]
  },
  {
    id: "API-05",
    file: "02-books-crud.feature",
    title: "Create a new book with valid payload",
    layer: "API",
    tags: ["@system-test", "@functional", "@positive-testing", "@smoke", "@p1"]
  },
  {
    id: "API-06",
    file: "02-books-crud.feature",
    title: "Update an existing book's price and verify update",
    layer: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@p1"]
  },
  {
    id: "API-07",
    file: "02-books-crud.feature",
    title: "Delete a book and verify it no longer exists",
    layer: "API",
    tags: ["@system-test", "@functional", "@state-transition", "@smoke", "@p1"]
  },
  {
    id: "API-08",
    file: "03-books-search.feature",
    title: "Search books by title returns matching records",
    layer: "API",
    tags: ["@system-test", "@functional", "@positive-testing", "@smoke", "@p1"]
  },
  {
    id: "API-09",
    file: "04-contracts-and-errors.feature",
    title: "Response matches the OpenAPI Book contract schema",
    layer: "API",
    tags: ["@contract", "@integration-test", "@regression", "@smoke", "@p1"]
  },
  {
    id: "API-10",
    file: "04-contracts-and-errors.feature",
    title: "Request without Authorization token returns 401 Unauthorized",
    layer: "API",
    tags: ["@security", "@system-test", "@negative-testing", "@p1"]
  },
  {
    id: "API-11",
    file: "04-contracts-and-errors.feature",
    title: "Validation errors when required fields are missing",
    layer: "API",
    tags: ["@boundary-value-analysis", "@equivalence-partitioning", "@negative-testing", "@p1"]
  },
  {
    id: "API-12",
    file: "04-contracts-and-errors.feature",
    title: "Requesting a non-existent ID returns 404 Not Found",
    layer: "API",
    tags: ["@boundary-value-analysis", "@negative-testing", "@error-guessing", "@p1"]
  },
  {
    id: "API-13",
    file: "04-contracts-and-errors.feature",
    title: "Price boundary value testing (Price <= 0 is rejected)",
    layer: "API",
    tags: ["@boundary-value-analysis", "@negative-testing", "@p1"]
  },
  {
    id: "API-14",
    file: "05-atomic-puzzle-api.feature",
    title: "Dynamic JSONPath mutation and chained CRUD verification",
    layer: "API",
    tags: ["@atomic", "@generic", "@system-test", "@smoke", "@p1"]
  },
  {
    id: "API-15",
    file: "05-atomic-puzzle-api.feature",
    title: "Data isolation: seed, verify, delete, and assert 404",
    layer: "API",
    tags: ["@atomic", "@generic", "@reliability", "@state-transition", "@p1"]
  },

  // UI Layer (6 Scenarios)
  {
    id: "UI-01",
    file: "01-login-ui.feature",
    title: "Successful login through the graphical user interface",
    layer: "UI",
    tags: ["@system-test", "@functional", "@security", "@authentication", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-02",
    file: "01-login-ui.feature",
    title: "Visible error message upon invalid login attempt",
    layer: "UI",
    tags: ["@system-test", "@functional", "@negative-testing", "@security", "@error-guessing", "@p1"]
  },
  {
    id: "UI-03",
    file: "02-books-catalog-ui.feature",
    title: "Initial table load displays pre-seeded books",
    layer: "UI",
    tags: ["@system-test", "@functional", "@positive-testing", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-04",
    file: "02-books-catalog-ui.feature",
    title: "Create a book via modal in UI and delete it from the table",
    layer: "UI",
    tags: ["@system-test", "@functional", "@state-transition", "@boundary-value-analysis", "@usability", "@p1"]
  },
  {
    id: "UI-05",
    file: "03-hybrid-e2e.feature",
    title: "Book created via API is immediately visible and searchable on UI",
    layer: "UI (Hybrid)",
    tags: ["@system-integration-test", "@functional", "@hybrid", "@usability", "@smoke", "@p1"]
  },
  {
    id: "UI-06",
    file: "04-atomic-puzzle-ui.feature",
    title: "Full user journey: Navigation, modal form submission, table deletion",
    layer: "UI (Atomic)",
    tags: ["@system-test", "@functional", "@state-transition", "@usability", "@atomic", "@generic", "@smoke", "@p1"]
  }
];

// ============================================================================
// 2. Data Store: Universal Steps Catalog
// ============================================================================
const STEPS = [
  {
    category: "api-req",
    pattern: 'When the user sends a "{method}" request to "{endpoint}"',
    desc: 'Sends an HTTP request with any verb to any endpoint without body.',
    example: 'When the user sends a "GET" request to "/books"'
  },
  {
    category: "api-req",
    pattern: 'When the user sends a "{method}" request to "{endpoint}" with body:',
    desc: 'Dispatches an HTTP request with multiline JSON docstring payload.',
    example: 'When the user sends a "POST" request to "/books" with body:\n  """\n  { "title": "Microservices", "price": 39.99 }\n  """'
  },
  {
    category: "api-json",
    pattern: 'When the user sets JSONPath "{path}" to "{value}"',
    desc: 'Dynamically mutates or injects a string into the prepared JSON payload.',
    example: 'When the user sets JSONPath "$.title" to "Advanced Playwright Architecture"'
  },
  {
    category: "api-json",
    pattern: 'When the user sets JSONPath "{path}" to the number {float}',
    desc: 'Dynamically sets a numeric float or integer at a specific JSONPath.',
    example: 'When the user sets JSONPath "$.price" to the number 49.99'
  },
  {
    category: "api-json",
    pattern: 'When the user removes JSONPath "{path}"',
    desc: 'Deletes a key/node from the payload to test schema required field errors.',
    example: 'When the user removes JSONPath "$.author"'
  },
  {
    category: "api-json",
    pattern: 'When the user saves the response JSONPath "{path}" as "{alias}"',
    desc: 'Extracts a response property into scenario context for variable chaining.',
    example: 'When the user saves the response JSONPath "$.id" as "createdId"'
  },
  {
    category: "api-assert",
    pattern: 'Then the response status code should be {int}',
    desc: 'Verifies the HTTP status code of the last API response.',
    example: 'Then the response status code should be 201'
  },
  {
    category: "api-assert",
    pattern: 'Then the response JSONPath "{path}" should equal "{expected}"',
    desc: 'Asserts the exact string value at a target JSONPath node.',
    example: 'Then the response JSONPath "$.title" should equal "Advanced Playwright Architecture"'
  },
  {
    category: "api-assert",
    pattern: 'Then the response should match the "{schemaName}" contract',
    desc: 'Validates response against OpenAPI schema via runtime Zod SchemaRegistry.',
    example: 'Then the response should match the "Book" contract'
  },
  {
    category: "ui-nav",
    pattern: 'Given the user navigates to "{path}"',
    desc: 'Navigates browser directly to relative or absolute URL path.',
    example: 'Given the user navigates to "/login"'
  },
  {
    category: "ui-nav",
    pattern: 'Given the user opens "{path}" with preloaded API session',
    desc: 'Infers authentication via API, injects JWT token into localStorage and navigates.',
    example: 'Given the user opens "/books" with preloaded API session'
  },
  {
    category: "ui-form",
    pattern: 'When the user enters "{value}" into the "{identifier}" field',
    desc: 'Locates input/textarea by testid, aria-label, placeholder or name and fills it.',
    example: 'When the user enters "admin@sandbox.com" into the "email" field'
  },
  {
    category: "ui-form",
    pattern: 'When the user clicks the "{identifier}" button',
    desc: 'Locates button by role, accessible text, testid or id and clicks it.',
    example: 'When the user clicks the "Add Book" button'
  },
  {
    category: "ui-modal",
    pattern: 'When in the active modal, the user enters "{value}" into the "{field}" field',
    desc: 'Scopes field search to current visible dialog/modal container.',
    example: 'When in the active modal, the user enters "Clean Code" into the "title" field'
  },
  {
    category: "ui-modal",
    pattern: 'When in the active modal, the user clicks the "{buttonText}" button',
    desc: 'Finds and clicks button strictly inside active modal container.',
    example: 'When in the active modal, the user clicks the "Save" button'
  },
  {
    category: "ui-modal",
    pattern: 'When in the table, the user finds the row containing "{text}" and clicks the "{button}" button',
    desc: 'Locates table row matching text and clicks action button within that row.',
    example: 'When in the table, the user finds the row containing "Clean Code" and clicks the "Delete" button'
  },
  {
    category: "ui-modal",
    pattern: 'Then the table should display at least {int} row(s)',
    desc: 'Verifies the row count of the primary active table.',
    example: 'Then the table should display at least 5 rows'
  }
];

// ============================================================================
// 3. Simulator Templates
// ============================================================================
const TEMPLATES = {
  api: `@api @atomic @regression
Feature: Dynamic API CRUD with JSONPath Mutation
  Scenario: Create book, update price dynamically, and verify
    Given the user is authenticated as an admin in the API
    When the user prepares a JSON payload:
      """
      {
        "title": "Mastering Playwright in Verisure",
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
Feature: Page-Agnostic UI Modal & Table Journey
  Scenario: Open catalog, create item via modal and delete row
    Given the user opens "/books" with preloaded API session
    Then the current URL should contain "/books"
    When the user clicks the "Add Book" button
    Then the modal should be visible
    When in the active modal, the user enters "Cloud Architecture Handbook" into the "title" field
    And in the active modal, the user enters "Sergio Cañete" into the "author" field
    And in the active modal, the user enters "9788424115549" into the "isbn" field
    And in the active modal, the user enters "39.90" into the "price" field
    And in the active modal, the user clicks the "Save" button
    Then the modal should not be visible
    And in the table, the row containing "Cloud Architecture Handbook" should be visible`,

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
// 4. Initializer & Event Listeners
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderScenarios(SCENARIOS);
  renderSteps(STEPS);
  loadTemplate("api");

  // Quickstart copy button in navbar
  const btnCopyQuickstart = document.getElementById("btn-copy-quickstart");
  if (btnCopyQuickstart) {
    btnCopyQuickstart.addEventListener("click", () => {
      const cli = "docker load -i bookstore-images.tar && docker compose up -d && npm test";
      copyText(cli);
    });
  }
});

// ============================================================================
// 5. Template Loading & Simulator Execution
// ============================================================================
function loadTemplate(type) {
  const editor = document.getElementById("gherkin-editor");
  if (!editor) return;

  editor.value = TEMPLATES[type] || TEMPLATES.api;

  // Update active state in buttons
  const buttons = document.querySelectorAll(".template-btns .btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`btn-tpl-${type}`);
  if (activeBtn) activeBtn.classList.add("active");

  const terminal = document.getElementById("terminal-output");
  if (terminal) {
    terminal.innerHTML = `
      <div class="term-line info">[Template Loaded: ${type.toUpperCase()}]</div>
      <div class="term-line text-muted">Ready. Click 'Simulate Step Execution' below to run live parsing.</div>
    `;
  }
  const status = document.getElementById("terminal-status");
  if (status) status.textContent = "Ready";
}

function resetGherkin() {
  loadTemplate("api");
  showToast("Simulator reset to default API template");
}

let isSimulating = false;
async function runSimulation() {
  if (isSimulating) return;
  isSimulating = true;

  const editor = document.getElementById("gherkin-editor");
  const terminal = document.getElementById("terminal-output");
  const status = document.getElementById("terminal-status");
  const runBtn = document.getElementById("btn-run-simulation");

  if (!editor || !terminal) return;

  runBtn.disabled = true;
  runBtn.innerHTML = "⏳ Running Engine Simulation...";
  status.textContent = "Executing...";
  status.style.color = "var(--accent-amber)";
  terminal.innerHTML = "";

  const lines = editor.value.split("\n").filter(l => l.trim().length > 0 && !l.trim().startsWith("#"));
  const addLine = (text, type = "info") => {
    const div = document.createElement("div");
    div.className = `term-line ${type}`;
    div.textContent = text;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  };

  addLine("🚀 [OmniSpec Engine] Initializing execution context...", "info");
  await sleep(250);

  let mockVariables = {
    random_isbn: "978-" + Math.floor(100000000 + Math.random() * 900000000),
    bookId: "b" + Math.floor(1000 + Math.random() * 9000)
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("@") || line.startsWith("Feature:") || line.startsWith("Scenario:")) {
      addLine(`📌 ${line}`, "text-muted");
      continue;
    }

    await sleep(180);

    // Dynamic checks
    if (line.includes("the user is authenticated as an admin")) {
      addLine(`🔑 [Auth Engine] Authenticating admin via GenericHttpClient -> POST /auth/login (200 OK)`, "success");
      addLine(`   └─ JWT Token acquired & saved to ScenarioContext.token`, "text-muted");
    } else if (line.includes("prepares a JSON payload")) {
      addLine(`📦 [Payload Engine] Initializing dynamic payload template`, "info");
    } else if (line.includes("sets JSONPath")) {
      const match = line.match(/sets JSONPath "([^"]+)" to (?:the number )?([^"]+)/);
      if (match) {
        addLine(`🧩 [JSONPath Engine] Mutating ${match[1]} => ${match[2]}`, "info");
      } else {
        addLine(`🧩 [JSONPath Engine] Dynamic mutation applied`, "info");
      }
    } else if (line.includes("sends a \"POST\" request to \"/books\"")) {
      addLine(`🌐 [GenericHttpClient] POST http://localhost:5000/api/books (Latency: 28ms)`, "info");
      addLine(`   └─ Headers: { Authorization: Bearer eyJhbG... }`, "text-muted");
      addLine(`   └─ Response Status: 201 Created`, "success");
    } else if (line.includes("the response status code should be")) {
      const code = line.match(/\d+/)?.[0] || "200";
      addLine(`✔ [Assertion] Asserting Status Code == ${code} [PASSED]`, "success");
    } else if (line.includes("the response should match the")) {
      const schema = line.match(/"([^"]+)"/)?.[1] || "Book";
      addLine(`🛡️ [Zod SchemaRegistry] Validating runtime OpenAPI contract for '${schema}' [PASSED in 3ms]`, "success");
    } else if (line.includes("saves the response JSONPath")) {
      addLine(`💾 [State Extractor] Extracting $.id => ${mockVariables.bookId} saved as 'bookId'`, "info");
    } else if (line.includes("opens \"/books\" with preloaded API session")) {
      addLine(`⚡ [Hybrid Accelerator] Injecting localStorage { token: "eyJ...", user: { role: "admin" } }`, "info");
      addLine(`   └─ Page goto: http://localhost:3000/books [DOM Content Loaded in 42ms]`, "success");
    } else if (line.includes("clicks the")) {
      const btn = line.match(/"([^"]+)"/)?.[1] || "Button";
      addLine(`👆 [ElementResolver] Resolving button "${btn}" -> Locator: button:has-text("${btn}") [CLICKED]`, "info");
    } else if (line.includes("in the active modal, the user enters")) {
      const match = line.match(/enters "([^"]+)" into the "([^"]+)" field/);
      if (match) {
        addLine(`✍️ [Modal Form] Found input[name="${match[2]}"] in active dialog -> Filled "${match[1]}"`, "info");
      }
    } else if (line.includes("in the table, the row containing")) {
      const text = line.match(/"([^"]+)"/)?.[1] || "item";
      addLine(`🔎 [ElementResolver] Table row with text "${text}" is visible [PASSED]`, "success");
    } else if (line.includes("Then the current URL should contain")) {
      addLine(`✔ [Assertion] Current browser URL matches expected route [PASSED]`, "success");
    } else if (line.includes("Then the modal should")) {
      addLine(`✔ [Assertion] Modal visibility state confirmed [PASSED]`, "success");
    } else {
      addLine(`▶ Step: ${line} [EXECUTED]`, "text-muted");
    }
  }

  await sleep(250);
  addLine(`\n✨ ========================================================`, "success");
  addLine(`🎯 Scenario Execution Completed Successfully! (0 Failures)`, "success");
  addLine(`📊 100% Generic Execution — 0 Lines of Code Generated`, "success");

  status.textContent = "Passed (100%)";
  status.style.color = "var(--accent-emerald)";
  runBtn.disabled = false;
  runBtn.innerHTML = "▶ Simulate Step Execution";
  isSimulating = false;
}

// ============================================================================
// 6. Scenario Matrix Renderer & Filter
// ============================================================================
function renderScenarios(list) {
  const tbody = document.getElementById("scenario-tbody");
  if (!tbody) return;

  tbody.innerHTML = list.map(s => {
    const layerClass = s.layer.includes("API") ? "tag-api" : "tag-ui";
    const tagBadges = s.tags.map(t => {
      let cls = "tag-istqb";
      if (t.includes("smoke")) cls = "tag-smoke";
      else if (t.includes("security") || t.includes("negative")) cls = "tag-security";
      return `<span class="tag-badge ${cls}">${t}</span>`;
    }).join(" ");

    return `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td><code>${s.file}</code></td>
        <td>${s.title}</td>
        <td><span class="tag-badge ${layerClass}">${s.layer}</span></td>
        <td>${tagBadges}</td>
      </tr>
    `;
  }).join("");
}

function filterScenarios(category) {
  const buttons = document.querySelectorAll(".matrix-filters .filter-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  if (category === "all") {
    renderScenarios(SCENARIOS);
  } else if (category === "api") {
    renderScenarios(SCENARIOS.filter(s => s.layer.includes("API")));
  } else if (category === "ui") {
    renderScenarios(SCENARIOS.filter(s => s.layer.includes("UI")));
  } else if (category === "smoke") {
    renderScenarios(SCENARIOS.filter(s => s.tags.some(t => t.includes("smoke"))));
  } else if (category === "security") {
    renderScenarios(SCENARIOS.filter(s => s.tags.some(t => t.includes("security"))));
  } else if (category === "boundary") {
    renderScenarios(SCENARIOS.filter(s => s.tags.some(t => t.includes("boundary") || t.includes("equivalence"))));
  }
}

// ============================================================================
// 7. Steps Dictionary Renderer & Search
// ============================================================================
function renderSteps(list) {
  const grid = document.getElementById("steps-grid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="term-line text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No matching steps found. Try another keyword.</div>`;
    return;
  }

  grid.innerHTML = list.map(step => `
    <div class="step-card">
      <div class="step-pattern">${escapeHtml(step.pattern)}</div>
      <p style="font-size: 0.8rem; color: var(--text-muted);">${step.desc}</p>
      <div class="step-meta">
        <span class="step-badge">${step.category}</span>
        <button class="btn-copy-step" onclick="copyText('${escapeQuotes(step.pattern)}')">Copy Gherkin</button>
      </div>
    </div>
  `).join("");
}

function searchSteps() {
  const query = document.getElementById("step-search-input").value.toLowerCase().trim();
  if (!query) {
    renderSteps(STEPS);
    return;
  }
  const filtered = STEPS.filter(s => 
    s.pattern.toLowerCase().includes(query) || 
    s.desc.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query)
  );
  renderSteps(filtered);
}

function filterStepsByCategory(cat) {
  const chips = document.querySelectorAll(".dict-tags .tag-chip");
  chips.forEach(c => c.classList.remove("active"));
  event.target.classList.add("active");

  if (cat === "all") {
    renderSteps(STEPS);
  } else {
    renderSteps(STEPS.filter(s => s.category === cat));
  }
}

// ============================================================================
// 8. Helper Utilities
// ============================================================================
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied to clipboard: ${text.substring(0, 40)}...`);
  }).catch(() => {
    // Fallback
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showToast("Copied to clipboard!");
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
