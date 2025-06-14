# Test info

- Name: Admin Schedule Management >> can view existing schedules
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-schedule.spec.cjs:48:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('table, .schedule-list, .schedule-grid, [data-testid="schedules"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('table, .schedule-list, .schedule-grid, [data-testid="schedules"]')

    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-schedule.spec.cjs:56:38
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
    - tab "Profile"
    - tab "Queues"
    - tab "Schedule Management" [selected]
  - tabpanel "Schedule Management":
    - text: "Error: Failed to load schedule data: Failed to fetch doctor slots."
    - button "Retry"
```

# Test source

```ts
   1 | // tests/admin-schedule.spec.cjs
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
   25 | // Helper function to navigate to schedule management
   26 | async function navigateToScheduleManagement(page) {
   27 |   // Look for schedule management link/button in the admin dashboard
   28 |   await page.waitForSelector('text=Schedule', { timeout: 10000 });
   29 |   await page.click('text=Schedule');
   30 |   await page.waitForLoadState('networkidle');
   31 | }
   32 |
   33 | test.describe('Admin Schedule Management', () => {
   34 |   test.beforeEach(async ({ page }) => {
   35 |     await loginAsAdmin(page);
   36 |   });
   37 |
   38 |   test('can access schedule management page', async ({ page }) => {
   39 |     await navigateToScheduleManagement(page);
   40 |     
   41 |     // Verify we're on the schedule management page
   42 |     await expect(page.locator('h1, h2, h3')).toContainText(['Schedule', 'Management']);
   43 |     
   44 |     // Check for key schedule management elements
   45 |     await expect(page.locator('text=Add Schedule, text=Create Schedule, button:has-text("Add"), button:has-text("Create")')).toBeVisible();
   46 |   });
   47 |
   48 |   test('can view existing schedules', async ({ page }) => {
   49 |     await navigateToScheduleManagement(page);
   50 |     
   51 |     // Wait for schedules to load
   52 |     await page.waitForTimeout(2000);
   53 |     
   54 |     // Check if schedules table/list is visible
   55 |     const schedulesContainer = page.locator('table, .schedule-list, .schedule-grid, [data-testid="schedules"]');
>  56 |     await expect(schedulesContainer).toBeVisible();
      |                                      ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   57 |   });
   58 |
   59 |   test('can create a new schedule', async ({ page }) => {
   60 |     await navigateToScheduleManagement(page);
   61 |     
   62 |     // Click add/create schedule button
   63 |     const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule').first();
   64 |     await addButton.click();
   65 |     
   66 |     // Wait for form/modal to appear
   67 |     await page.waitForTimeout(1000);
   68 |     
   69 |     // Fill out schedule form (adjust selectors based on actual form structure)
   70 |     const clinicianSelect = page.locator('select[name="clinician_id"], select[name="clinician"], [data-testid="clinician-select"]').first();
   71 |     if (await clinicianSelect.isVisible()) {
   72 |       await clinicianSelect.selectOption({ index: 1 }); // Select first available clinician
   73 |     }
   74 |     
   75 |     const dateInput = page.locator('input[type="date"], input[name="date"], [data-testid="date-input"]').first();
   76 |     if (await dateInput.isVisible()) {
   77 |       const tomorrow = new Date();
   78 |       tomorrow.setDate(tomorrow.getDate() + 1);
   79 |       const dateString = tomorrow.toISOString().split('T')[0];
   80 |       await dateInput.fill(dateString);
   81 |     }
   82 |     
   83 |     const startTimeInput = page.locator('input[name="start_time"], input[type="time"]:first, [data-testid="start-time"]').first();
   84 |     if (await startTimeInput.isVisible()) {
   85 |       await startTimeInput.fill('09:00');
   86 |     }
   87 |     
   88 |     const endTimeInput = page.locator('input[name="end_time"], input[type="time"]:last, [data-testid="end-time"]').first();
   89 |     if (await endTimeInput.isVisible()) {
   90 |       await endTimeInput.fill('17:00');
   91 |     }
   92 |     
   93 |     // Submit the form
   94 |     const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').last();
   95 |     await submitButton.click();
   96 |     
   97 |     // Wait for success message or redirect
   98 |     await page.waitForTimeout(2000);
   99 |     
  100 |     // Verify schedule was created (look for success message or new schedule in list)
  101 |     const successIndicator = page.locator('text=success, text=created, text=added, .success, .toast, [role="alert"]');
  102 |     await expect(successIndicator).toBeVisible({ timeout: 5000 });
  103 |   });
  104 |
  105 |   test('can edit an existing schedule', async ({ page }) => {
  106 |     await navigateToScheduleManagement(page);
  107 |     
  108 |     // Wait for schedules to load
  109 |     await page.waitForTimeout(2000);
  110 |     
  111 |     // Look for edit button/link on first schedule
  112 |     const editButton = page.locator('button:has-text("Edit"), text=Edit, .edit-button, [data-testid="edit-schedule"]').first();
  113 |     
  114 |     if (await editButton.isVisible()) {
  115 |       await editButton.click();
  116 |       
  117 |       // Wait for edit form to appear
  118 |       await page.waitForTimeout(1000);
  119 |       
  120 |       // Modify a field (e.g., end time)
  121 |       const endTimeInput = page.locator('input[name="end_time"], input[type="time"]:last, [data-testid="end-time"]').first();
  122 |       if (await endTimeInput.isVisible()) {
  123 |         await endTimeInput.fill('18:00');
  124 |       }
  125 |       
  126 |       // Save changes
  127 |       const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').last();
  128 |       await saveButton.click();
  129 |       
  130 |       // Wait for success confirmation
  131 |       await page.waitForTimeout(2000);
  132 |       
  133 |       // Verify update was successful
  134 |       const successIndicator = page.locator('text=success, text=updated, text=saved, .success, .toast, [role="alert"]');
  135 |       await expect(successIndicator).toBeVisible({ timeout: 5000 });
  136 |     }
  137 |   });
  138 |
  139 |   test('can delete a schedule', async ({ page }) => {
  140 |     await navigateToScheduleManagement(page);
  141 |     
  142 |     // Wait for schedules to load
  143 |     await page.waitForTimeout(2000);
  144 |     
  145 |     // Look for delete button on first schedule
  146 |     const deleteButton = page.locator('button:has-text("Delete"), text=Delete, .delete-button, [data-testid="delete-schedule"]').first();
  147 |     
  148 |     if (await deleteButton.isVisible()) {
  149 |       await deleteButton.click();
  150 |       
  151 |       // Handle confirmation dialog if it appears
  152 |       const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').last();
  153 |       if (await confirmButton.isVisible({ timeout: 2000 })) {
  154 |         await confirmButton.click();
  155 |       }
  156 |       
```