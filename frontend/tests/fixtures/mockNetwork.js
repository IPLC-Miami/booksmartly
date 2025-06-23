// Mock network responses for Playwright tests
const mockNetworkResponses = {
  // Square payment endpoints
  '/api/square/env': {
    status: 200,
    body: { mode: 'sandbox' }
  },
  
  // Twilio SMS endpoints
  '/api/auth/send-otp': {
    status: 200,
    body: { success: true, message: 'OTP sent successfully' }
  },
  '/api/auth/verify-otp': {
    status: 200,
    body: { success: true, message: 'OTP verified successfully' }
  },
  
  // Authentication endpoints
  '/api/auth/login': {
    status: 401,
    body: { error: 'Invalid credentials' }
  },
  '/api/auth/register': {
    status: 200,
    body: { success: true, message: 'User registered successfully' }
  },
  '/api/auth/logout': {
    status: 200,
    body: { success: true, message: 'Logged out successfully' }
  },
  
  // GraphQL endpoint
  '/graphql': {
    status: 200,
    body: { data: {} }
  }
};

// Helper function to setup network mocking in tests
async function setupNetworkMocks(page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const pathname = new URL(url).pathname;
    
    const mockResponse = mockNetworkResponses[pathname];
    if (mockResponse) {
      await route.fulfill({
        status: mockResponse.status,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse.body)
      });
    } else {
      await route.continue();
    }
  });
  
  // Also mock GraphQL endpoint
  await page.route('**/graphql', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} })
    });
  });
}

module.exports = {
  setupNetworkMocks,
  mockNetworkResponses
};