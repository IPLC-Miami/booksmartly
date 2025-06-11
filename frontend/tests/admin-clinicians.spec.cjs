// tests/admin-clinicians.spec.cjs
const { test, expect } = require('@playwright/test');

// Test data
const adminUser = { 
  email: 'iplcmiami@gmail.com', 
  password: 'Iplcmiami1' 
};

// Helper function to login as admin
async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  
  await page.fill('input[name="email"]', adminUser.email);
  await page.fill('input[name="password"]', adminUser.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to admin dashboard
  await expect(page).toHaveURL(/reception-dashboard/);
  await page.waitForLoadState('networkidle');
}

// Helper function to navigate to clinician management
async function navigateToClinicianManagement(page) {
  // Look for clinician management link/button in the admin dashboard
  await page.waitForSelector('text=Clinician, text=Doctor, text=Staff', { timeout: 10000 });
  await page.click('text=Clinician, text=Doctor, text=Staff').first();
  await page.waitForLoadState('networkidle');
}

test.describe('Admin Clinician Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('can access clinician management page', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Verify we're on the clinician management page
    await expect(page.locator('h1, h2, h3')).toContainText(['Clinician', 'Doctor', 'Staff']);
    
    // Check for key clinician management elements
    await expect(page.locator('text=Add Clinician, text=Add Doctor, button:has-text("Add"), button:has-text("Create")')).toBeVisible();
  });

  test('can view existing clinicians', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Wait for clinicians to load
    await page.waitForTimeout(2000);
    
    // Check if clinicians table/list is visible
    const cliniciansContainer = page.locator('table, .clinician-list, .clinician-grid, [data-testid="clinicians"]');
    await expect(cliniciansContainer).toBeVisible();
    
    // Verify clinician data is displayed
    const clinicianItems = page.locator('tr, .clinician-item, .clinician-card');
    const itemCount = await clinicianItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('can search and filter clinicians', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Wait for clinicians to load
    await page.waitForTimeout(2000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"], [data-testid="search"]').first();
    
    if (await searchInput.isVisible()) {
      // Test search functionality
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
      // Verify all clinicians are shown again
      const clinicianItems = page.locator('tr, .clinician-item, .clinician-card');
      const itemCount = await clinicianItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('can view clinician details', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Wait for clinicians to load
    await page.waitForTimeout(2000);
    
    // Look for view/details button on first clinician
    const viewButton = page.locator('button:has-text("View"), text=View, button:has-text("Details"), .view-button, [data-testid="view-clinician"]').first();
    
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(1000);
      
      // Verify clinician details are displayed
      await expect(page.locator('text=Name, text=Email, text=Phone, text=Specialization')).toBeVisible();
    } else {
      // Try clicking on clinician name/row
      const clinicianRow = page.locator('tr, .clinician-item, .clinician-card').first();
      await clinicianRow.click();
      await page.waitForTimeout(1000);
      
      // Verify details view opened
      await expect(page.locator('text=Details, text=Information, text=Profile')).toBeVisible();
    }
  });

  test('displays clinician schedules', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Wait for clinicians to load
    await page.waitForTimeout(2000);
    
    // Look for schedule button or link
    const scheduleButton = page.locator('button:has-text("Schedule"), text=Schedule, button:has-text("View Schedule"), [data-testid="clinician-schedule"]').first();
    
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await page.waitForTimeout(1000);
      
      // Verify schedule information is displayed
      await expect(page.locator('text=Schedule, text=Appointment, text=Time, text=Date')).toBeVisible();
    }
  });

  test('can navigate back to main dashboard', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Look for back/dashboard button
    const backButton = page.locator('button:has-text("Back"), text=Dashboard, button:has-text("Home"), .back-button, [data-testid="back-to-dashboard"]').first();
    
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(1000);
      
      // Verify we're back on the main dashboard
      await expect(page).toHaveURL(/reception-dashboard/);
    }
  });

  test('handles empty clinician list gracefully', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if empty state is handled properly
    const emptyState = page.locator('text=No clinicians, text=No doctors, text=No staff, .empty-state');
    
    // Either clinicians are displayed or empty state is shown
    const cliniciansContainer = page.locator('table, .clinician-list, .clinician-grid, [data-testid="clinicians"]');
    const hasContent = await cliniciansContainer.isVisible() || await emptyState.isVisible();
    
    expect(hasContent).toBe(true);
  });

  test('displays loading state while fetching clinicians', async ({ page }) => {
    await navigateToClinicianManagement(page);
    
    // Check for loading indicator (should appear briefly)
    const loadingIndicator = page.locator('text=Loading, .loading, .spinner, [data-testid="loading"]');
    
    // Wait for either loading to disappear or content to appear
    await Promise.race([
      page.waitForSelector('table, .clinician-list, .clinician-grid, [data-testid="clinicians"]', { timeout: 10000 }),
      page.waitForTimeout(5000)
    ]);
    
    // Verify page has loaded content
    const hasContent = await page.locator('table, .clinician-list, .clinician-grid, [data-testid="clinicians"], text=No clinicians, .empty-state').isVisible();
    expect(hasContent).toBe(true);
  });
});