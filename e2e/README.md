# E2E Testing with Playwright

## Setup

This project uses Playwright for end-to-end testing with authentication bypass in test mode.

### Prerequisites

1. Install dependencies: `pnpm install`
2. **Start dev server in test mode**: `pnpm dev:test` (in a separate terminal)
   - This sets `PLAYWRIGHT_TEST_MODE=true` to bypass authentication
   - Keep this running while you execute tests

### Running Tests

```bash
# IMPORTANT: First, start the dev server in test mode
pnpm dev:test

# In another terminal, run tests:

# Run all tests
pnpm e2e

# Run tests in headed mode (see browser)
pnpm e2e:headed

# Debug tests
pnpm e2e:debug

# Run specific test file
pnpm playwright test e2e/movies.spec.ts
```

## Authentication in Tests

Tests bypass authentication using the `PLAYWRIGHT_TEST_MODE` environment variable. This is automatically set in the `playwright.config.ts` file.

### How it works

1. `playwright.config.ts` sets `PLAYWRIGHT_TEST_MODE=true` in the webServer config
2. `src/middleware.ts` checks for this variable and skips authentication when true
3. Tests can access protected routes without logging in

**⚠️ Important**: This bypass is ONLY active when running Playwright tests. Production builds are not affected.

## Test Structure

```
e2e/
├── landing-page.spec.ts    # Public landing page tests
├── movies.spec.ts          # Movies page tests (requires auth bypass)
├── dashboard.spec.ts       # Dashboard tests (requires auth bypass)
└── README.md              # This file
```

## Writing Tests

### Best Practices

1. **Use `test.beforeEach`** for navigation to reduce duplication
2. **Use `data-testid`** attributes for reliable element selection
3. **Add timeouts** for elements that may take time to load
4. **Wait for `networkidle`** when testing pages with data fetching

### Example Test

```typescript
import { expect, test } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-page');
    await page.waitForLoadState('networkidle');
  });

  test('should display element', async ({ page }) => {
    const element = page.getByTestId('my-element');
    await expect(element).toBeVisible({ timeout: 10000 });
  });
});
```

## Troubleshooting

### Element not found

- Ensure the element has a `data-testid` attribute
- Check if the page requires authentication (verify middleware bypass)
- Increase timeout: `await expect(element).toBeVisible({ timeout: 10000 })`
- Use `networkidle` instead of `domcontentloaded`

### Authentication issues

- Verify `PLAYWRIGHT_TEST_MODE=true` is set in `playwright.config.ts`
- Check middleware logic in `src/middleware.ts`
- Ensure dev server is running with the correct environment variable

### Tests timing out

- Increase timeout in test: `test('...', async ({ page }) => { ... }, { timeout: 30000 })`
- Check if the dev server is responding
- Verify network conditions and API responses
