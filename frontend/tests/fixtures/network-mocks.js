// Network mocking utilities for Playwright tests
// Provides consistent API responses during testing

const mockResponses = {
  // GraphQL endpoint mock
  '/graphql': {
    data: {
      clients: [],
      appointments: [],
      employees: []
    }
  },
  
  // Square API mocks
  '/api/square/diagnostic': {
    status: 'ok',
    square_configured: true,
    environment: 'test',
    timestamp: '2025-06-23T12:00:00.000Z'
  },
  
  // Auth API mocks
  '/api/auth/send-otp': {
    success: true,
    message: 'OTP sent successfully'
  },
  
  '/api/auth/verify-otp': {
    success: true,
    token: 'mock-jwt-token'
  }
};

/**
 * Setup network mocking for a Playwright page
 * @param {import('@playwright/test').Page} page 
 */
async function setupNetworkMocks(page) {
  await page.route('**/graphql', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponses['/graphql'])
    });
  });

  await page.route('**/api/square/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    
    if (mockResponses[path]) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses[path])
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/auth/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    
    if (mockResponses[path]) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses[path])
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock a specific API endpoint with custom response
 * @param {import('@playwright/test').Page} page 
 * @param {string} endpoint 
 * @param {object} response 
 */
async function mockEndpoint(page, endpoint, response) {
  await page.route(`**${endpoint}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

module.exports = {
  setupNetworkMocks,
  mockEndpoint,
  mockResponses
};