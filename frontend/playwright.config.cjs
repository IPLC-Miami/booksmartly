// playwright.config.cjs
const path = require('path');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 45000,
  retries: 2,
  webServer: [
    {
      command: 'node index.js',
      url: 'http://localhost:4000/graphql',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, '..'),
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: __dirname,
    },
  ],
  use: {
    headless: true,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      'X-Test-Environment': process.env.NODE_ENV || 'development',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
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
        baseURL: 'http://localhost:3000',
      },
      testMatch: process.env.NODE_ENV === 'development' ? '**/*.spec.cjs' : undefined,
    },
    {
      name: 'local-firefox',
      use: {
        ...require('@playwright/test').devices['Desktop Firefox'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: process.env.NODE_ENV === 'development' ? '**/*.spec.cjs' : undefined,
    },
    // Production projects
    {
      name: 'production-chrome',
      use: {
        ...require('@playwright/test').devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: process.env.NODE_ENV === 'production' ? '**/*.spec.cjs' : undefined,
    },
    {
      name: 'production-firefox',
      use: {
        ...require('@playwright/test').devices['Desktop Firefox'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: process.env.NODE_ENV === 'production' ? '**/*.spec.cjs' : undefined,
    },
    {
      name: 'production-safari',
      use: {
        ...require('@playwright/test').devices['Desktop Safari'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: process.env.NODE_ENV === 'production' ? '**/*.spec.cjs' : undefined,
    },
  ],
};