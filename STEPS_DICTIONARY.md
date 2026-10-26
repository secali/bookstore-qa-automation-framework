# 📖 BDD Steps Dictionary and Conventions (Cucumber + Playwright)

> **Framework:** BookStore QA Sandbox Test Automation  
> **Target Audience:** **Agent 3 (SDET Automation Implementer)** and QA Automation Engineers.  
> **Core Objective:** Provide an exhaustive, standardized catalog of generic, reusable, and parameterizable step definitions to prevent code duplication, eliminate orphan steps, and enable zero-code test writing.

---

## 🎯 Golden Rules for Agent 3 (SDET Implementer)

1. **Reuse Before Creating:** Always search this dictionary first. 90% of all API and UI testing needs are solved by combining existing atomic steps.
2. **Zero Orphan Steps Policy:** Every newly created step must be parameterizable and generic. Never create steps tightly coupled to a single hardcoded value.
3. **Declarative Business Language:** Never write technical CSS selectors, IDs, or raw URLs in `.feature` files. Express business intent.
4. **Strict Typing with CustomWorld:** Every step definition must be strongly typed in TypeScript and consume `this: CustomWorld` for dependency injection (`this.apiClient`, `this.page`, `this.elementResolver`, `this.context`).
5. **Mandatory Auto-Teardown:** Any step creating persistent entities in the database must register the resulting ID in `this.context.createdBookIds`.
6. **Page-Agnostic & Identifier-Driven UI:** UI steps must operate across ANY page or modal simply by specifying the page/modal name and the target element identifier (`data-testid`, `aria-label`, `placeholder`, `role`, or `name`).

---

## 🔌 1. Common API Steps (Generic Status & Schema Assertions)

**File:** `tests/step-definitions/api/common-api.steps.ts`

| Gherkin Step (Exact Syntax) | Parameters | Description / Action |
|---|---|---|
| `Then the API response status code should be {int}` | `{int}`: e.g. `200`, `201`, `400`, `401`, `404`, `409` | Verifies the HTTP status code received in `this.context.lastResponse`. |
| `And the response should match the {string} contract` | `{string}`: `"Book"`, `"BookList"`, `"Error"`, `"Auth"` | Validates the response body against the corresponding Zod OpenAPI schema. |
| `And the response should contain error code {string}` | `{string}`: e.g. `"VALIDATION_ERROR"`, `"INVALID_CREDENTIALS"` | Verifies the `code` attribute in the standard error envelope. |
| `And the error details should indicate a failure in field {string}` | `{string}`: e.g. `"isbn"`, `"price"`, `"email"` | Confirms that the `errors` map contains the specified field key. |
| `And the response should contain field {string}` | `{string}`: e.g. `"token"`, `"user"`, `"id"` | Verifies that a root attribute exists in the JSON response. |

---

## 🔑 2. API Authentication & User Management (`@auth`)

**File:** `tests/step-definitions/api/auth.steps.ts`

| Gherkin Step (Exact Syntax) | Parameters | Description / Action |
|---|---|---|
| `Given the user is authenticated as an admin in the API` | *None* | Logs in with `admin@sandbox.com` and stores the JWT in `this.context.token`. |
| `When the user logs in via API with valid admin credentials` | *None* | Sends `POST /api/auth/login` with default admin credentials. |
| `When the user logs in via API with email {string} and password {string}` | `{string}`, `{string}` | Dispatches login with specified credentials (positive or negative). |
| `When the user registers via API with name {string}, email {string} and password {string}` | `{string}`, `{string}`, `{string}` | Calls `POST /api/auth/register` with specified data. |
| `Given/When the user registers via API with random valid data` | *None* | Generates a unique user via Faker and registers it. Saves to `storedData`. |
| `When the user attempts to register with the same email address` | *None* | Retries registration with the previous email to trigger `409 Conflict`. |

---

## 📚 3. API Books Catalog CRUD (`@books`)

**File:** `tests/step-definitions/api/books.steps.ts`

