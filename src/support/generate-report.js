const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const jsonFile = path.resolve(__dirname, '../../reports/cucumber-report.json');
const outputHtml = path.resolve(__dirname, '../../reports/cucumber-html-report.html');

if (fs.existsSync(jsonFile)) {
  const options = {
    theme: 'bootstrap',
    jsonFile: jsonFile,
    output: outputHtml,
    reportSuiteAsScenarios: true,
    scenarioTimestamp: true,
    launchReport: false,
    metadata: {
      "App Version": "1.0.0",
      "Test Environment": "QA Sandbox Local Docker",
      "Browser": "Chromium (Playwright)",
      "Platform": process.platform,
      "Parallel Execution": "Active",
      "Executed by": "Sergio Cañete Linares (SDET)"
    }
  };

  try {
    reporter.generate(options);
    console.log(`✅ Reporte Cucumber HTML generado exitosamente en: ${outputHtml}`);
  } catch (err) {
    console.error('Error generando reporte HTML:', err);
  }
} else {
  console.log(`ℹ️ Archivo de resultados ${jsonFile} no encontrado. Ejecuta las pruebas primero.`);
}
