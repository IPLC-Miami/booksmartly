const { test, expect } = require('@playwright/test');

const realtimeTest = process.env.GOOGLE_PUB_SUB_PROJECT_ID ? test : test.skip;

realtimeTest.describe('Real-time functionality', () => {
  realtimeTest('should receive real-time updates via Pub/Sub', async ({ page }) => {
    // This test will only run if GOOGLE_PUB_SUB_PROJECT_ID is set
    await page.goto('/');
    // ... test implementation
  });
});