| Gherkin Step (Exact Syntax) | Parameters | Description / Action |
|---|---|---|
| `When the user requests all books from the API` | *None* | Sends `GET /api/books` with authentication header. |
| `When the user searches books in the API with term {string}` | `{string}` | Sends `GET /api/books?search=<term>`. |
| `Given/When the user creates a new book via API with the following data:` | `DataTable`: columns `title`, `author`, `isbn`, `price`, `category` | Creates a book from Gherkin table and tracks ID for auto-teardown. |
| `Given/When the user creates a book via API with random valid data` | *None* | Creates a book using Faker and tracks ID for auto-teardown. |
| `When the user attempts to create a book with isbn "{isbn}" and price {price}` | `{string}` (ISBN), `{float}` (positive/negative price) | Tests negative contract validation (invalid ISBN or price <= 0). |
| `When the user attempts to create a book without authentication token` | *None* | Sends `POST /api/books` omitting the `Authorization` header. |
| `When the user retrieves the book by its newly created id` | *None* | Sends `GET /api/books/:id` using the last created entity ID. |
| `When the user retrieves a book with non-existent id {string}` | `{string}` | Sends `GET /api/books/<id>` expecting 404. |
| `When the user updates the price of the newly created book to {float}` | `{float}`: e.g. `89.99` | Sends `PUT /api/books/:id` updating price. |
| `When the user deletes the newly created book` | *None* | Sends `DELETE /api/books/:id` for the latest created book. |
| `When the user attempts to delete the same already deleted book` | *None* | Re-sends `DELETE` expecting `404 Not Found`. |
| `Then the books list should contain at least {int} book(s)` | `{int}`: e.g. `5`, `1` | Verifies minimum number of items in the list response. |
| `And the created book should have the title {string}` | `{string}` | Validates the returned `title` field. |
| `And the created book should match the submitted payload` | *None* | Compares returned fields against the submitted DataTable. |
| `And the retrieved book price should be {float}` | `{float}` | Validates the numeric `price` field. |

---

## 🧩 4. Atomic API Engine (Zero-Code Testing for ANY Resource)

**File:** `tests/step-definitions/api/atomic-api.steps.ts`

These steps are completely decoupled from any specific business entity. If tomorrow the app manages `/api/cars` or `/api/orders`:

| Gherkin Step (Exact Syntax) | Parameters / Examples | Description / Action |
|---|---|---|
| `When the user sends a {string} request to {string}` | `"GET"`, `"DELETE"`, `"/resource/{{alias}}"` | Sends any HTTP method to any endpoint. Supports dynamic templates. |
| `When the user sends a {string} request to {string} with JSON payload:` | Method, Endpoint + DocString multiline JSON | Sends arbitrary JSON body (supports `{{random_email}}`, etc.). |
| `When the user sends a {string} request to {string} with fields:` | Method, Endpoint + DataTable key-value | Sends typed JSON body (auto-detects numbers, booleans, and strings). |
| `When the user sends a {string} request to {string} with query parameters:` | Method, Endpoint + DataTable query params | Appends query string parameters (e.g. `page=1`). |
| `When the user sets HTTP header {string} to {string}` | Header name, value | Injects custom HTTP headers for downstream requests. |
| `When the user saves the response field {string} as {string}` | JSON dot-notation path, alias name | Captures any response property (e.g. `"id"`, `"data[0].token"`) into context. |
| `Then the response field {string} should equal {string}` | JSON path, expected string value | Compares string value (supports `{{alias}}` substitution). |
| `Then the response field {string} should equal the number {float}` | JSON path, expected number | Compares numeric value. |
| `Then the response field {string} should contain {string}` | JSON path, expected substring | Asserts substring presence in text or array. |
| `Then the response field {string} should not be null or empty` | JSON path | Asserts non-null presence and non-empty string. |
| `Then the response field {string} should not exist` | JSON path | Asserts that property does not exist in response JSON. |
| `Then the response status code should be {int}` | Status code integer | Generic alias to assert HTTP response status. |
| `Then the response header {string} should contain {string}` | Header name, expected text | Asserts substring presence in HTTP response headers. |
| `When the user sets the Bearer authorization token to {string}` | Token / `{{token}}` | Directly sets Bearer token for downstream requests. |
| `When the user removes the authorization token` | *None* | Clears Authorization header to test unauthenticated access. |
| `Then the response should contain an array with at least {int} item(s)` | Min items count | Validates array length in response body. |

