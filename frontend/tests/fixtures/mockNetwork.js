// Mock network responses for Playwright tests
export const mockNetworkResponses = {
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
  
  // GraphQL endpoint
  '/graphql': {
    status: 200,
    body: { data: {} }
  }
};

// Helper function to setup network mocking in tests
export async function setupNetworkMocks(page) {
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
}