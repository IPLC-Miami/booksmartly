# Test info

- Name: Admin Schedule Management >> displays validation errors for invalid schedule data
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-schedule.spec.cjs:215:3

# Error details

```
Error: locator.click: Unexpected token "=" while parsing css selector "button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule". Did you mean to CSS.escape it?
Call log:
  - waiting for button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule >> nth=0

    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\admin-schedule.spec.cjs:220:21
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
  157 |       // Wait for deletion to complete
  158 |       await page.waitForTimeout(2000);
  159 |       
  160 |       // Verify deletion was successful
  161 |       const successIndicator = page.locator('text=success, text=deleted, text=removed, .success, .toast, [role="alert"]');
  162 |       await expect(successIndicator).toBeVisible({ timeout: 5000 });
  163 |     }
  164 |   });
  165 |
  166 |   test('can manage doctor slots', async ({ page }) => {
  167 |     await navigateToScheduleManagement(page);
  168 |     
  169 |     // Wait for schedules to load
  170 |     await page.waitForTimeout(2000);
  171 |     
  172 |     // Look for slots/appointments button or link
  173 |     const slotsButton = page.locator('button:has-text("Slots"), text=Slots, text=Appointments, button:has-text("Manage Slots")').first();
  174 |     
  175 |     if (await slotsButton.isVisible()) {
  176 |       await slotsButton.click();
  177 |       await page.waitForTimeout(1000);
  178 |       
  179 |       // Verify slots management interface is visible
  180 |       await expect(page.locator('text=Slot, text=Appointment, text=Time')).toBeVisible();
  181 |       
  182 |       // Try to add a new slot
  183 |       const addSlotButton = page.locator('button:has-text("Add Slot"), button:has-text("Add"), text=Add Slot').first();
  184 |       if (await addSlotButton.isVisible()) {
  185 |         await addSlotButton.click();
  186 |         await page.waitForTimeout(1000);
  187 |         
  188 |         // Fill slot details
  189 |         const slotTimeInput = page.locator('input[type="time"], input[name="slot_time"], [data-testid="slot-time"]').first();
  190 |         if (await slotTimeInput.isVisible()) {
  191 |           await slotTimeInput.fill('10:00');
  192 |         }
  193 |         
  194 |         const durationInput = page.locator('input[name="duration"], select[name="duration"], [data-testid="duration"]').first();
  195 |         if (await durationInput.isVisible()) {
  196 |           if (await durationInput.getAttribute('type') === 'number') {
  197 |             await durationInput.fill('30');
  198 |           } else {
  199 |             await durationInput.selectOption('30');
  200 |           }
  201 |         }
  202 |         
  203 |         // Save slot
  204 |         const saveSlotButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').last();
  205 |         await saveSlotButton.click();
  206 |         
  207 |         // Verify slot was added
  208 |         await page.waitForTimeout(2000);
  209 |         const successIndicator = page.locator('text=success, text=added, text=created, .success, .toast, [role="alert"]');
  210 |         await expect(successIndicator).toBeVisible({ timeout: 5000 });
  211 |       }
  212 |     }
  213 |   });
  214 |
  215 |   test('displays validation errors for invalid schedule data', async ({ page }) => {
  216 |     await navigateToScheduleManagement(page);
  217 |     
  218 |     // Click add schedule button
  219 |     const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule').first();
> 220 |     await addButton.click();
      |                     ^ Error: locator.click: Unexpected token "=" while parsing css selector "button:has-text("Add"), button:has-text("Create"), text=Add Schedule, text=Create Schedule". Did you mean to CSS.escape it?
  221 |     await page.waitForTimeout(1000);
  222 |     
  223 |     // Try to submit form without required fields
  224 |     const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').last();
  225 |     await submitButton.click();
  226 |     
  227 |     // Wait for validation errors
  228 |     await page.waitForTimeout(1000);
  229 |     
  230 |     // Check for error messages
  231 |     const errorMessages = page.locator('.error, [role="alert"], text=required, text=invalid, .field-error');
  232 |     await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  233 |   });
  234 |
  235 |   test('can filter and search schedules', async ({ page }) => {
  236 |     await navigateToScheduleManagement(page);
  237 |     
  238 |     // Wait for schedules to load
  239 |     await page.waitForTimeout(2000);
  240 |     
  241 |     // Look for search/filter inputs
  242 |     const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"], [data-testid="search"]').first();
  243 |     
  244 |     if (await searchInput.isVisible()) {
  245 |       await searchInput.fill('test');
  246 |       await page.waitForTimeout(1000);
  247 |       
  248 |       // Verify search results are filtered
  249 |       const scheduleItems = page.locator('tr, .schedule-item, .schedule-card');
  250 |       const itemCount = await scheduleItems.count();
  251 |       
  252 |       // Clear search
  253 |       await searchInput.clear();
  254 |       await page.waitForTimeout(1000);
  255 |       
  256 |       // Verify all schedules are shown again
  257 |       const newItemCount = await scheduleItems.count();
  258 |       expect(newItemCount).toBeGreaterThanOrEqual(itemCount);
  259 |     }
  260 |     
  261 |     // Test date filter if available
  262 |     const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]').first();
  263 |     if (await dateFilter.isVisible()) {
  264 |       const today = new Date().toISOString().split('T')[0];
  265 |       await dateFilter.fill(today);
  266 |       await page.waitForTimeout(1000);
  267 |       
  268 |       // Verify schedules are filtered by date
  269 |       await expect(page.locator('text=No schedules, text=No results, .empty-state')).toBeVisible({ timeout: 5000 });
  270 |     }
  271 |   });
  272 | });
```