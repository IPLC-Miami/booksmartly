# Test info

- Name: Admin Clinician Management >> can access clinician management page
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-clinicians.spec.cjs:38:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Clinician, text=Doctor, text=Staff') to be visible

    at navigateToClinicianManagement (c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-clinicians.spec.cjs:28:14)
    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-clinicians.spec.cjs:39:11
```

# Page snapshot

```yaml
- region "Notifications alt+T"
- region "Notifications Alt+T"
- img "BookSmartly Logo"
- button "Home"
- button "Login"
- main:
  - tablist:
    - tab "Profile" [selected]
    - tab "Queues"
    - tab "Schedule Management"
  - tabpanel "Profile":
    - img
    - heading "Reception Dashboard" [level=1]
    - img
    - text: Friday, June 13, 2025 at 10:40 PM
    - img
    - heading "Hospital Profile" [level=2]
    - img "Hospital Logo"
    - heading [level=3]
    - img
    - paragraph: Address
    - paragraph
    - img
    - paragraph: Email
    - paragraph
    - img
    - heading "Hospital QR Code" [level=2]
    - img
    - img
    - img
    - paragraph: Auto-refreshes every 10 minutes
    - button "Enlarge QR Code":
      - img
      - text: Enlarge QR Code
    - img
    - heading "Patient Check-in Instructions" [level=2]
    - img
    - heading "Open BookSmartly App" [level=3]
    - paragraph: Launch the BookSmartly web application
    - img
    - heading "Log In" [level=3]
    - paragraph: Enter your login credentials
    - img
    - heading "Find Appointment" [level=3]
    - paragraph: Navigate to your booked appointment
    - img
    - heading "Check In" [level=3]
    - paragraph: Scan the QR code displayed here
```

# Test source

```ts
   1 | // tests/admin-clinicians.spec.cjs
   2 | const { test, expect } = require('@playwright/test');
   3 |
   4 | // Test data
   5 | const adminUser = { 
   6 |   email: 'iplcmiami@gmail.com', 
   7 |   password: 'Iplcmiami1' 
   8 | };
   9 |
   10 | // Helper function to login as admin
   11 | async function loginAsAdmin(page) {
   12 |   await page.goto('/login');
   13 |   await page.waitForLoadState('networkidle');
   14 |   await page.waitForSelector('input[name="email"]', { timeout: 10000 });
   15 |   
   16 |   await page.fill('input[name="email"]', adminUser.email);
   17 |   await page.fill('input[name="password"]', adminUser.password);
   18 |   await page.click('button[type="submit"]');
   19 |   
   20 |   // Wait for redirect to admin dashboard
   21 |   await expect(page).toHaveURL(/reception-dashboard/);
   22 |   await page.waitForLoadState('networkidle');
   23 | }
   24 |
   25 | // Helper function to navigate to clinician management
   26 | async function navigateToClinicianManagement(page) {
   27 |   // Look for clinician management link/button in the admin dashboard
>  28 |   await page.waitForSelector('text=Clinician, text=Doctor, text=Staff', { timeout: 10000 });
      |              ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   29 |   await page.click('text=Clinician, text=Doctor, text=Staff').first();
   30 |   await page.waitForLoadState('networkidle');
   31 | }
   32 |
   33 | test.describe('Admin Clinician Management', () => {
   34 |   test.beforeEach(async ({ page }) => {
   35 |     await loginAsAdmin(page);
   36 |   });
   37 |
   38 |   test('can access clinician management page', async ({ page }) => {
   39 |     await navigateToClinicianManagement(page);
   40 |     
   41 |     // Verify we're on the clinician management page
   42 |     await expect(page.locator('h1, h2, h3')).toContainText(['Clinician', 'Doctor', 'Staff']);
   43 |     
   44 |     // Check for key clinician management elements
   45 |     await expect(page.locator('text=Add Clinician, text=Add Doctor, button:has-text("Add"), button:has-text("Create")')).toBeVisible();
   46 |   });
   47 |
   48 |   test('can view existing clinicians', async ({ page }) => {
   49 |     await navigateToClinicianManagement(page);
   50 |     
   51 |     // Wait for clinicians to load
   52 |     await page.waitForTimeout(2000);
   53 |     
   54 |     // Check if clinicians table/list is visible
   55 |     const cliniciansContainer = page.locator('table, .clinician-list, .clinician-grid, [data-testid="clinicians"]');
   56 |     await expect(cliniciansContainer).toBeVisible();
   57 |     
   58 |     // Verify clinician data is displayed
   59 |     const clinicianItems = page.locator('tr, .clinician-item, .clinician-card');
   60 |     const itemCount = await clinicianItems.count();
   61 |     expect(itemCount).toBeGreaterThan(0);
   62 |   });
   63 |
   64 |   test('can search and filter clinicians', async ({ page }) => {
   65 |     await navigateToClinicianManagement(page);
   66 |     
   67 |     // Wait for clinicians to load
   68 |     await page.waitForTimeout(2000);
   69 |     
   70 |     // Look for search input
   71 |     const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"], [data-testid="search"]').first();
   72 |     
   73 |     if (await searchInput.isVisible()) {
   74 |       // Test search functionality
   75 |       await searchInput.fill('test');
   76 |       await page.waitForTimeout(1000);
   77 |       
   78 |       // Clear search
   79 |       await searchInput.clear();
   80 |       await page.waitForTimeout(1000);
   81 |       
   82 |       // Verify all clinicians are shown again
   83 |       const clinicianItems = page.locator('tr, .clinician-item, .clinician-card');
   84 |       const itemCount = await clinicianItems.count();
   85 |       expect(itemCount).toBeGreaterThan(0);
   86 |     }
   87 |   });
   88 |
   89 |   test('can view clinician details', async ({ page }) => {
   90 |     await navigateToClinicianManagement(page);
   91 |     
   92 |     // Wait for clinicians to load
   93 |     await page.waitForTimeout(2000);
   94 |     
   95 |     // Look for view/details button on first clinician
   96 |     const viewButton = page.locator('button:has-text("View"), text=View, button:has-text("Details"), .view-button, [data-testid="view-clinician"]').first();
   97 |     
   98 |     if (await viewButton.isVisible()) {
   99 |       await viewButton.click();
  100 |       await page.waitForTimeout(1000);
  101 |       
  102 |       // Verify clinician details are displayed
  103 |       await expect(page.locator('text=Name, text=Email, text=Phone, text=Specialization')).toBeVisible();
  104 |     } else {
  105 |       // Try clicking on clinician name/row
  106 |       const clinicianRow = page.locator('tr, .clinician-item, .clinician-card').first();
  107 |       await clinicianRow.click();
  108 |       await page.waitForTimeout(1000);
  109 |       
  110 |       // Verify details view opened
  111 |       await expect(page.locator('text=Details, text=Information, text=Profile')).toBeVisible();
  112 |     }
  113 |   });
  114 |
  115 |   test('displays clinician schedules', async ({ page }) => {
  116 |     await navigateToClinicianManagement(page);
  117 |     
  118 |     // Wait for clinicians to load
  119 |     await page.waitForTimeout(2000);
  120 |     
  121 |     // Look for schedule button or link
  122 |     const scheduleButton = page.locator('button:has-text("Schedule"), text=Schedule, button:has-text("View Schedule"), [data-testid="clinician-schedule"]').first();
  123 |     
  124 |     if (await scheduleButton.isVisible()) {
  125 |       await scheduleButton.click();
  126 |       await page.waitForTimeout(1000);
  127 |       
  128 |       // Verify schedule information is displayed
```