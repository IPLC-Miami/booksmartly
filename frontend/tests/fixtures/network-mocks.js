import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock all external API endpoints to prevent real calls during tests
    const externalHosts = /maps\.googleapis\.com|verify\.twilio\.com|api\.twilio\.com|connect\.squareup\.com|squarecdn\.com/;
    
    await page.route(externalHosts, (route) => {
      console.log(`[MOCK] Blocking and providing dummy response for: ${route.request().url()}`);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, mocked: true }),
      });
    });
    
    await use(page);
  },
});

export { expect } from '@playwright/test';