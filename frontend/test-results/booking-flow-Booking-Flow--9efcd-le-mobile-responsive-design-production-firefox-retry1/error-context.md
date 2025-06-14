# Test info

- Name: Booking Flow End-to-End Tests >> should handle mobile responsive design
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\booking-flow.spec.cjs:259:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="doctor-card"]') to be visible

    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\booking-flow.spec.cjs:292:16
```

# Page snapshot

```yaml
- region "Notifications alt+T"
- region "Notifications Alt+T"
- img "BookSmartly Logo"
- button:
  - img
- button "Login"
- main:
  - img
  - text: Something Went wrong !
  - paragraph: A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

# Test source

```ts
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
  218 |   });
  219 |
  220 |   test('should allow going back and forth between steps', async ({ page }) => {
  221 |     await page.click('text=Book Appointment');
  222 |     
  223 |     // Fill personal details
  224 |     await page.fill('input[name="firstName"]', 'Back');
  225 |     await page.fill('input[name="lastName"]', 'Forward');
  226 |     await page.fill('input[name="email"]', 'backforward@example.com');
  227 |     await page.fill('input[name="phone"]', '+1666666666');
  228 |     await page.fill('textarea[name="symptoms"]', 'Navigation testing');
  229 |     
  230 |     await page.click('button:has-text("Next")');
  231 |     
  232 |     // Go back to personal details
  233 |     await page.click('button:has-text("Back")');
  234 |     
  235 |     // Verify form data is preserved
  236 |     await expect(page.locator('input[name="firstName"]')).toHaveValue('Back');
  237 |     await expect(page.locator('input[name="lastName"]')).toHaveValue('Forward');
  238 |     await expect(page.locator('input[name="email"]')).toHaveValue('backforward@example.com');
  239 |     
  240 |     // Go forward again
  241 |     await page.click('button:has-text("Next")');
  242 |     
  243 |     // Select doctor and slot
  244 |     await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
  245 |     await page.locator('[data-testid="doctor-card"]').first().click();
  246 |     await page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 });
  247 |     await page.locator('[data-testid="time-slot"]:not([disabled])').first().click();
  248 |     
  249 |     await page.click('button:has-text("Continue to Review")');
  250 |     
  251 |     // Go back to slot selection
  252 |     await page.click('button:has-text("Back")');
  253 |     
  254 |     // Verify doctor and slot selection is preserved
  255 |     await expect(page.locator('[data-testid="doctor-card"].selected')).toBeVisible();
  256 |     await expect(page.locator('[data-testid="time-slot"].selected')).toBeVisible();
  257 |   });
  258 |
  259 |   test('should handle mobile responsive design', async ({ page }) => {
  260 |     // Set mobile viewport
  261 |     await page.setViewportSize({ width: 375, height: 667 });
  262 |     
  263 |     await page.click('text=Book Appointment');
  264 |     
  265 |     // Verify mobile-friendly layout
  266 |     const form = page.locator('form');
  267 |     await expect(form).toBeVisible();
  268 |     
  269 |     // Check that form elements are properly sized for mobile
  270 |     const inputs = page.locator('input, textarea');
  271 |     const inputCount = await inputs.count();
  272 |     
  273 |     for (let i = 0; i < inputCount; i++) {
  274 |       const input = inputs.nth(i);
  275 |       const boundingBox = await input.boundingBox();
  276 |       if (boundingBox) {
  277 |         // Verify inputs are not too wide for mobile screen
  278 |         expect(boundingBox.width).toBeLessThanOrEqual(375);
  279 |       }
  280 |     }
  281 |     
  282 |     // Fill form and proceed
  283 |     await page.fill('input[name="firstName"]', 'Mobile');
  284 |     await page.fill('input[name="lastName"]', 'User');
  285 |     await page.fill('input[name="email"]', 'mobile@example.com');
  286 |     await page.fill('input[name="phone"]', '+1777777777');
  287 |     await page.fill('textarea[name="symptoms"]', 'Mobile testing');
  288 |     
  289 |     await page.click('button:has-text("Next")');
  290 |     
  291 |     // Verify doctor cards are mobile-friendly
> 292 |     await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  293 |     const doctorCard = page.locator('[data-testid="doctor-card"]').first();
  294 |     const cardBox = await doctorCard.boundingBox();
  295 |     
  296 |     if (cardBox) {
  297 |       expect(cardBox.width).toBeLessThanOrEqual(375);
  298 |     }
  299 |   });
  300 | });
```