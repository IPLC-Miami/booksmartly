// tests/auth.spec.js
const { test, expect } = require('@playwright/test');

const admin = { email: 'iplcmiami@gmail.com', password: 'Iplcmiami1', dashboard: '/reception-dashboard' };
const client = { email: 'pdarleyjr@gmail.com', password: 'Iplcmiami1', dashboard: '/client-dashboard' };
const clinician = { email: 'adarley23@gmail.com', password: 'Iplcmiami1', dashboard: '/clinician-dashboard' };

for (const user of [admin, client, clinician]) {
  test(`can sign in as ${user.email} and reach dashboard`, async ({ page }) => {
    await page.goto('/login');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the login form to be visible
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(new RegExp(user.dashboard));
    await expect(page.locator('body')).toContainText(['dashboard', 'Dashboard']);
  });
}

test('shows error for invalid login', async ({ page }) => {
  await page.goto('/login');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Wait for the login form to be visible
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  
  await page.fill('input[name="email"]', 'invalid@example.com');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await expect(page.locator('.error, [role="alert"]')).toBeVisible();
});