---

## 🖥️ 5. Common & Resilient UI Steps (Playwright)

**File:** `tests/step-definitions/ui/common-ui.steps.ts`

| Gherkin Step (Exact Syntax) | Parameters | Action |
|---|---|---|
| `Given the user navigates to {string}` | `"/login"`, `"/register"` | Navigates to relative URL with DOM auto-wait. |
| `Then the current URL should contain {string}` | `"/books"` | Waits for URL to match regex with auto-retry. |
| `When the user clicks the {string} button` | Button text, role, or testid | Resolves via `getByRole('button')` or testid with auto-waiting. |
| `Then the {string} button should be visible` | Button text or testid | Asserts visibility with auto-retry. |
| `Then the {string} button should be enabled` | Button text or testid | Asserts button is not disabled. |
| `When the user enters {string} into the {string} field` | Value, Field label / placeholder / name | Resolves via `getByLabel`, `getByPlaceholder`, or `name` and fills value. |
| `Then the text {string} should be visible on screen` | Expected text | Asserts text presence on the active page. |
| `Then the text {string} should not be visible on screen` | Unexpected text | Asserts text is absent. |
| `When the user waits for {int} second(s)` | Seconds count | Explicit wait for special timing cases. |

---

## 🏛️ 6. Page-Agnostic & Element-Identifier-Driven UI Steps

**File:** `tests/step-definitions/ui/atomic-ui.steps.ts`

These steps eliminate the need to reimplement Page Objects when new pages or modals are introduced. You simply supply the page/modal name and the element identifier:

| Gherkin Step (Exact Syntax) | Parameters / Examples | Action |
|---|---|---|
| `Given the user opens the {string} page with preloaded API session` | `"Books"`, `"Dashboard"`, `"/orders"` | Obtains JWT via fast API call, injects into `localStorage`, and navigates. |
| `When on the {string} page, the user enters {string} into the {string} field` | Page name, Value, Element identifier | Identifies element by `data-testid`, label, placeholder, name, or id on that page. |
| `When on the {string} page, the user clicks the {string} button` | Page name, Button identifier | Finds and clicks button on specified page. |
| `Then on the {string} page, the {string} button should be disabled` | Page name, Button identifier | Asserts button is in disabled state. |
| `Then on the {string} page, the {string} button should be enabled` | Page name, Button identifier | Asserts button is in enabled state. |
| `Then the modal should be visible` | *None* | Verifies that an active modal or dialog (`.modal`, `[role="dialog"]`) is open. |
| `Then the modal should not be visible` | *None* | Verifies that modal is closed/hidden. |
| `When in the active modal, the user enters {string} into the {string} field` | Value, Field identifier | Scopes input resolution strictly within the active modal dialog. |
| `When in the {string} modal, the user enters {string} into the {string} field` | Modal title, Value, Field identifier | Scopes input resolution to a specifically titled modal. |
| `When in the active modal, the user clicks the {string} button` | Button text / identifier | Clicks button strictly inside the active modal dialog (`"Save"`, `"Confirm"`). |
| `When in the {string} modal, the user clicks the {string} button` | Modal title, Button identifier | Clicks button in a specifically titled modal dialog. |
| `Then in the active modal, the text {string} should be visible` | Expected text in modal | Scopes text assertion strictly within the open modal. |
| `When in the table, the user finds the row containing {string} and clicks the {string} button` | Row text, Button identifier | Finds the matching table row and clicks the row action button (`"Delete"`, `"Edit"`). |
| `Then in the table, the row containing {string} should be visible` | Row text | Asserts that a row with the given text exists in the table. |
| `Then in the table, the row containing {string} should not be visible` | Row text | Asserts row absence in the table. |
| `Then an alert message should be displayed on screen` | *None* | Universal assertion for any toast, error, or alert notification. |
| `Then an error alert message should be displayed on screen` | *None* | Asserts error message presence across any page or view. |
| `Then an alert message containing {string} should be visible` | Substring text | Asserts text within any alert/notification container. |
| `When the user clears the {string} field` | Field identifier | Clears text from input field. |
| `When the user selects option {string} in the {string} dropdown` | Option label, Select identifier | Selects option in dropdown element. |
| `Then the {string} field should have value {string}` | Field identifier, Expected value | Asserts input element value. |
| `When the user checks the {string} checkbox` | Checkbox identifier | Checks an accessible checkbox or switch. |
| `When the user unchecks the {string} checkbox` | Checkbox identifier | Unchecks an accessible checkbox or switch. |

