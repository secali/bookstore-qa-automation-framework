# 🤖 End-to-End Multi-Agent QA Pipeline Orchestrator

> **Based on Sergio Cañete Linares' Architecture:** Autonomous multi-agent AI ecosystem covering the entire QA lifecycle through Spec-Driven Development (SDD), ISTQB-aligned test categorization, and a generic, page-agnostic automation engine.

---

## 🔄 Pipeline Workflow Overview

```mermaid
flowchart TD
    US[User Story / Acceptance Criteria] --> A1[Agent 1: Story & Codebase Analyst]
    A1 -->|Inspects Codebase, Models, Schemas, React DOM| R1[ANALYSIS_REPORT.md\n• Technical Mapping\n• ISTQB Levels & Types\n• Accessibility Identifiers]
    
    R1 --> A2[Agent 2: QA Test Strategist & BDD Architect]
    A2 -->|70% API / 30% UI Pyramid & N1-N4 Matrix| R2[TEST_PLAN & ENGLISH GHERKIN\n• ISTQB Tagging Taxonomy\n• Declarative Business Scenarios\n• Generic Puzzle Piece Phrasing]
    
    R2 --> A3[Agent 3: SDET Automation Implementer]
    DIC[STEPS_DICTIONARY.md\nEnglish BDD Steps Catalog] --> A3
    
    A3 -->|Reuses Atomic Generic Steps & ElementResolver| CODE[AUTOMATION REPOSITORY\n• GenericHttpClient\n• ElementResolver (Page-Agnostic)\n• Zod OpenAPI Contracts]
    
    CODE --> VAL[Automated 4-Step Quality Gate\n1. npm run format\n2. npm run lint\n3. npx tsc --noEmit\n4. npx cucumber-js --dry-run]
    VAL --> CI[Hermetic Docker CI/CD in GitHub Actions]
```

---

## 👥 The Three Pipeline Agents

| Agent | Specification File | Role & Primary Duty |
|---|---|---|
| **Agent 1: Story & Codebase Analyst** | [01-story-and-code-analyst.md](./agents/01-story-and-code-analyst.md) | **Shift-Left Technical Analysis:** Inspects user story and workspace code (routes, Mongoose models, React components, Swagger docs) to output `ANALYSIS_REPORT.md` with ISTQB test categorization. |
| **Agent 2: QA Test Strategist & BDD Architect** | [02-qa-test-planner.md](./agents/02-qa-test-planner.md) | **Test Strategy & English Gherkin:** Designs the 70% API / 30% UI pyramid across levels N1-N4. Authors declarative English `.feature` files tagged with formal ISTQB taxonomy (`@integration-test`, `@system-test`, `@system-integration-test`, `@contract`, `@security`, `@functional`, `@usability`, `@boundary-value-analysis`, `@equivalence-partitioning`, `@state-transition`, `@error-guessing`, `@positive-testing`, `@negative-testing`, `@smoke`, `@p1`). |
| **Agent 3: SDET Automation Implementer** | [03-sdet-implementer.md](./agents/03-sdet-implementer.md) | **Generic SDET Implementation:** Consumes [STEPS_DICTIONARY.md](../../STEPS_DICTIONARY.md). Executes tests via the page-agnostic `ElementResolver` and endpoint-agnostic `GenericHttpClient`. Executes the automated 4-step quality gate. |


---

## 🚀 How to Trigger the Pipeline in Antigravity

Invoke the agents sequentially in chat prompts:

```text
# Step 1: Technical Analysis
Act as Agent 1 (Story & Codebase Analyst) using .agents/pipeline/agents/01-story-and-code-analyst.md. Analyze this User Story: [Paste Story].

# Step 2: Test Strategy & Gherkin
Act as Agent 2 (QA Test Strategist) using .agents/pipeline/agents/02-qa-test-planner.md. Using Agent 1's analysis, generate the ISTQB test plan and English .feature files.

# Step 3: SDET Implementation
Act as Agent 3 (SDET Implementer) using .agents/pipeline/agents/03-sdet-implementer.md. Follow STEPS_DICTIONARY.md, reuse generic steps, and validate with tsc and cucumber-js --dry-run.
```
