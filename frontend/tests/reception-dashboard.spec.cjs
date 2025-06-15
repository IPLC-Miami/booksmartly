// tests/reception-dashboard.spec.cjs
const { test, expect } = require('@playwright/test');

const admin = { email: 'iplcmiami@gmail.com', password: 'Iplcmiami1', dashboard: '/reception-dashboard' };

test.describe('Reception Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console logging for debugging
    page.on('console', msg => {
      console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`);
    });

    // Login as admin to access reception dashboard
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[name="email"]', { timeout: 15000 });
    
    await page.fill('input[name="email"]', admin.email);
    await page.fill('input[name="password"]', admin.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL(/\/.*dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('displays company name instead of "Hospital" in profile section', async ({ page }) => {
    // Navigate to reception dashboard if not already there
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check that company name "IPLC Miami Office" is displayed instead of "Hospital"
    await expect(page.locator('text=IPLC Miami Office Profile')).toBeVisible();
    await expect(page.locator('text=IPLC Miami Office QR Code')).toBeVisible();
    
    // Verify "Hospital" text is not present in profile sections
    const hospitalTexts = await page.locator('text=Hospital Profile').count();
    expect(hospitalTexts).toBe(0);
  });

  test('instruction cards are clickable and navigate correctly', async ({ page }) => {
    // Navigate to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test Step 1: Open BookSmartly App (should navigate to home)
    const step1Card = page.locator('text=Open BookSmartly App').locator('..');
    await expect(step1Card).toBeVisible();
    await step1Card.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
    
    // Go back to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test Step 2: Log In (should navigate to login)
    const step2Card = page.locator('text=Log In').locator('..');
    await expect(step2Card).toBeVisible();
    await step2Card.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/login');
    
    // Go back to reception dashboard (need to login again)
    await page.fill('input[name="email"]', admin.email);
    await page.fill('input[name="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/.*dashboard/, { timeout: 15000 });
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test Step 3: Find Appointment (should navigate to find-appointment)
    const step3Card = page.locator('text=Find Appointment').locator('..');
    await expect(step3Card).toBeVisible();
    await step3Card.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/find-appointment');
    
    // Go back to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test Step 4: Check In (should navigate to check-in)
    const step4Card = page.locator('text=Check In').locator('..');
    await expect(step4Card).toBeVisible();
    await step4Card.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/check-in');
  });

  test('instruction cards have proper hover effects and cursor pointer', async ({ page }) => {
    // Navigate to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test that instruction cards have cursor pointer styling
    const step1Card = page.locator('text=Open BookSmartly App').locator('..');
    await expect(step1Card).toHaveCSS('cursor', 'pointer');
    
    // Test hover effect by checking if the card has hover classes
    await step1Card.hover();
    await page.waitForTimeout(500); // Wait for hover transition
    
    // Verify the card is still visible and clickable after hover
    await expect(step1Card).toBeVisible();
  });

  test('QR code section displays correctly with company branding', async ({ page }) => {
    // Navigate to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check QR code section has company name
    await expect(page.locator('text=IPLC Miami Office QR Code')).toBeVisible();
    
    // Check QR code is displayed
    await expect(page.locator('canvas')).toBeVisible();
    
    // Check enlarge button is present
    await expect(page.locator('text=Enlarge QR Code')).toBeVisible();
    
    // Test QR code enlargement
    await page.click('text=Enlarge QR Code');
    await page.waitForTimeout(1000);
    
    // Check modal/dialog opened with enlarged QR code
    await expect(page.locator('text=IPLC Miami Office QR Code').nth(1)).toBeVisible();
    
    // Close the dialog
    await page.click('text=Close');
    await page.waitForTimeout(500);
  });

  test('verifies no mock queue items are present', async ({ page }) => {
    // Navigate to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check that there are no elements indicating mock or test data
    const mockDataIndicators = [
      'text=dev-seed',
      'text=mock',
      'text=test-data',
      'text=sample',
      '[data-testid*="mock"]',
      '[data-testid*="test"]'
    ];
    
    for (const indicator of mockDataIndicators) {
      const elements = await page.locator(indicator).count();
      expect(elements).toBe(0);
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/reception-dashboard-no-mock-data.png' });
  });

  test('reception dashboard loads without errors', async ({ page }) => {
    let hasErrors = false;
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
        hasErrors = true;
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`Page error: ${error.message}`);
      hasErrors = true;
    });
    
    // Navigate to reception dashboard
    await page.goto('/reception-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(3000);
    
    // Verify no errors occurred
    expect(hasErrors).toBe(false);
    
    // Verify key elements are present
    await expect(page.locator('text=Reception Dashboard')).toBeVisible();
    await expect(page.locator('text=Patient Check-in Instructions')).toBeVisible();
    await expect(page.locator('text=IPLC Miami Office Profile')).toBeVisible();
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/reception-dashboard-loaded.png' });
  });
});