---

## ⚡ 7. Hybrid E2E Steps (Fast API Seed + UI Assertion)

**File:** `tests/step-definitions/ui/books-ui.steps.ts`

| Gherkin Step (Exact Syntax) | Parameters | Action |
|---|---|---|
| `Given a book has been previously created via API with title {string} and price {float}` | Title, Price | Instant REST API creation (`POST /api/books`) before opening the browser. |

---

## 🎭 8. Dynamic Template Variables (`template-resolver.ts`)

You can use these dynamic tokens inside any Gherkin string, endpoint, or JSON payload:
- `{{random_email}}`: Unique lowercase email address.
- `{{random_name}}`: Random full name.
- `{{random_title}}`: Dynamic product/book title with unique alphanumeric suffix.
- `{{random_uuid}}`: Unique UUID v4 string.
- `{{random_isbn}}`: Valid ISBN-13 format string.
- `{{random_price}}`: Numeric price between 10.00 and 150.00.
- `{{token}}`: Current JWT authentication token in scenario context.
- `{{lastId}}`: Most recently created resource ID.
- `{{<any_alias>}}`: Any value captured via `the user saves the response field "<path>" as "<alias>"`.

---

## 🏷️ 9. Mandatory ISTQB Tagging Taxonomy

Every scenario must include formal ISTQB tags:

| Dimension | ISTQB Tags | Purpose |
|---|---|---|
| **Test Level** | `@integration-test`, `@system-test`, `@system-integration-test` | Defines the testing scope in the architecture. |
| **Test Type** | `@functional`, `@security`, `@contract`, `@usability`, `@reliability` | Defines the quality characteristic being validated. |
| **Design Technique** | `@boundary-value-analysis`, `@equivalence-partitioning`, `@state-transition`, `@error-guessing` | Standard black-box test design techniques applied. |
| **Approach & Polarity** | `@positive-testing`, `@negative-testing` | Happy-path vs. robustness/error paths. |
| **Execution Scope** | `@smoke`, `@regression`, `@p1` | Pipeline triggering and test selection. |
| **Paradigm** | `@atomic`, `@generic`, `@hybrid` | Signifies puzzle-piece, page-agnostic automation. |

---

## 🛠️ Step Extension Guidelines for Agent 3

If a new user story genuinely requires a new step not listed here:
1. **Target File:**
   - Generic API step ➔ `tests/step-definitions/api/atomic-api.steps.ts`
   - Generic UI step ➔ `tests/step-definitions/ui/atomic-ui.steps.ts`
2. **Template Structure:**
   ```typescript
   When('the user performs generic action with {string} and {int}', async function (this: CustomWorld, text: string, num: number) {
     const resolvedText = resolveTemplate(text, this);
     // Use this.elementResolver, this.apiClient, or this.page
   });
   ```
3. **Mandatory Quality Gate:**
   Run `npm run format && npm run lint && npx tsc --noEmit && npx cucumber-js --dry-run` to ensure 0 errors and 0 orphan steps before pushing.

