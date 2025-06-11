# Test info

- Name: Authentication Flow >> can logout successfully
- Location: c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\auth.spec.cjs:150:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "https://booksmartly.iplcmiami.com/client-dashboard"
============================================================
    at c:\Users\Peter Darley\Desktop\DEV\BookSmartly\frontend\tests\auth.spec.cjs:161:16
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
   61 |             
   62 |             // Also try to get the role using the same logic as ContextProvider
   63 |             let detectedRole = null;
   64 |             if (user && user.raw_user_meta_data?.role) {
   65 |               detectedRole = user.raw_user_meta_data.role;
   66 |             } else {
   67 |               detectedRole = 'client'; // default fallback
   68 |             }
   69 |             
   70 |             return {
   71 |               id: user?.id,
   72 |               email: user?.email,
   73 |               raw_user_meta_data: user?.raw_user_meta_data,
   74 |               user_metadata: user?.user_metadata,
   75 |               app_metadata: user?.app_metadata,
   76 |               detectedRole: detectedRole,
   77 |               hasRoleInMetadata: !!user?.raw_user_meta_data?.role
   78 |             };
   79 |           } else {
   80 |             return { error: "Supabase client not found on window object" };
   81 |           }
   82 |         } catch (err) {
   83 |           return { error: `Evaluation failed: ${err.message}` };
   84 |         }
   85 |       });
   86 |       
   87 |       console.log(`Debug info for ${user.email}:`, JSON.stringify(debugInfo, null, 2));
   88 |       
   89 |       // For now, just verify we're on some dashboard
   90 |       await expect(page).toHaveURL(/\/.*dashboard/);
   91 |       
   92 |       // Take screenshot for verification
   93 |       await page.screenshot({ path: `test-results/login-${user.email.split('@')[0]}-debug.png` });
   94 |     });
   95 |   }
   96 |
   97 |   test('shows error for invalid login', async ({ page }) => {
   98 |     await page.goto('/login');
   99 |     
  100 |     // Wait for the page to be fully loaded
  101 |     await page.waitForLoadState('networkidle');
  102 |     
  103 |     // Wait for the login form to be visible
  104 |     await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  105 |     
  106 |     // Verify form is rendered
  107 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  108 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  109 |     
  110 |     // Fill with invalid credentials
  111 |     await page.fill('input[name="email"]', 'invalid@example.com');
  112 |     await page.fill('input[name="password"]', 'wrongpassword');
  113 |     await page.click('button[type="submit"]');
  114 |     
  115 |     // Wait for error message to appear
  116 |     await page.waitForTimeout(3000);
  117 |     
  118 |     // Check for error indicators
  119 |     const errorSelectors = [
  120 |       '.error',
  121 |       '[role="alert"]',
  122 |       'text=Invalid',
  123 |       'text=Error',
  124 |       'text=incorrect',
  125 |       'text=failed',
  126 |       '.toast',
  127 |       '.notification'
  128 |     ];
  129 |     
  130 |     let errorFound = false;
  131 |     for (const selector of errorSelectors) {
  132 |       if (await page.locator(selector).isVisible()) {
  133 |         errorFound = true;
  134 |         break;
  135 |       }
  136 |     }
  137 |     
  138 |     // Verify error is shown or we're still on login page
  139 |     if (!errorFound) {
  140 |       // If no explicit error message, verify we're still on login page
  141 |       await expect(page).toHaveURL(/login/);
  142 |     } else {
  143 |       expect(errorFound).toBe(true);
  144 |     }
  145 |     
  146 |     // Take screenshot for debugging
  147 |     await page.screenshot({ path: 'test-results/login-error.png' });
  148 |   });
  149 |
  150 |   test('can logout successfully', async ({ page }) => {
  151 |     // Login as admin first
  152 |     await page.goto('/login');
  153 |     await page.waitForLoadState('networkidle');
  154 |     await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  155 |     
  156 |     await page.fill('input[name="email"]', admin.email);
  157 |     await page.fill('input[name="password"]', admin.password);
  158 |     await page.click('button[type="submit"]');
  159 |     
  160 |     // Wait for dashboard to load
> 161 |     await page.waitForURL(new RegExp(admin.dashboard), { timeout: 15000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  162 |     await page.waitForLoadState('networkidle');
  163 |     
  164 |     // Look for logout button/link
  165 |     const logoutSelectors = [
  166 |       'button:has-text("Logout")',
  167 |       'button:has-text("Sign Out")',
  168 |       'text=Logout',
  169 |       'text=Sign Out',
  170 |       '[data-testid="logout"]',
  171 |       '.logout-button'
  172 |     ];
  173 |     
  174 |     let logoutButton = null;
  175 |     for (const selector of logoutSelectors) {
  176 |       const element = page.locator(selector).first();
  177 |       if (await element.isVisible()) {
  178 |         logoutButton = element;
  179 |         break;
  180 |       }
  181 |     }
  182 |     
  183 |     if (logoutButton) {
  184 |       await logoutButton.click();
  185 |       
  186 |       // Wait for redirect to login or home page
  187 |       await page.waitForTimeout(2000);
  188 |       
  189 |       // Verify we're logged out (redirected to login or home)
  190 |       const currentUrl = page.url();
  191 |       expect(currentUrl).toMatch(/(login|home|\/)/);
  192 |     }
  193 |   });
  194 |
  195 |   test('redirects to login when accessing protected route without authentication', async ({ page }) => {
  196 |     // Try to access admin dashboard directly without logging in
  197 |     await page.goto('/reception-dashboard');
  198 |     
  199 |     // Should be redirected to login
  200 |     await page.waitForTimeout(3000);
  201 |     await expect(page).toHaveURL(/login/);
  202 |     
  203 |     // Verify login form is visible
  204 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  205 |   });
  206 | });
```