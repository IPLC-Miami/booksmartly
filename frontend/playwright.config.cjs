// playwright.config.cjs
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 45000,
  retries: 2,
  use: {
    headless: true,
    baseURL: 'https://booksmartly.iplcmiami.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  // Production-focused configuration
  projects: [
    {
      name: 'production-chrome',
      use: {
        ...require('@playwright/test').devices['Desktop Chrome'],
        baseURL: 'https://booksmartly.iplcmiami.com',
      },
    },
    {
      name: 'production-firefox',
      use: {
        ...require('@playwright/test').devices['Desktop Firefox'],
        baseURL: 'https://booksmartly.iplcmiami.com',
      },
    },
    {
      name: 'production-safari',
      use: {
        ...require('@playwright/test').devices['Desktop Safari'],
        baseURL: 'https://booksmartly.iplcmiami.com',
      },
    },
  ],
};