# BookSmartly Production Test Suite

This directory contains comprehensive end-to-end tests for the BookSmartly application using Playwright, configured specifically for **PRODUCTION TESTING**.

## Test Files

### 1. `auth.spec.cjs` - Authentication Tests
- Tests login functionality for all user roles (admin, client, clinician)
- Validates error handling for invalid credentials
- Tests logout functionality
- Verifies protected route access control

### 2. `admin-schedule.spec.cjs` - Admin Schedule Management Tests
- Tests admin access to schedule management
- CRUD operations for schedules (Create, Read, Update, Delete)
- Doctor slots management
- Form validation and error handling
- Search and filter functionality

### 3. `admin-clinicians.spec.cjs` - Admin Clinician Management Tests
- Tests admin access to clinician management
- View clinician details and schedules
- Search and filter clinicians
- Navigation and UI interactions

### 4. `debug.spec.cjs` - Debug and Troubleshooting Tests
- Captures console logs and errors
- Takes screenshots for debugging
- Analyzes page structure and elements

## Production Configuration

The tests are configured in `playwright.config.cjs` for production testing:
- **Production URL**: `https://booksmartly.iplcmiami.com`
- **Browser Support**: Chrome, Firefox, Safari
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Traces**: Retained on failure
- **Timeout**: 45 seconds per test
- **Retries**: 2 retries on failure

## Running Production Tests

### Prerequisites
1. Ensure the production application is deployed and accessible at `https://booksmartly.iplcmiami.com`

2. Install Playwright browsers (if not already installed):
   ```bash
   cd frontend
   npm run test:install
   ```

### Test Commands

#### Run All Tests (Production Chrome - Default)
```bash
cd frontend
npm test
```

#### Run Tests with Browser UI (Headed Mode)
```bash
npm run test:headed
```

#### Run Tests with Playwright UI (Interactive)
```bash
npm run test:ui
```

#### Run All Production Browsers
```bash
npm run test:production
```

#### Run Specific Production Browsers
```bash
# Chrome only
npm run test:production:chrome

# Firefox only
npm run test:production:firefox

# Safari only
npm run test:production:safari
```

#### Run Specific Test Suites
```bash
# Authentication tests only
npm run test:auth

# Admin functionality tests only
npm run test:admin
```

## Test Data and User Accounts

The tests use the following test accounts in production:

### Admin User
- **Email**: `admin@booksmartly.com`
- **Password**: `AdminPass123!`
- **Role**: Admin
- **Access**: Full admin dashboard, schedule management, clinician management

### Client User
- **Email**: `client@booksmartly.com`
- **Password**: `ClientPass123!`
- **Role**: Client
- **Access**: Client dashboard, booking appointments

### Clinician User
- **Email**: `clinician@booksmartly.com`
- **Password**: `ClinicianPass123!`
- **Role**: Clinician
- **Access**: Clinician dashboard, patient management

## Test Results and Reports

After running tests, you can view results in:
- **Console output**: Real-time test results
- **HTML Report**: `frontend/playwright-report/index.html`
- **JSON Report**: `frontend/test-results/results.json`

To view the HTML report:
```bash
npx playwright show-report
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Production tests have 45-second timeout
   - Network latency may cause slower responses
   - Tests automatically retry twice on failure

2. **Authentication Failures**
   - Verify test user accounts exist in production database
   - Check if passwords have been changed
   - Ensure Supabase authentication is working

3. **Element Not Found**
   - Production UI may differ from local development
   - Check if selectors need updating
   - Use debug tests to inspect page structure

4. **Network Issues**
   - Ensure stable internet connection
   - Check if production site is accessible
   - Verify CORS and API endpoints

### Debug Mode

Run debug tests to troubleshoot issues:
```bash
npm run test debug.spec.cjs --project=production-chrome
```

This will:
- Capture detailed console logs
- Take screenshots of current page state
- Log page structure and available elements
- Help identify selector or timing issues

## Best Practices

1. **Run tests regularly** against production to catch regressions
2. **Monitor test results** for patterns in failures
3. **Update selectors** when UI changes are deployed
4. **Verify test data** remains valid in production
5. **Use headed mode** for debugging complex issues
6. **Check multiple browsers** for cross-browser compatibility

## CI/CD Integration

These tests can be integrated into your deployment pipeline:

```bash
# In your CI/CD pipeline, after production deployment
cd frontend
npm run test:production
```

This ensures that every production deployment is automatically tested for critical functionality.