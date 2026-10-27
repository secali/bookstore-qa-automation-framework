module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'src/support/**/*.ts',
      'tests/step-definitions/**/*.ts'
    ],
    requireModule: [
      'ts-node/register',
      'tsconfig-paths/register'
    ],
    format: [
      'summary',
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1,
    retry: 0
  }
};
