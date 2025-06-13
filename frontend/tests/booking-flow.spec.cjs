const { test, expect } = require('@playwright/test');

test.describe('Booking Flow End-to-End Tests', () => {
  const baseURL = 'https://booksmartly.iplcmiami.com';
  
  // Test user credentials
  const clientUser = {
    email: 'client@booksmartly.com',
    password: 'ClientPass123!'
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(baseURL);
    
    // Login as client user
    await page.click('text=Login');
    await page.fill('input[type="email"]', clientUser.email);
    await page.fill('input[type="password"]', clientUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for successful login and dashboard load
    await expect(page).toHaveURL(/.*dashboard/);
    await page.waitForLoadState('networkidle');
  });

  test('should complete full booking flow - personal details to slot selection', async ({ page }) => {
    // Step 1: Navigate to booking page
    await page.click('text=Book Appointment');
    await expect(page).toHaveURL(/.*book/);
    
    // Step 2: Fill personal details form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    // Fill medical information
    await page.fill('textarea[name="symptoms"]', 'Chest pain and shortness of breath');
    await page.fill('textarea[name="medicalHistory"]', 'No significant medical history');
    
    // Proceed to next step
    await page.click('button:has-text("Next")');
    
    // Step 3: Doctor and slot selection
    await expect(page.locator('h2:has-text("Select Doctor")')).toBeVisible();
    
    // Wait for doctors to load
    await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
    
    // Select first available doctor
    const firstDoctor = page.locator('[data-testid="doctor-card"]').first();
    await expect(firstDoctor).toBeVisible();
    await firstDoctor.click();
    
    // Wait for slots to generate
    await page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 });
    
    // Select first available time slot
    const firstSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
    await expect(firstSlot).toBeVisible();
    await firstSlot.click();
    
    // Proceed to review
    await page.click('button:has-text("Continue to Review")');
    
    // Step 4: Review and confirm
    await expect(page.locator('h2:has-text("Review Appointment")')).toBeVisible();
    
    // Verify appointment details are displayed
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
    await expect(page.locator('text=Chest pain and shortness of breath')).toBeVisible();
    
    // Confirm booking
    await page.click('button:has-text("Confirm Booking")');
    
    // Verify success message
    await expect(page.locator('text=Appointment booked successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should handle doctor filtering by specialization', async ({ page }) => {
    await page.click('text=Book Appointment');
    
    // Fill minimal personal details to proceed
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="email"]', 'jane.smith@example.com');
    await page.fill('input[name="phone"]', '+1987654321');
    await page.fill('textarea[name="symptoms"]', 'Heart palpitations');
    
    await page.click('button:has-text("Next")');
    
    // Wait for doctors to load
    await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
    
    // Test specialization filter
    const specializationFilter = page.locator('select[name="specialization"]');
    if (await specializationFilter.isVisible()) {
      await specializationFilter.selectOption('Cardiology');
      
      // Wait for filtered results
      await page.waitForTimeout(2000);
      
      // Verify only cardiology doctors are shown
      const doctorCards = page.locator('[data-testid="doctor-card"]');
      const count = await doctorCards.count();
      
      for (let i = 0; i < count; i++) {
        const card = doctorCards.nth(i);
        await expect(card.locator('text=Cardiology')).toBeVisible();
      }
    }
  });

  test('should handle slot generation errors gracefully', async ({ page }) => {
    await page.click('text=Book Appointment');
    
    // Fill personal details
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1111111111');
    await page.fill('textarea[name="symptoms"]', 'Test symptoms');
    
    await page.click('button:has-text("Next")');
    
    // Wait for doctors to load
    await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
    
    // Select a doctor
    await page.locator('[data-testid="doctor-card"]').first().click();
    
    // Check for error handling if slots fail to load
    const errorMessage = page.locator('text=Failed to load available slots');
    const loadingSpinner = page.locator('[data-testid="loading-slots"]');
    
    // Wait for either slots to load or error to appear
    await Promise.race([
      page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 }),
      errorMessage.waitFor({ timeout: 15000 }),
      loadingSpinner.waitFor({ timeout: 15000 })
    ]);
    
    // If error appears, verify retry functionality
    if (await errorMessage.isVisible()) {
      const retryButton = page.locator('button:has-text("Retry")');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        // Wait for retry attempt
        await page.waitForTimeout(3000);
      }
    }
  });

  test('should validate required fields in personal details form', async ({ page }) => {
    await page.click('text=Book Appointment');
    
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');
    
    // Verify validation errors appear
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Phone number is required')).toBeVisible();
    
    // Fill fields one by one and verify errors disappear
    await page.fill('input[name="firstName"]', 'John');
    await expect(page.locator('text=First name is required')).not.toBeVisible();
    
    await page.fill('input[name="lastName"]', 'Doe');
    await expect(page.locator('text=Last name is required')).not.toBeVisible();
    
    await page.fill('input[name="email"]', 'invalid-email');
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await expect(page.locator('text=Please enter a valid email')).not.toBeVisible();
    
    await page.fill('input[name="phone"]', '+1234567890');
    await expect(page.locator('text=Phone number is required')).not.toBeVisible();
  });

  test('should handle real-time slot updates', async ({ page }) => {
    await page.click('text=Book Appointment');
    
    // Fill personal details
    await page.fill('input[name="firstName"]', 'Real');
    await page.fill('input[name="lastName"]', 'Time');
    await page.fill('input[name="email"]', 'realtime@example.com');
    await page.fill('input[name="phone"]', '+1555555555');
    await page.fill('textarea[name="symptoms"]', 'Testing real-time updates');
    
    await page.click('button:has-text("Next")');
    
    // Select doctor and wait for slots
    await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
    await page.locator('[data-testid="doctor-card"]').first().click();
    await page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 });
    
    // Count initial available slots
    const initialSlots = await page.locator('[data-testid="time-slot"]:not([disabled])').count();
    
    // Select a slot
    const selectedSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
    const slotText = await selectedSlot.textContent();
    await selectedSlot.click();
    
    // Verify slot is marked as selected
    await expect(selectedSlot).toHaveClass(/selected/);
    
    // Proceed to review
    await page.click('button:has-text("Continue to Review")');
    
    // Verify selected slot appears in review
    await expect(page.locator(`text=${slotText}`)).toBeVisible();
  });

  test('should allow going back and forth between steps', async ({ page }) => {
    await page.click('text=Book Appointment');
    
    // Fill personal details
    await page.fill('input[name="firstName"]', 'Back');
    await page.fill('input[name="lastName"]', 'Forward');
    await page.fill('input[name="email"]', 'backforward@example.com');
    await page.fill('input[name="phone"]', '+1666666666');
    await page.fill('textarea[name="symptoms"]', 'Navigation testing');
    
    await page.click('button:has-text("Next")');
    
    // Go back to personal details
    await page.click('button:has-text("Back")');
    
    // Verify form data is preserved
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Back');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Forward');
    await expect(page.locator('input[name="email"]')).toHaveValue('backforward@example.com');
    
    // Go forward again
    await page.click('button:has-text("Next")');
    
    // Select doctor and slot
    await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
    await page.locator('[data-testid="doctor-card"]').first().click();
    await page.waitForSelector('[data-testid="time-slot"]', { timeout: 15000 });
    await page.locator('[data-testid="time-slot"]:not([disabled])').first().click();
    
    await page.click('button:has-text("Continue to Review")');
    
    // Go back to slot selection
    await page.click('button:has-text("Back")');
    
    // Verify doctor and slot selection is preserved
    await expect(page.locator('[data-testid="doctor-card"].selected')).toBeVisible();
    await expect(page.locator('[data-testid="time-slot"].selected')).toBeVisible();
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('text=Book Appointment');
    
    // Verify mobile-friendly layout
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check that form elements are properly sized for mobile
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const boundingBox = await input.boundingBox();
      if (boundingBox) {
        // Verify inputs are not too wide for mobile screen
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }
    
    // Fill form and proceed
    await page.fill('input[name="firstName"]', 'Mobile');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'mobile@example.com');
    await page.fill('input[name="phone"]', '+1777777777');
    await page.fill('textarea[name="symptoms"]', 'Mobile testing');
    
    await page.click('button:has-text("Next")');
    
    // Verify doctor cards are mobile-friendly
    await page.waitForSelector('[data-testid="doctor-card"]', { timeout: 10000 });
    const doctorCard = page.locator('[data-testid="doctor-card"]').first();
    const cardBox = await doctorCard.boundingBox();
    
    if (cardBox) {
      expect(cardBox.width).toBeLessThanOrEqual(375);
    }
  });
});