# 📦 Plantilla: Configuración Base de Playwright + Cucumber en TypeScript

Archivos de configuración inicial para levantar el framework desde cero siguiendo los estándares de **Sergio Cañete Linares**.

---

## 1. `package.json`

```json
{
  "name": "bookstore-qa-automation",
  "version": "1.0.0",
  "description": "Test Automation Framework for BookStore QA Sandbox (API-First & UI E2E)",
  "author": "Sergio Cañete Linares <sergio13896@gmail.com>",
  "license": "MIT",
  "scripts": {
    "test": "cucumber-js",
    "test:parallel": "cucumber-js --parallel 4",
    "test:api": "cucumber-js --tags \"@api\"",
    "test:ui": "cucumber-js --tags \"@ui\"",
    "test:smoke": "cucumber-js --tags \"@smoke\"",
    "test:regression": "cucumber-js --tags \"@regression\"",
    "test:contracts": "cucumber-js --tags \"@contracts\"",
    "report": "node src/support/generate-report.js",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier --write \"**/*.ts\""
  },
  "dependencies": {
    "@cucumber/cucumber": "^10.3.1",
    "@faker-js/faker": "^8.4.1",
    "@playwright/test": "^1.42.1",
    "dotenv": "^16.4.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "cucumber-html-reporter": "^5.5.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

---

## 2. `cucumber.js`

```javascript
module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'src/support/**/*.ts',
      'tests/step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'summary',
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 2,
    retry: 0,
    publishQuiet: true
  }
};
```

---

## 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@api/*": ["src/api/*"],
      "@ui/*": ["src/ui/*"],
      "@support/*": ["src/support/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

---

## 4. `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  reporter: [['html', { outputFolder: 'reports/playwright-html' }]],
  use: {
    baseURL: process.env.UI_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
```
