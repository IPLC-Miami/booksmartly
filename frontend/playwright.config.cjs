// playwright.config.cjs
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    headless: true,
    baseURL: 'http://localhost:4173/booksmartly',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
};