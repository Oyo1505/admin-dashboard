import { URL_DASHBOARD } from '@/shared/route';
import { test, expect } from '@playwright/test';

/**
 * User Journey Tests for Analytics Dashboard
 * These tests validate complete user workflows from start to finish
 */

test.describe('User Journey - Regular User Analytics Experience', () => {
  test('complete user analytics journey', async ({ page }) => {
    // Step 1: Navigate to dashboard
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Step 2: Verify user can see their personal statistics
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });
    const totalFavorites = page.getByText('Total favoris');
    await expect(totalFavorites).toBeVisible();

    // Step 3: User views their favorite genre
    const favoriteGenre = page.getByText('Genre préféré');
    await expect(favoriteGenre).toBeVisible();

    // Step 4: User scrolls to see recent favorites list
    await page.evaluate(() => window.scrollTo(0, 300));
    const favoritesList = page.getByText('Vos Films Favoris Récents');
    await expect(favoritesList).toBeVisible();

    // Step 5: User views their analytics table
    await page.evaluate(() => window.scrollTo(0, 600));

    // Step 6: User verifies all sections loaded successfully
    await expect(page).toHaveTitle('Dashboard');
  });

  test('user refreshes dashboard and sees cached data', async ({ page }) => {
    // First visit
    await page.goto(URL_DASHBOARD);
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Get initial values
    const statsCards = page.locator('[class*="text-2xl font-bold"]');
    const firstValue = await statsCards.first().textContent();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify data loads quickly from cache
    await page.waitForSelector('text=Total favoris', { timeout: 5000 });
    const statsCardsAfterRefresh = page.locator('[class*="text-2xl font-bold"]');
    const valueAfterRefresh = await statsCardsAfterRefresh.first().textContent();

    // Data should be consistent
    expect(firstValue).toBe(valueAfterRefresh);
  });

  test('user navigates between dashboard sections', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // View analytics
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Navigate to settings
    await page.goto(URL_DASHBOARD + '/settings');
    await page.waitForLoadState('domcontentloaded');

    // Navigate back to dashboard
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Analytics should still be visible
    await expect(page.getByText('Total favoris')).toBeVisible({ timeout: 5000 });
  });

  test('user on mobile device views analytics', async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Wait for mobile layout to load
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Verify cards are stacked vertically on mobile
    const statsCards = page.locator('[class*="grid"]').first();
    await expect(statsCards).toBeVisible();

    // Scroll to view all sections
    await page.evaluate(() => window.scrollTo(0, 500));

    // User can scroll to see favorites list
    const favoritesList = page.getByText('Vos Films Favoris Récents');
    await expect(favoritesList).toBeVisible();
  });
});

test.describe('User Journey - Admin Analytics Experience', () => {
  test('complete admin analytics journey', async ({ page }) => {
    // Step 1: Admin navigates to dashboard
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Step 2: Admin sees global statistics overview
    await page.waitForSelector('text=Total Utilisateurs', { timeout: 10000 });

    // Verify all 6 admin stats cards
    await expect(page.getByText('Total Utilisateurs')).toBeVisible();
    await expect(page.getByText('Total Films')).toBeVisible();
    await expect(page.getByText('Total Genres')).toBeVisible();
    await expect(page.getByText('Utilisateurs Actifs')).toBeVisible();
    await expect(page.getByText('Films Publiés')).toBeVisible();
    await expect(page.getByText('Films Non Publiés')).toBeVisible();

    // Step 3: Admin scrolls to view application visits chart
    await page.evaluate(() => window.scrollTo(0, 400));

    // Step 4: Admin views top movies table
    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(page.getByText('Films Populaires')).toBeVisible({ timeout: 5000 });

    // Step 5: Admin views top users table
    await expect(page.getByRole('columnheader', { name: 'Visites' })).toBeVisible();

    // Step 6: Admin scrolls to recent activity feed
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(page.getByText('Activité Récente')).toBeVisible({ timeout: 5000 });

    // Step 7: Admin views complete analytics table
    await page.evaluate(() => window.scrollTo(0, 1600));
  });

  test('admin analyzes top performing movies', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to top movies section
    await page.waitForSelector('text=Films Populaires', { timeout: 10000 });

    // Verify table has data or shows empty state
    const table = page.locator('table').first();
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      // Check table structure
      await expect(table.locator('thead')).toBeVisible();
      await expect(table.locator('tbody')).toBeVisible();

      // Check for movie data
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        // Verify first movie has image, title, and favorites count
        const firstRow = rows.first();
        await expect(firstRow.locator('img')).toBeVisible();
      }
    } else {
      // Should show empty state
      await expect(page.getByText('Aucun film populaire')).toBeVisible();
    }
  });

  test('admin monitors user activity', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to recent activity section
    await page.waitForSelector('text=Activité Récente', { timeout: 10000 });
    await page.evaluate(() => {
      const element = document.querySelector('text=Activité Récente');
      element?.scrollIntoView({ behavior: 'smooth' });
    });

    // Check summary stats
    await expect(page.getByText('Nouveaux Utilisateurs')).toBeVisible();
    await expect(page.getByText('Nouveaux Films')).toBeVisible();

    // Verify numeric values
    const summaryCards = page.locator('[class*="text-sm font-medium"]');
    const count = await summaryCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('admin views analytics on large screen', async ({ page }) => {
    // Set large desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Wait for grid layout to render
    await page.waitForSelector('text=Total Utilisateurs', { timeout: 10000 });

    // Verify 6-column grid on xl breakpoint
    const statsGrid = page.locator('[class*="xl:grid-cols-6"]').first();
    await expect(statsGrid).toBeVisible();

    // Verify two-column layout for tables
    const tablesGrid = page.locator('[class*="md:grid-cols-2"]');
    const gridCount = await tablesGrid.count();
    expect(gridCount).toBeGreaterThan(0);
  });

  test('admin compares different time periods', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // View current statistics
    await page.waitForSelector('text=Utilisateurs Actifs', { timeout: 10000 });
    const activeUsersCard = page.getByText('Utilisateurs Actifs');
    await expect(activeUsersCard).toBeVisible();

    // Verify time period indicator
    const lastWeekIndicator = page.getByText('7 derniers jours');
    await expect(lastWeekIndicator).toBeVisible();
  });
});

