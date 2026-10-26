# 📖 Universal BDD Steps Dictionary (Playwright + TypeScript + Cucumber)

> **Framework:** BookStore QA Sandbox Test Automation  
> **Philosophy:** **100% Generic / Puzzle-Piece / Zero Domain-Dedicated Steps**  
> **Architect:** Sergio Cañete Linares (Senior QA Automation Engineer / SDET & AI Test Automation Architect)  
> **Target Audience:** QA Automation Engineers, SDETs, and **Agent 3 (SDET Automation Implementer)**.  

---

## 🎯 Architecture & Golden Rules

1. **Zero Domain-Dedicated Steps Policy:**
   - There are **no specific steps for `auth`, `books`, `users`, or `orders`**.
   - The framework operates exclusively through universal, parameterizable puzzle pieces driven by [GenericHttpClient](file:///c:/Users/PC/Documents/LogNext-Verisure/src/api/clients/generic-http.client.ts), [ElementResolver](file:///c:/Users/PC/Documents/LogNext-Verisure/src/ui/support/element-resolver.ts), and the zero-dependency [jsonpath.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/support/jsonpath.ts) engine.
2. **Standard HTTP + JSONPath Integration:**
   - Any REST endpoint can be invoked using standard HTTP verbs with JSON body docstrings (`"""..."""`).
   - JSON payloads can be dynamically mutated before dispatch via `When the user sets JSONPath "$.path" to "value"`.
   - Responses can be evaluated and extracted via `Then the response JSONPath "$.path" should equal "value"`.
3. **Page-Agnostic & Resilient UI Interaction:**
   - UI steps do not require individual Page Objects. Elements on any page or modal are resolved via cascading accessible strategies (`data-testid`, `getByLabel`, `getByPlaceholder`, `name`, `#id`, `getByRole`).

---

## 🔌 1. Common API Steps (Status & OpenAPI Zod Contracts)

**File:** [tests/step-definitions/api/common-api.steps.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/step-definitions/api/common-api.steps.ts)

| Gherkin Step (Exact Syntax) | Parameters / Examples | Description / Action |
|---|---|---|
| `Then the API response status code should be {int}` | `200`, `201`, `400`, `401`, `404`, `409` | Asserts exact HTTP response code received in context. |
| `Then the response status code should be {int}` | `200`, `201`, `400`, `401`, `404`, `409` | Concise generic alias for HTTP status assertion. |
| `And the response should match the {string} contract` | `"Book"`, `"BookList"`, `"Error"`, `"Auth"` | Validates response body against corresponding runtime Zod OpenAPI schema. |
| `And the response should contain error code {string}` | `"VALIDATION_ERROR"`, `"INVALID_CREDENTIALS"` | Asserts the `code` attribute in standard error envelope. |
| `And the error details should indicate a failure in field {string}` | `"isbn"`, `"price"`, `"email"` | Confirms that the `errors` map in envelope references the field. |
| `And the response should contain field {string}` | `"token"`, `"id"` | Asserts root property presence in response JSON. |

---

## 🧩 2. Atomic API Engine (Universal HTTP & JSONPath Mutation / Validation)

**File:** [tests/step-definitions/api/atomic-api.steps.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/step-definitions/api/atomic-api.steps.ts)

### 2.1. Request Dispatching (Any HTTP Verb & Endpoint)
| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `When the user sends a {string} request to {string}` | `"GET"`, `"DELETE"`, `"/books/{{createdId}}"` | Sends request without body. Supports dynamic `{{...}}` tokens. |
| `When the user sends a {string} request to {string} with body:` | `"POST"`, `"/auth/login"` + DocString JSON | Sends request with multiline JSON body. Supports inline templates. |
| `When the user sends a {string} request to {string} with fields:` | `"PUT"`, `"/books/{{id}}"` + DataTable | Sends request with typed key-values (auto-converts booleans/numbers). |
| `When the user sends a {string} request to {string} with query parameters:` | `"GET"`, `"/books"` + DataTable | Appends URL query parameters (e.g. `search=Kafka`). |

### 2.2. JSON Preparation & Dynamic JSONPath Mutation
| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `Given the user prepares a JSON payload:` | DocString JSON | Stores base JSON template in scenario context for subsequent mutations. |
| `When the user sets JSONPath {string} to {string}` | `"$.title"`, `"{{random_title}}"` | Sets or overwrites string property at JSONPath before sending. |
| `When the user sets JSONPath {string} to the number {float}` | `"$.price"`, `49.99` | Sets or overwrites numeric property at JSONPath. |
| `When the user sets JSONPath {string} to the boolean {word}` | `"$.active"`, `true` | Sets or overwrites boolean property at JSONPath. |
| `When the user removes JSONPath {string}` | `"$.isbn"` | Deletes a property at JSONPath (ideal for negative testing of mandatory fields). |
| `When the user sends a {string} request to {string} with the prepared payload` | `"POST"`, `"/books"` | Dispatches HTTP request with mutated JSON payload. |

### 2.3. Headers & Authorization Management
| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `Given the user is authenticated as an admin in the API` | *None* | Fast API login using default credentials, setting Bearer token in context. |
| `Given the user is authenticated with email {string} and password {string}` | Email, Password | Authenticates with specific credentials and sets Bearer token. |
| `When the user sets HTTP header {string} to {string}` | Header name, Value | Injects custom HTTP header for downstream requests. |
| `When the user clears custom HTTP headers` | *None* | Resets custom headers. |
| `When the user sets the Bearer authorization token to {string}` | Token / `{{token}}` | Directly sets Bearer token. |
| `When the user removes the authorization token` | *None* | Clears Authorization header to test 401 unauthenticated access. |

### 2.4. JSONPath Response Extraction (Lego Puzzle Chaining)
| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `When the user saves the response JSONPath {string} as {string}` | `"$.id"`, `"createdBookId"` | Extracts value via JSONPath and stores in `this.context.storedData[alias]`. |

### 2.5. JSONPath Response Assertions
| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `Then the response JSONPath {string} should equal {string}` | `"$.title"`, `"Clean Code"` | Asserts string equality at JSONPath (supports `{{alias}}`). |
| `Then the response JSONPath {string} should equal the number {float}` | `"$.price"`, `49.99` | Asserts numeric value at JSONPath. |
| `Then the response JSONPath {string} should contain {string}` | `"$.errors.isbn"`, `"format"` | Asserts substring presence at JSONPath. |
| `Then the response JSONPath {string} should not be null or empty` | `"$.token"` | Asserts non-null presence and non-empty string. |
| `Then the response JSONPath {string} should not exist` | `"$.deletedField"` | Asserts property absence at JSONPath. |
| `Then the response JSONPath {string} should be an array with at least {int} item(s)` | `"$"`, `5` | Validates array length at JSONPath (or root array `"$"`). |
| `Then the response should contain an array with at least {int} item(s)` | `5` | Validates root response body array length. |
| `Then the response header {string} should contain {string}` | `"content-type"`, `"json"` | Asserts substring presence in HTTP response header. |

---

## 🖥️ 3. Common UI Steps (Playwright Browser & Navigation)

**File:** [tests/step-definitions/ui/common-ui.steps.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/step-definitions/ui/common-ui.steps.ts)

| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `Given the user navigates to {string}` | `"/login"`, `"/register"` | Navigates to relative URL with DOM auto-waiting. |
| `Then the current URL should contain {string}` | `"/books"` | Waits for URL to match regex with auto-retry. |
| `When the user clicks the {string} button` | Button text or testid | Resolves via `getByRole('button')` or testid with auto-waiting. |
| `Then the {string} button should be visible` | Button text or testid | Asserts visibility with auto-retry. |
| `Then the {string} button should be enabled` | Button text or testid | Asserts button is not disabled. |
| `When the user enters {string} into the {string} field` | Value, Field identifier | Resolves via `getByLabel`, `getByPlaceholder`, or `name` and fills value. |
| `Then the text {string} should be visible on screen` | Expected text | Asserts text presence on the active page. |
| `Then the text {string} should not be visible on screen` | Unexpected text | Asserts text is absent. |
| `When the user waits for {int} second(s)` | Seconds count | Explicit wait for special timing cases. |

---

## 🏛️ 4. Page-Agnostic UI Engine (ElementResolver Driven)

**File:** [tests/step-definitions/ui/atomic-ui.steps.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/tests/step-definitions/ui/atomic-ui.steps.ts)

Operates across ANY page, form, modal or table by supplying the page/modal name and the target element identifier:

| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `Given the user opens the {string} page with preloaded API session` | `"Books"`, `"Dashboard"`, `"/orders"` | Obtains JWT via fast API call, injects into `localStorage`, and navigates directly. |
| `When on the {string} page, the user enters {string} into the {string} field` | Page name, Value, Element identifier | Resolves field by testid, label, placeholder, name, or id on that view. |
| `When on the {string} page, the user clicks the {string} button` | Page name, Button identifier | Finds and clicks button on specified page. |
| `Then on the {string} page, the {string} button should be disabled` | Page name, Button identifier | Asserts button is in disabled state. |
| `Then on the {string} page, the {string} button should be enabled` | Page name, Button identifier | Asserts button is in enabled state. |
| `Then the modal should be visible` | *None* | Verifies that an active modal or dialog (`.modal, [role="dialog"]`) is open. |
| `Then the modal should not be visible` | *None* | Verifies that modal is closed/hidden. |
| `When in the active modal, the user enters {string} into the {string} field` | Value, Field identifier | Scopes input resolution strictly within the active modal dialog. |
| `When in the {string} modal, the user enters {string} into the {string} field` | Modal title, Value, Field identifier | Scopes input resolution to a specifically titled modal. |
| `When in the active modal, the user clicks the {string} button` | Button text / identifier | Clicks button strictly inside active modal (`"Save"`, `"Confirm"`). |
| `When in the {string} modal, the user clicks the {string} button` | Modal title, Button identifier | Clicks button in a specifically titled modal dialog. |
| `Then in the active modal, the text {string} should be visible` | Expected text in modal | Scopes text assertion strictly within the open modal. |
| `When in the table, the user finds the row containing {string} and clicks the {string} button` | Row text, Button identifier | Finds matching table row and clicks the row action button (`"Delete"`, `"Edit"`). |
| `Then in the table, the row containing {string} should be visible` | Row text | Asserts that a row with the given text exists in the table. |
| `Then in the table, the row containing {string} should not be visible` | Row text | Asserts row absence in the table. |
| `Then the table should display at least {int} row(s)` | Min rows integer | Asserts minimum number of rows in the active table. |
| `Then the {string} table should display at least {int} row(s)` | Table identifier, Min rows integer | Asserts minimum rows in a specific table identified by testid or selector. |
| `Then an alert message should be displayed on screen` | *None* | Universal assertion for any toast, error, or alert notification. |
| `Then an error alert message should be displayed on screen` | *None* | Asserts error message presence across any page or view. |
| `Then an alert message containing {string} should be visible` | Substring text | Asserts text within any alert/notification container. |
| `When the user clears the {string} field` | Field identifier | Clears text from input field. |
| `When the user selects option {string} in the {string} dropdown` | Option label, Select identifier | Selects option in dropdown element. |
| `Then the {string} field should have value {string}` | Field identifier, Expected value | Asserts input element value. |
| `When the user checks the {string} checkbox` | Checkbox identifier | Checks an accessible checkbox or switch. |
| `When the user unchecks the {string} checkbox` | Checkbox identifier | Unchecks an accessible checkbox or switch. |

---

## 🎭 5. Dynamic Template Variables ([template-resolver.ts](file:///c:/Users/PC/Documents/LogNext-Verisure/src/support/template-resolver.ts))

Usable inside any Gherkin string, endpoint, or JSON payload:
- `{{random_email}}`: Unique lowercase email address.
- `{{random_name}}`: Random full name.
- `{{random_title}}`: Dynamic item title with unique alphanumeric suffix.
- `{{random_uuid}}`: Unique UUID v4 string.
- `{{random_isbn}}`: Valid ISBN-13 format string.
- `{{random_price}}`: Numeric price between 10.00 and 150.00.
- `{{token}}`: Current JWT authentication token in scenario context.
- `{{lastId}}`: Most recently created resource ID.
- `{{<any_alias>}}`: Any value captured via `When the user saves the response JSONPath "<path>" as "<alias>"`.

---

## 🏷️ 6. Mandatory ISTQB Tagging Taxonomy

| Dimension | ISTQB Tags | Purpose |
|---|---|---|
| **Test Level** | `@integration-test`, `@system-test`, `@system-integration-test` | Testing scope in the system hierarchy. |
| **Test Type** | `@functional`, `@security`, `@contract`, `@usability`, `@reliability` | Quality characteristics validated. |
| **Design Technique** | `@boundary-value-analysis`, `@equivalence-partitioning`, `@state-transition`, `@error-guessing` | Formal black-box design techniques. |
| **Polarity** | `@positive-testing`, `@negative-testing` | Happy-path vs. robustness/error paths. |
| **Execution Scope** | `@smoke`, `@regression`, `@p1` | Pipeline triggering and test selection. |
| **Paradigm** | `@atomic`, `@generic`, `@hybrid` | Signifies puzzle-piece, page-agnostic automation. |
