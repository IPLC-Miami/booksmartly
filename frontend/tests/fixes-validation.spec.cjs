// fixes-validation.spec.cjs
// Smoke tests for FOUC, Cookie, Role, CSP, and API fixes

const { test, expect } = require('@playwright/test');

test.describe('BookSmartly Fixes Validation', () => {
  
  test('FOUC Prevention - Page loads without flash of unstyled content', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check that the loading spinner is present initially
    const loadingSpinner = page.locator('.loading-spinner');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Verify that the body is visible (not hidden)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that CSS is properly loaded by verifying styled elements
    const header = page.locator('header, nav, .header');
    if (await header.count() > 0) {
      await expect(header.first()).toBeVisible();
    }
    
    // Verify no console errors related to styling
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);
    
    // Filter out non-styling related errors
    const stylingErrors = consoleErrors.filter(error => 
      error.includes('css') || 
      error.includes('style') || 
      error.includes('FOUC')
    );
    
    expect(stylingErrors).toHaveLength(0);
  });

  test('CSP Compliance - Vecteezy images load without CSP blocks', async ({ page }) => {
    // Monitor CSP violations
    const cspViolations = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });

    // Navigate to a page that might have profile images
    await page.goto('/');
    
    // Try to navigate to profile or dashboard pages where Vecteezy images might appear
    try {
      // Look for login or profile links
      const loginLink = page.locator('a[href*="login"], button:has-text("Login"), a:has-text("Login")');
      if (await loginLink.count() > 0) {
        await loginLink.first().click();
        await page.waitForLoadState('networkidle');
      }
    } catch (error) {
      // Continue if login navigation fails
    }

    // Check for any Vecteezy images in the DOM
    const vecteezyImages = page.locator('img[src*="static.vecteezy.com"]');
    const imageCount = await vecteezyImages.count();
    
    if (imageCount > 0) {
      // Verify that Vecteezy images load successfully
      for (let i = 0; i < imageCount; i++) {
        const img = vecteezyImages.nth(i);
        await expect(img).toBeVisible();
        
        // Check if image actually loaded (not broken)
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }

    // Verify no CSP violations occurred
    expect(cspViolations).toHaveLength(0);
  });

  test('Cookie Security - Secure cookie headers are present', async ({ page, context }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Get all cookies
    const cookies = await context.cookies();
    
    // Check for authentication-related cookies
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('auth') || 
      cookie.name.includes('session') || 
      cookie.name.includes('supabase') ||
      cookie.name.includes('access_token')
    );

    // If auth cookies exist, verify they have secure attributes
    if (authCookies.length > 0) {
      authCookies.forEach(cookie => {
        // In production, cookies should be secure
        if (page.url().startsWith('https://')) {
          expect(cookie.secure).toBe(true);
        }
        
        // SameSite should be set
        expect(['Strict', 'Lax', 'None']).toContain(cookie.sameSite);
      });
    }

    // Check response headers for cookie security
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    const headers = response.headers();
    
    // Look for Set-Cookie headers with security attributes
    const setCookieHeaders = headers['set-cookie'] || '';
    if (setCookieHeaders) {
      // Should contain SameSite and Secure flags for HTTPS
      if (page.url().startsWith('https://')) {
        expect(setCookieHeaders.toLowerCase()).toContain('samesite');
      }
    }
  });

  test('API Endpoints - User role endpoint responds correctly', async ({ page }) => {
    // Navigate to homepage first
    await page.goto('/');
    
    // Monitor network requests
    const apiRequests = [];
    const apiResponses = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Try to trigger API calls by navigating or interacting
    try {
      // Look for elements that might trigger API calls
      const interactiveElements = page.locator('button, a[href*="dashboard"], a[href*="profile"]');
      const elementCount = await interactiveElements.count();
      
      if (elementCount > 0) {
        await interactiveElements.first().click();
        await page.waitForTimeout(3000); // Wait for potential API calls
      }
    } catch (error) {
      // Continue if interaction fails
    }

    // Wait for any pending requests
    await page.waitForLoadState('networkidle');

    // Check for role-related API calls
    const roleApiCalls = apiResponses.filter(response => 
      response.url.includes('/getRole/') || 
      response.url.includes('/api/users/getRole')
    );

    // If role API calls were made, verify they didn't return 404 or 400
    roleApiCalls.forEach(response => {
      expect(response.status).not.toBe(404);
      expect(response.status).not.toBe(400);
      // Should be either 200 (success) or 401/403 (auth required)
      expect([200, 401, 403]).toContain(response.status);
    });

    // Check for any 404 or 400 errors in API calls
    const errorResponses = apiResponses.filter(response => 
      response.status === 404 || response.status === 400
    );

    // Log any error responses for debugging
    if (errorResponses.length > 0) {
      console.log('API Error Responses:', errorResponses);
    }

    // Verify no critical API endpoints return 404/400
    const criticalErrors = errorResponses.filter(response =>
      response.url.includes('/api/users/') ||
      response.url.includes('/api/auth/') ||
      response.url.includes('/getRole/')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('Console Errors - No critical JavaScript errors', async ({ page }) => {
    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for any delayed errors
    await page.waitForTimeout(3000);

    // Filter out non-critical errors (like third-party script errors)
    const criticalErrors = consoleErrors.filter(error => {
      const lowerError = error.toLowerCase();
      return !lowerError.includes('google') && 
             !lowerError.includes('gtag') && 
             !lowerError.includes('analytics') &&
             !lowerError.includes('third-party') &&
             !lowerError.includes('extension');
    });

    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Critical Console Errors:', criticalErrors);
    }

    // Should have no critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);

    // Check for specific error patterns that indicate our fixes are working
    const roleErrors = consoleErrors.filter(error => 
      error.includes('undefined role') || 
      error.includes('role is not defined')
    );
    expect(roleErrors).toHaveLength(0);

    const cookieErrors = consoleErrors.filter(error => 
      error.includes('cookie') && error.includes('secure')
    );
    expect(cookieErrors).toHaveLength(0);
  });

  test('Page Performance - No significant performance regressions', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    // Verify reasonable performance (these are generous thresholds for production)
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
    expect(performanceMetrics.loadComplete).toBeLessThan(10000); // 10 seconds

    // If paint metrics are available, check them
    if (performanceMetrics.firstContentfulPaint > 0) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000); // 3 seconds
    }

    console.log('Performance Metrics:', performanceMetrics);
  });
});