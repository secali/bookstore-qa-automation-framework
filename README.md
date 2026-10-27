<div align="center">

# 📚 BookStore QA Automation

### **API-first. Contract-driven. Built for reliable releases.**

A practical, API-led test automation framework for the BookStore QA Sandbox, built with **TypeScript**, **Playwright**, **Cucumber BDD**, **Zod**, and **Docker**.

<br>

[![CI](https://github.com/secali/bookstore-qa-automation-framework/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/secali/bookstore-qa-automation-framework/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-API%20%2B%20UI-2EAD33?logo=playwright&logoColor=white)
![Cucumber](https://img.shields.io/badge/BDD-Cucumber-23D96C?logo=cucumber&logoColor=white)
![Zod](https://img.shields.io/badge/Contracts-Zod-3E67B1)
![Docker](https://img.shields.io/badge/Environment-Docker-2496ED?logo=docker&logoColor=white)

<br>

**[Quick start](#-quick-start)** · **[Test commands](#-run-the-tests)** · **[CI/CD](#-ci-cd)** · **[Architecture](#-architecture)** · **[Documentation](#-documentation)**

</div>

---

## ✨ The project at a glance

| 🔌 API-first coverage | 🖥️ UI where it matters | 🧪 BDD and contracts | 🔒 Confidential Docker |
|:---:|:---:|:---:|:---:|
| Target: **70% API** | Target: **30% UI** | Gherkin + **Zod** | Images stay out of public Git and registries |
| Current feature set: **13 API** scenarios | **6 UI / hybrid** scenarios | **19 BDD** scenarios in total | Loaded locally with <code>docker load</code> |

The current feature distribution is approximately **68% API / 32% UI**, close to the 70/30 design target. The API suite covers authentication, book CRUD, search, validation, response contracts, and error handling. The UI suite focuses on authentication, catalog management, and API-to-UI flows.

## 🧭 What makes this framework useful

- **Fast feedback at the service layer:** typed API clients use Playwright’s <code>APIRequestContext</code>.
- **Contract checks at runtime:** Zod schemas validate book, authentication, and standard error responses.
- **Readable behavior:** Cucumber features express business flows in Gherkin; steps remain reusable and independent of raw selectors.
- **Focused UI coverage:** Playwright page objects and components use accessible locators where available.
- **Hybrid setup:** create state through the API, then verify the outcome in the browser.
- **Scenario-local context:** Cucumber’s custom World holds each scenario’s API, browser, token, and temporary book IDs.
- **Failure evidence:** failed UI scenarios capture screenshots for the Cucumber report.

## 🏗️ Architecture

<pre>
tests/
├── features/
│   ├── api/                  Authentication, books, search, contracts and errors
│   └── ui/                   Login, catalog and hybrid API-to-UI flows
├── step-definitions/
│   ├── api/                  Reusable API steps
│   └── ui/                   Reusable browser steps
└── unit/                     Tests for JSONPath, templates and DataTables

src/
├── api/
│   ├── clients/              Auth, books and generic HTTP clients
│   ├── schemas/              Zod contracts and schema registry
│   └── types/                API DTOs and shared types
├── support/                  Custom World, hooks and test utilities
└── ui/
    ├── pages/                Login, registration and books pages
    └── components/           Book and delete modals

.github/workflows/ci.yml      Quality gates, Docker BDD suite and summary
docs/                         Requirements, test plan and implementation notes
</pre>

### 🔁 A scenario’s journey

<div align="center">

**Gherkin feature** → **Reusable step** → **API client / Page Object** → **Zod assertion** → **Report**

</div>

## 🚀 Quick start

### Requirements

- **Node.js 18+** and npm
- **Docker Desktop** or Docker Engine with **Docker Compose v2**
- **Git**
- The supplied **BookStore Docker image archive** for local execution
- Chromium installed through Playwright

### 1. Install the framework

    npm ci
    npx playwright install chromium

On Linux runners, install the browser’s system packages with:

    npx playwright install --with-deps chromium

### 2. Load the local test environment

Obtain <code>bookstore-images.tar</code> through the authorized challenge package or another approved private delivery path. The archive is intentionally excluded from Git.

    docker load -i bookstore-images.tar
    docker compose up -d
    docker compose ps

Wait until MongoDB and the backend report healthy. The frontend starts after the backend health check succeeds.

| Service | Local URL |
|:--|:--|
| BookStore UI | [http://localhost:3000](http://localhost:3000) |
| REST API | [http://localhost:5000/api](http://localhost:5000/api) |
| Swagger UI | [http://localhost:5000/api/docs](http://localhost:5000/api/docs) |
| API health | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

The sandbox seeds an administrator account for local testing. Defaults are documented in <code>.env.example</code>; do not reuse sandbox credentials outside this environment.

### 3. Configure local settings (optional)

Copy <code>.env.example</code> to <code>.env</code> and adjust values only when your local environment needs them.

| Variable | Default | Purpose |
|:--|:--|:--|
| <code>API_BASE_URL</code> | <code>http://localhost:5000/api</code> | REST API base URL |
| <code>UI_BASE_URL</code> | <code>http://localhost:3000</code> | Frontend base URL |
| <code>HEADLESS</code> | <code>true</code> | Run Playwright without a visible browser |
| <code>SEED_ADMIN_EMAIL</code> | <code>admin@sandbox.com</code> | Seed administrator email |
| <code>SEED_ADMIN_PASSWORD</code> | <code>admin123</code> | Seed administrator password |
| <code>DEFAULT_TIMEOUT</code> | <code>15000</code> | Default Cucumber step timeout in milliseconds |

### 4. Run the suite

    npm test

When you finish, stop the containers. The <code>-v</code> option also removes the sandbox database volume and resets its data.

    docker compose down -v

## 🧪 Run the tests

| Command | What it runs |
|:--|:--|
| <code>npm test</code> | Complete Cucumber BDD suite |
| <code>npm run test:parallel</code> | Complete suite with 4 Cucumber workers |
| <code>npm run test:api</code> | Features tagged <code>@api</code> |
| <code>npm run test:ui</code> | Features tagged <code>@ui</code> |
| <code>npm run test:smoke</code> | Features tagged <code>@smoke</code> |
| <code>npm run test:regression</code> | Features tagged <code>@regression</code> |
| <code>npm run test:contracts</code> | Features tagged <code>@contracts</code> |
| <code>npm run test:hybrid</code> | Features tagged <code>@hybrid</code> |
| <code>npm run test:unit</code> | Unit checks for JSONPath, template resolution and DataTable parsing |
| <code>npm run lint</code> | ESLint over TypeScript source and steps |
| <code>npx tsc --noEmit</code> | TypeScript type check |
| <code>npm run report</code> | Build the consolidated HTML report from Cucumber JSON |

The API and UI suites need the sandbox running. Unit tests and linting do not.

## 📊 Coverage map

| Area | Scenarios | Representative checks |
|:--|--:|:--|
| Authentication | API + UI | Successful login, invalid credentials, registration |
| Book catalog | API + UI | List, create, retrieve, update, delete |
| Search | API | Search results and catalog filtering |
| Contracts and validation | API | Zod response contracts, invalid payloads, error envelope |
| Hybrid flows | API → UI | Create through REST, verify in the browser |
| Framework utilities | Unit | JSONPath, dynamic templates and DataTable parsing |

Tests use dynamic values for generated data where supported. Book records created through the API client are tracked for cleanup in the Cucumber <code>After</code> hook; the UI create-and-delete scenario removes its record in the scenario. Seed records are used for read-only checks and are not modified.

## ⚙️ CI/CD

The GitHub Actions workflow is organized into three dependent jobs:

<pre>
quality-gates ──► e2e-bdd-suite ──► compliance-summary
</pre>

1. **Quality gates:** installs Node.js 22, runs ESLint and TypeScript checks, then executes unit tests.
2. **Docker BDD suite:** provisions the sandbox images, starts Docker Compose, polls <code>/api/health</code>, runs the Cucumber suite, uploads reports, and tears down the containers.
3. **Compliance summary:** writes a job summary after the previous jobs finish.

The workflow runs for pushes and pull requests targeting <code>main</code> or <code>master</code>, and can also be started manually. Report artifacts are retained for 14 days.

### 🔐 Handling the Docker images

<code>bookstore-images.tar</code> and archive files are ignored by Git. **Do not commit or publish the supplied package or images to a public repository or registry.**

- **Local:** load the authorized archive with <code>docker load -i bookstore-images.tar</code>.
- **GitHub-hosted runner:** configure the <code>DOCKER_IMAGES_SECURE_URL</code> Actions secret with an approved, access-controlled download endpoint.
- **Self-hosted runner:** preload the images into its local Docker daemon.
- **Images unavailable:** the workflow emits a warning and skips the Docker-dependent BDD steps. A green workflow status alone therefore does not prove that the E2E scenarios ran; confirm the job log and uploaded report.

The current workflow also contains a Google Drive fallback for a failed private-URL download. Before relying on that path for a public repository, verify that its access controls comply with the challenge’s confidentiality requirement. The preferred options are a private authenticated endpoint or an internally managed self-hosted runner.

### ⚡ Parallel execution

The framework offers <code>npm run test:parallel</code> for four-worker Cucumber execution. The current GitHub Actions workflow invokes <code>npm test</code>, and the default Cucumber configuration uses one worker; CI execution is therefore serial today.

## 🗂️ Reports and evidence

- Cucumber writes HTML and JSON output under <code>reports/</code>.
- <code>npm run report</code> creates the consolidated HTML report from the JSON output.
- Failed UI scenarios attach a screenshot to the report and save an image under <code>reports/screenshots/</code>.
- GitHub Actions uploads the reports directory as a workflow artifact when the Docker suite runs.

## 📚 Documentation

| Document | Contents |
|:--|:--|
| [Candidate instructions](docs/CANDIDATE_INSTRUCTIONS.md) | Original challenge requirements |
| [Requirements analysis](docs/requirements.md) | Application models, endpoints and expected behavior |
| [Test plan](docs/test-plan.md) | Coverage strategy, levels and traceability |
| [Steps dictionary](docs/STEPS_DICTIONARY.md) | Reusable Gherkin step catalog |
| [Implementation log](docs/BITACORA_PASO_A_PASO.md) | Project decisions and development history |
| [Project instructions](AGENTS.md) | Engineering and confidentiality requirements |
| [Pull request checklist](.github/pull_request_template.md) | Review and quality checklist |
| [CI workflow](.github/workflows/ci.yml) | GitHub Actions jobs and Docker orchestration |

---

<div align="center">

### Built with care for API-first quality engineering

**Sergio Cañete Linares** · [GitHub](https://github.com/secali) · [LinkedIn](https://linkedin.com/in/secali)

<sub>TypeScript · Playwright · Cucumber · Zod · Docker</sub>

</div>

