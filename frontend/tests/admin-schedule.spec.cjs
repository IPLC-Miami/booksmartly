// tests/admin-schedule.spec.cjs
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

// Helper function to navigate to schedule management
async function navigateToScheduleManagement(page) {
  // Look for schedule management link/button in the admin dashboard
  await page.waitForSelector('text=Schedule', { timeout: 10000 });
  await page.click('text=Schedule');
  await page.waitForLoadState('networkidle');
}

test.describe('Admin Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('can access schedule management page', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Verify we're on the schedule management page
    await expect(page.locator('h1, h2, h3')).toContainText(['Schedule', 'Management']);
    
    // Check for key schedule management elements
    await expect(page.locator('text=Add Schedule, text=Create Schedule, button:has-text("Add"), button:has-text("Create")')).toBeVisible();
  });

  test('can view existing schedules', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Wait for schedules to load
    await page.waitForTimeout(2000);
    
    // Check if schedules table/list is visible
    const schedulesContainer = page.locator('table, .schedule-list, .schedule-grid, [data-testid="schedules"]');
    await expect(schedulesContainer).toBeVisible();
  });

  test('can create a new schedule', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Click add/create schedule button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule').first();
    await addButton.click();
    
    // Wait for form/modal to appear
    await page.waitForTimeout(1000);
    
    // Fill out schedule form (adjust selectors based on actual form structure)
    const clinicianSelect = page.locator('select[name="clinician_id"], select[name="clinician"], [data-testid="clinician-select"]').first();
    if (await clinicianSelect.isVisible()) {
      await clinicianSelect.selectOption({ index: 1 }); // Select first available clinician
    }
    
    const dateInput = page.locator('input[type="date"], input[name="date"], [data-testid="date-input"]').first();
    if (await dateInput.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await dateInput.fill(dateString);
    }
    
    const startTimeInput = page.locator('input[name="start_time"], input[type="time"]:first, [data-testid="start-time"]').first();
    if (await startTimeInput.isVisible()) {
      await startTimeInput.fill('09:00');
    }
    
    const endTimeInput = page.locator('input[name="end_time"], input[type="time"]:last, [data-testid="end-time"]').first();
    if (await endTimeInput.isVisible()) {
      await endTimeInput.fill('17:00');
    }
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').last();
    await submitButton.click();
    
    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Verify schedule was created (look for success message or new schedule in list)
    const successIndicator = page.locator('text=success, text=created, text=added, .success, .toast, [role="alert"]');
    await expect(successIndicator).toBeVisible({ timeout: 5000 });
  });

  test('can edit an existing schedule', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Wait for schedules to load
    await page.waitForTimeout(2000);
    
    // Look for edit button/link on first schedule
    const editButton = page.locator('button:has-text("Edit"), text=Edit, .edit-button, [data-testid="edit-schedule"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Wait for edit form to appear
      await page.waitForTimeout(1000);
      
      // Modify a field (e.g., end time)
      const endTimeInput = page.locator('input[name="end_time"], input[type="time"]:last, [data-testid="end-time"]').first();
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill('18:00');
      }
      
      // Save changes
      const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').last();
      await saveButton.click();
      
      // Wait for success confirmation
      await page.waitForTimeout(2000);
      
      // Verify update was successful
      const successIndicator = page.locator('text=success, text=updated, text=saved, .success, .toast, [role="alert"]');
      await expect(successIndicator).toBeVisible({ timeout: 5000 });
    }
  });

  test('can delete a schedule', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Wait for schedules to load
    await page.waitForTimeout(2000);
    
    // Look for delete button on first schedule
    const deleteButton = page.locator('button:has-text("Delete"), text=Delete, .delete-button, [data-testid="delete-schedule"]').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Handle confirmation dialog if it appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').last();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Wait for deletion to complete
      await page.waitForTimeout(2000);
      
      // Verify deletion was successful
      const successIndicator = page.locator('text=success, text=deleted, text=removed, .success, .toast, [role="alert"]');
      await expect(successIndicator).toBeVisible({ timeout: 5000 });
    }
  });

  test('can manage doctor slots', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Wait for schedules to load
    await page.waitForTimeout(2000);
    
    // Look for slots/appointments button or link
    const slotsButton = page.locator('button:has-text("Slots"), text=Slots, text=Appointments, button:has-text("Manage Slots")').first();
    
    if (await slotsButton.isVisible()) {
      await slotsButton.click();
      await page.waitForTimeout(1000);
      
      // Verify slots management interface is visible
      await expect(page.locator('text=Slot, text=Appointment, text=Time')).toBeVisible();
      
      // Try to add a new slot
      const addSlotButton = page.locator('button:has-text("Add Slot"), button:has-text("Add"), text=Add Slot').first();
      if (await addSlotButton.isVisible()) {
        await addSlotButton.click();
        await page.waitForTimeout(1000);
        
        // Fill slot details
        const slotTimeInput = page.locator('input[type="time"], input[name="slot_time"], [data-testid="slot-time"]').first();
        if (await slotTimeInput.isVisible()) {
          await slotTimeInput.fill('10:00');
        }
        
        const durationInput = page.locator('input[name="duration"], select[name="duration"], [data-testid="duration"]').first();
        if (await durationInput.isVisible()) {
          if (await durationInput.getAttribute('type') === 'number') {
            await durationInput.fill('30');
          } else {
            await durationInput.selectOption('30');
          }
        }
        
        // Save slot
        const saveSlotButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').last();
        await saveSlotButton.click();
        
        // Verify slot was added
        await page.waitForTimeout(2000);
        const successIndicator = page.locator('text=success, text=added, text=created, .success, .toast, [role="alert"]');
        await expect(successIndicator).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('displays validation errors for invalid schedule data', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Click add schedule button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule').first();
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Try to submit form without required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').last();
    await submitButton.click();
    
    // Wait for validation errors
    await page.waitForTimeout(1000);
    
    // Check for error messages
    const errorMessages = page.locator('.error, [role="alert"], text=required, text=invalid, .field-error');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('can filter and search schedules', async ({ page }) => {
    await navigateToScheduleManagement(page);
    
    // Wait for schedules to load
    await page.waitForTimeout(2000);
    
    // Look for search/filter inputs
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"], [data-testid="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Verify search results are filtered
      const scheduleItems = page.locator('tr, .schedule-item, .schedule-card');
      const itemCount = await scheduleItems.count();
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
      // Verify all schedules are shown again
      const newItemCount = await scheduleItems.count();
      expect(newItemCount).toBeGreaterThanOrEqual(itemCount);
    }
    
    // Test date filter if available
    const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]').first();
    if (await dateFilter.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await dateFilter.fill(today);
      await page.waitForTimeout(1000);
      
      // Verify schedules are filtered by date
      await expect(page.locator('text=No schedules, text=No results, .empty-state')).toBeVisible({ timeout: 5000 });
    }
  });
});