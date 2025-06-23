// playwright.config.cjs
const path = require('path');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 45000,
  retries: 2,
  webServer: process.env.CI_SKIP_PLAYWRIGHT === 'true' ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    cwd: path.resolve(__dirname)
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      'x-test-auth': 'true',
      'X-Test-Environment': process.env.NODE_ENV || 'development',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    },
    env: {
      SQUARE_MODE: 'sandbox'
    }
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  // Environment-based configuration
  projects: [
    // Local development projects
    {
      name: 'local-chrome',
      use: {
        ...require('@playwright/test').devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: process.env.NODE_ENV === 'development' ? '**/*.spec.cjs' : undefined,
    },
    {
      name: 'local-firefox',
      use: {
        ...require('@playwright/test').devices['Desktop Firefox'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: process.env.NODE_ENV === 'development' ? '**/*.spec.cjs' : undefined,
    },
    // Production projects
    {
      name: 'production-chrome',
      use: {
        ...require('@playwright/test').devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: process.env.NODE_ENV === 'production' ? '**/*.spec.cjs' : undefined,
    },
    {
      name: 'production-firefox',
      use: {
        ...require('@playwright/test').devices['Desktop Firefox'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: process.env.NODE_ENV === 'production' ? '**/*.spec.cjs' : undefined,
    },
    {
      name: 'production-safari',
      use: {
        ...require('@playwright/test').devices['Desktop Safari'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: process.env.NODE_ENV === 'production' ? '**/*.spec.cjs' : undefined,
    },
  ],
};