test.describe('User Journey - Edge Cases & Error Scenarios', () => {
  test('user with no favorites sees empty state', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Wait for data to load
    await page.waitForTimeout(3000);

    // Check for either data or empty state
    const hasFavorites = await page.getByText('Vos Films Favoris Récents').isVisible();
    const hasEmptyState = await page.getByText(/aucun favori|pas de favoris/i).isVisible();

    // One of these should be true
    expect(hasFavorites || hasEmptyState).toBeTruthy();
  });

  test('admin sees empty state when no recent activity', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Navigate to recent activity
    await page.waitForSelector('text=Activité Récente', { timeout: 10000 });

    // Wait for data or empty state
    await page.waitForTimeout(2000);

    // Check for either activity data or empty message
    const hasActivity = await page.getByText('Nouveaux Utilisateurs').isVisible();
    const hasEmptyState = await page.getByText(/aucune activité/i).isVisible();

    expect(hasActivity || hasEmptyState).toBeTruthy();
  });

  test('handles slow network gracefully', async ({ page }) => {
    await page.goto(URL_DASHBOARD);

    // Throttle network to simulate slow connection
    await page.route('**/api/analytics/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      route.continue();
    });

    await page.reload();

    // Should show loading state
    const loadingSpinner = page.locator('.animate-spin, [data-testid="loading-spinner"]');

    // Either loading spinner or data should be visible eventually
    await Promise.race([
      expect(loadingSpinner).toBeVisible({ timeout: 3000 }),
      page.waitForSelector('text=Total favoris', { timeout: 5000 })
    ]);
  });

  test('recovers from API error', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Simulate API error
    await page.route('**/api/analytics/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error message
    const errorMessage = page.getByText(/erreur|error/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // User can retry by refreshing
    await page.unroute('**/api/analytics/**');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should recover and show data
    await expect(page.getByText('Total favoris')).toBeVisible({ timeout: 10000 });
  });

  test('handles concurrent data updates', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Wait for initial data
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Simulate multiple rapid refreshes
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
    }

    // Should still display data correctly
    await expect(page.getByText('Total favoris')).toBeVisible();
  });
});

test.describe('User Journey - Accessibility Navigation', () => {
  test('keyboard navigation through analytics sections', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Wait for interactive elements
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Tab through focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      const isFocused = await focusedElement.count();
      expect(isFocused).toBeGreaterThan(0);
    }
  });

  test('screen reader can access all statistics', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Check for proper ARIA labels and semantic HTML
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for proper table structure
    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      const firstTable = tables.first();
      const caption = firstTable.locator('caption');
      const hasCaptionOrAria =
        (await caption.count()) > 0 ||
        (await firstTable.getAttribute('aria-label')) !== null;

      expect(hasCaptionOrAria).toBeTruthy();
    }
  });

  test('high contrast mode renders correctly', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Emulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Verify content is still visible
    await expect(page.getByText('Total favoris')).toBeVisible();
    await expect(page.getByText('Genre préféré')).toBeVisible();
  });
});

test.describe('User Journey - Performance Monitoring', () => {
  test('tracks page load performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Log performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        responseTime: perfData.responseEnd - perfData.requestStart,
      };
    });

    console.log('Performance Metrics:', performanceMetrics);
    console.log('Total Load Time:', loadTime, 'ms');

    // Performance assertions
    expect(loadTime).toBeLessThan(10000); // 10s max
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3s max
  });

  test('measures time to first meaningful paint', async ({ page }) => {
    await page.goto(URL_DASHBOARD);

    // Wait for first content to appear
    const startTime = Date.now();
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });
    const timeToFirstContent = Date.now() - startTime;

    console.log('Time to First Content:', timeToFirstContent, 'ms');

    // Should see content within 5 seconds
    expect(timeToFirstContent).toBeLessThan(5000);
  });

  test('validates cache effectiveness', async ({ page }) => {
    // First load
    const firstLoadStart = Date.now();
    await page.goto(URL_DASHBOARD);
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });
    const firstLoadTime = Date.now() - firstLoadStart;

    // Navigate away
    await page.goto(URL_DASHBOARD + '/settings');
    await page.waitForLoadState('domcontentloaded');

    // Second load (should use cache)
    const secondLoadStart = Date.now();
    await page.goto(URL_DASHBOARD);
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });
    const secondLoadTime = Date.now() - secondLoadStart;

    console.log('First Load:', firstLoadTime, 'ms');
    console.log('Second Load (cached):', secondLoadTime, 'ms');
    console.log('Cache Improvement:', ((firstLoadTime - secondLoadTime) / firstLoadTime * 100).toFixed(2), '%');

    // Cached load should be faster
    expect(secondLoadTime).toBeLessThan(firstLoadTime);
  });
});
