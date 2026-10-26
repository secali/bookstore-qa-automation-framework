import { Before, After, Status } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { CustomWorld } from './world';
import { ENV } from '../../config/env.config';
import * as fs from 'fs';
import * as path from 'path';

Before(async function (this: CustomWorld, scenario) {
  // 1. Inicialización de API Context para TODOS los escenarios
  await this.initApiContext();

  // 2. Si el escenario incluye el tag @ui, levantamos Playwright Browser
  const isUiScenario = scenario.pickle.tags.some((tag) => tag.name === '@ui');
  if (isUiScenario) {
    const browser = await chromium.launch({
      headless: ENV.HEADLESS
    });
    this.browserContext = await browser.newContext({
      baseURL: ENV.UI_BASE_URL,
      viewport: { width: 1280, height: 720 }
    });
    const page = await this.browserContext.newPage();
    this.initPageObjects(page);
  }
});

After(async function (this: CustomWorld, scenario) {
  // 1. Captura de pantalla si falló un escenario UI
  if (scenario.result?.status === Status.FAILED && this.page) {
    const reportsDir = path.resolve(process.cwd(), 'reports', 'screenshots');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const sanitizedName = scenario.pickle.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const screenshotPath = path.join(reportsDir, `${sanitizedName}_failed.png`);

    try {
      const screenshot = await this.page.screenshot({
        fullPage: true,
        path: screenshotPath
      });
      this.attach(screenshot, 'image/png');
    } catch (err) {
      console.warn('No se pudo capturar pantallazo en el hook After:', err);
    }
  }

  // 2. Cierre de páginas y contexto de navegación
  if (this.page) {
    await this.page.close().catch(() => {});
  }
  if (this.browserContext) {
    await this.browserContext.close().catch(() => {});
  }

  // 3. Auto-Teardown de datos creados en el escenario (Garantiza aislamiento)
  if (this.context.createdBookIds.length > 0) {
    // Si no tenemos token en el contexto, usamos el admin seed para el teardown
    if (!this.context.token) {
      const login = await this.apiClient.auth.login(ENV.DEFAULT_ADMIN.email, ENV.DEFAULT_ADMIN.password);
      if (login.body.token) {
        this.context.token = login.body.token;
      }
    }

    for (const bookId of this.context.createdBookIds) {
      try {
        await this.apiClient.books.deleteBook(bookId);
      } catch (err) {
        console.warn(`[Teardown] Error al limpiar libro temporal ${bookId}:`, err);
      }
    }
  }

  // 4. Cierre del contexto HTTP de Playwright
  if (this.apiContext) {
    await this.apiContext.dispose().catch(() => {});
  }
});
