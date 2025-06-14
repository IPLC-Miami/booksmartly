# Test info

- Name: Booking Flow End-to-End Tests >> should allow going back and forth between steps
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\booking-flow.spec.cjs:220:3

# Error details

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('text=Login')

    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\booking-flow.spec.cjs:17:16
```

# Test source

```ts
   1 | const { test, expect } = require('@playwright/test');
   2 |
   3 | test.describe('Booking Flow End-to-End Tests', () => {
   4 |   const baseURL = 'https://booksmartly.iplcmiami.com';
   5 |   
   6 |   // Test user credentials
   7 |   const clientUser = {
   8 |     email: 'client@booksmartly.com',
   9 |     password: 'ClientPass123!'
   10 |   };
   11 |
   12 |   test.beforeEach(async ({ page }) => {
   13 |     // Navigate to the application
   14 |     await page.goto(baseURL);
   15 |     
   16 |     // Login as client user
>  17 |     await page.click('text=Login');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
   18 |     await page.fill('input[type="email"]', clientUser.email);
   19 |     await page.fill('input[type="password"]', clientUser.password);
   20 |     await page.click('button[type="submit"]');
   21 |     
   22 |     // Wait for successful login and dashboard load
   23 |     await expect(page).toHaveURL(/.*dashboard/);
   24 |     await page.waitForLoadState('networkidle');
   25 |   });
   26 |
   27 |   test('should complete full booking flow - personal details to slot selection', async ({ page }) => {
   28 |     // Step 1: Navigate to booking page
   29 |     await page.click('text=Book Appointment');
   30 |     await expect(page).toHaveURL(/.*book/);
   31 |     
   32 |     // Step 2: Fill personal details form
   33 |     await page.fill('input[name="firstName"]', 'John');
   34 |     await page.fill('input[name="lastName"]', 'Doe');
   35 |     await page.fill('input[name="email"]', 'john.doe@example.com');
   36 |     await page.fill('input[name="phone"]', '+1234567890');
   37 |     
   38 |     // Fill medical information
   39 |     await page.fill('textarea[name="symptoms"]', 'Chest pain and shortness of breath');
   40 |     await page.fill('textarea[name="medicalHistory"]', 'No significant medical history');
   41 |     
   42 |     // Proceed to next step
   43 |     await page.click('button:has-text("Next")');
   44 |     
   45 |     // Step 3: Doctor and slot selection
   46 |     await expect(page.locator('h2:has-text("Select Doctor")')).toBeVisible();
   47 |     
   48 |     // Wait for doctors to load
   49 |     await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
   50 |     
   51 |     // Select first available doctor
   52 |     const firstDoctor = page.locator('[data-testid="doctor-card"]').first();
   53 |     await expect(firstDoctor).toBeVisible();
   54 |     await firstDoctor.click();
   55 |     
   56 |     // Wait for slots to generate
   57 |     await page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 });
   58 |     
   59 |     // Select first available time slot
   60 |     const firstSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
   61 |     await expect(firstSlot).toBeVisible();
   62 |     await firstSlot.click();
   63 |     
   64 |     // Proceed to review
   65 |     await page.click('button:has-text("Continue to Review")');
   66 |     
   67 |     // Step 4: Review and confirm
   68 |     await expect(page.locator('h2:has-text("Review Appointment")')).toBeVisible();
   69 |     
   70 |     // Verify appointment details are displayed
   71 |     await expect(page.locator('text=John Doe')).toBeVisible();
   72 |     await expect(page.locator('text=john.doe@example.com')).toBeVisible();
   73 |     await expect(page.locator('text=Chest pain and shortness of breath')).toBeVisible();
   74 |     
   75 |     // Confirm booking
   76 |     await page.click('button:has-text("Confirm Booking")');
   77 |     
   78 |     // Verify success message
   79 |     await expect(page.locator('text=Appointment booked successfully')).toBeVisible({ timeout: 10000 });
   80 |   });
   81 |
   82 |   test('should handle doctor filtering by specialization', async ({ page }) => {
   83 |     await page.click('text=Book Appointment');
   84 |     
   85 |     // Fill minimal personal details to proceed
   86 |     await page.fill('input[name="firstName"]', 'Jane');
   87 |     await page.fill('input[name="lastName"]', 'Smith');
   88 |     await page.fill('input[name="email"]', 'jane.smith@example.com');
   89 |     await page.fill('input[name="phone"]', '+1987654321');
   90 |     await page.fill('textarea[name="symptoms"]', 'Heart palpitations');
   91 |     
   92 |     await page.click('button:has-text("Next")');
   93 |     
   94 |     // Wait for doctors to load
   95 |     await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
   96 |     
   97 |     // Test specialization filter
   98 |     const specializationFilter = page.locator('select[name="specialization"]');
   99 |     if (await specializationFilter.isVisible()) {
  100 |       await specializationFilter.selectOption('Cardiology');
  101 |       
  102 |       // Wait for filtered results
  103 |       await page.waitForTimeout(2000);
  104 |       
  105 |       // Verify only cardiology doctors are shown
  106 |       const doctorCards = page.locator('[data-testid="doctor-card"]');
  107 |       const count = await doctorCards.count();
  108 |       
  109 |       for (let i = 0; i < count; i++) {
  110 |         const card = doctorCards.nth(i);
  111 |         await expect(card.locator('text=Cardiology')).toBeVisible();
  112 |       }
  113 |     }
  114 |   });
  115 |
  116 |   test('should handle slot generation errors gracefully', async ({ page }) => {
  117 |     await page.click('text=Book Appointment');
```