const { test, expect } = require('@playwright/test');

test('debug page loading', async ({ page }) => {
  // Capture console logs and errors
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
    console.log(`BROWSER ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`BROWSER ERROR: ${error.message}`);
  });
  
  console.log('Going to /login...');
  await page.goto('/login');
  
  console.log('Waiting for load state...');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more for React to render
  await page.waitForTimeout(2000);
  
  console.log('Getting page title...');
  const title = await page.title();
  console.log('Page title:', title);
  
  console.log('Getting page URL...');
  const url = page.url();
  console.log('Current URL:', url);
  
  console.log('Looking for React root element...');
  const reactRoot = await page.locator('#root').count();
  console.log('React root elements found:', reactRoot);
  
  console.log('Looking for any form elements...');
  const forms = await page.locator('form').count();
  console.log('Number of form elements found:', forms);
  
  console.log('Looking for any input elements...');
  const inputs = await page.locator('input').count();
  console.log('Number of input elements found:', inputs);
  
  console.log('Looking for any button elements...');
  const buttons = await page.locator('button').count();
  console.log('Number of button elements found:', buttons);
  
  console.log('Looking for login-related text...');
  const loginText = await page.getByText('Login', { exact: false }).count();
  const emailText = await page.getByText('Email', { exact: false }).count();
  const passwordText = await page.getByText('Password', { exact: false }).count();
  console.log(`Login text found: ${loginText}, Email text: ${emailText}, Password text: ${passwordText}`);
  
  console.log('Getting body text content...');
  const bodyText = await page.locator('body').textContent();
  console.log('Body text preview:', bodyText?.substring(0, 500));
  
  if (inputs > 0) {
    console.log('Input elements:');
    for (let i = 0; i < inputs; i++) {
      const input = page.locator('input').nth(i);
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      const id = await input.getAttribute('id');
      console.log(`Input ${i}: name="${name}", type="${type}", id="${id}"`);
    }
  }
  
  console.log('Console logs captured:', logs.length);
  console.log('JavaScript errors captured:', errors.length);
  
  if (errors.length > 0) {
    console.log('JavaScript errors:');
    errors.forEach((error, i) => console.log(`Error ${i}: ${error}`));
  }
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
});