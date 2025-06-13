# Test info

- Name: Booking Flow End-to-End Tests >> should handle slot generation errors gracefully
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\booking-flow.spec.cjs:116:3

# Error details

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('text=Book Appointment')

    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\booking-flow.spec.cjs:117:16
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
    - tab "Appointments"
    - tab "History"
  - tabpanel "Profile":
    - img "Patient banner background"
    - img
    - button "Choose File"
    - text: "Email: Phone: Address: Age & Gender:"
    - button "Edit":
      - text: Edit
      - img
    - text: Appointments scheduled for today No appointments today
```

# Test source

```ts
   17 |     await page.click('text=Login');
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
> 117 |     await page.click('text=Book Appointment');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
  118 |     
  119 |     // Fill personal details
  120 |     await page.fill('input[name="firstName"]', 'Test');
  121 |     await page.fill('input[name="lastName"]', 'User');
  122 |     await page.fill('input[name="email"]', 'test@example.com');
  123 |     await page.fill('input[name="phone"]', '+1111111111');
  124 |     await page.fill('textarea[name="symptoms"]', 'Test symptoms');
  125 |     
  126 |     await page.click('button:has-text("Next")');
  127 |     
  128 |     // Wait for doctors to load
  129 |     await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
  130 |     
  131 |     // Select a doctor
  132 |     await page.locator('[data-testid="doctor-card"]').first().click();
  133 |     
  134 |     // Check for error handling if slots fail to load
  135 |     const errorMessage = page.locator('text=Failed to load available slots');
  136 |     const loadingSpinner = page.locator('[data-testid="loading-slots"]');
  137 |     
  138 |     // Wait for either slots to load or error to appear
  139 |     await Promise.race([
  140 |       page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 }),
  141 |       errorMessage.waitFor({ timeout: 15000 }),
  142 |       loadingSpinner.waitFor({ timeout: 15000 })
  143 |     ]);
  144 |     
  145 |     // If error appears, verify retry functionality
  146 |     if (await errorMessage.isVisible()) {
  147 |       const retryButton = page.locator('button:has-text("Retry")');
  148 |       if (await retryButton.isVisible()) {
  149 |         await retryButton.click();
  150 |         // Wait for retry attempt
  151 |         await page.waitForTimeout(3000);
  152 |       }
  153 |     }
  154 |   });
  155 |
  156 |   test('should validate required fields in personal details form', async ({ page }) => {
  157 |     await page.click('text=Book Appointment');
  158 |     
  159 |     // Try to proceed without filling required fields
  160 |     await page.click('button:has-text("Next")');
  161 |     
  162 |     // Verify validation errors appear
  163 |     await expect(page.locator('text=First name is required')).toBeVisible();
  164 |     await expect(page.locator('text=Last name is required')).toBeVisible();
  165 |     await expect(page.locator('text=Email is required')).toBeVisible();
  166 |     await expect(page.locator('text=Phone number is required')).toBeVisible();
  167 |     
  168 |     // Fill fields one by one and verify errors disappear
  169 |     await page.fill('input[name="firstName"]', 'John');
  170 |     await expect(page.locator('text=First name is required')).not.toBeVisible();
  171 |     
  172 |     await page.fill('input[name="lastName"]', 'Doe');
  173 |     await expect(page.locator('text=Last name is required')).not.toBeVisible();
  174 |     
  175 |     await page.fill('input[name="email"]', 'invalid-email');
  176 |     await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  177 |     
  178 |     await page.fill('input[name="email"]', 'john.doe@example.com');
  179 |     await expect(page.locator('text=Please enter a valid email')).not.toBeVisible();
  180 |     
  181 |     await page.fill('input[name="phone"]', '+1234567890');
  182 |     await expect(page.locator('text=Phone number is required')).not.toBeVisible();
  183 |   });
  184 |
  185 |   test('should handle real-time slot updates', async ({ page }) => {
  186 |     await page.click('text=Book Appointment');
  187 |     
  188 |     // Fill personal details
  189 |     await page.fill('input[name="firstName"]', 'Real');
  190 |     await page.fill('input[name="lastName"]', 'Time');
  191 |     await page.fill('input[name="email"]', 'realtime@example.com');
  192 |     await page.fill('input[name="phone"]', '+1555555555');
  193 |     await page.fill('textarea[name="symptoms"]', 'Testing real-time updates');
  194 |     
  195 |     await page.click('button:has-text("Next")');
  196 |     
  197 |     // Select doctor and wait for slots
  198 |     await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
  199 |     await page.locator('[data-testid="doctor-card"]').first().click();
  200 |     await page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 });
  201 |     
  202 |     // Count initial available slots
  203 |     const initialSlots = await page.locator('[data-testid="time-slot"]:not([disabled])').count();
  204 |     
  205 |     // Select a slot
  206 |     const selectedSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
  207 |     const slotText = await selectedSlot.textContent();
  208 |     await selectedSlot.click();
  209 |     
  210 |     // Verify slot is marked as selected
  211 |     await expect(selectedSlot).toHaveClass(/selected/);
  212 |     
  213 |     // Proceed to review
  214 |     await page.click('button:has-text("Continue to Review")');
  215 |     
  216 |     // Verify selected slot appears in review
  217 |     await expect(page.locator(`text=${slotText}`)).toBeVisible();
```