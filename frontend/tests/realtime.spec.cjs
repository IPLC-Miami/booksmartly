const { test, expect } = require('@playwright/test');

const describe = process.env.GOOGLE_PUB_SUB_PROJECT_ID ? test.describe : test.describe.skip;

describe('Real-time functionality', () => {
  test('should receive real-time updates via Pub/Sub', async ({ page }) => {
    // This test will only run if GOOGLE_PUB_SUB_PROJECT_ID is set
    await page.goto('/');
    // ... test implementation
  });
});