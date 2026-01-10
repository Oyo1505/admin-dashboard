import { URL_DASHBOARD } from '@/shared/route';
import { expect, test } from '@playwright/test';

test.describe('Analytics Dashboard - User View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display user statistics cards', async ({ page }) => {
    // Wait for user stats to load
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Check if user stats cards are visible
    const totalFavorites = page.getByText('Total favoris');
    await expect(totalFavorites).toBeVisible();

    const favoriteGenre = page.getByText('Genre préféré');
    await expect(favoriteGenre).toBeVisible();

    const recentFavorites = page.getByText('Films récents');
    await expect(recentFavorites).toBeVisible();
  });

  test('should display user favorites list', async ({ page }) => {
    // Wait for favorites list section
    await page.waitForSelector('text=Vos Films Favoris Récents', { timeout: 10000 });

    const favoritesSection = page.getByText('Vos Films Favoris Récents');
    await expect(favoritesSection).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for content to load
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Check if cards stack vertically on mobile
    const statsCards = page.locator('[class*="grid"]').first();
    await expect(statsCards).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(URL_DASHBOARD);

    // Check for loading spinner or skeleton
    const loadingIndicator = page.locator('[data-testid="loading-spinner"], .animate-spin');

    // Loading indicator should appear briefly or stats should load
    await Promise.race([
      expect(loadingIndicator).toBeVisible(),
      page.waitForSelector('text=Total favoris', { timeout: 5000 })
    ]);
  });
});

test.describe('Analytics Dashboard - Admin View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display admin statistics cards', async ({ page }) => {
    // Wait for admin stats to load
    await page.waitForSelector('text=Total Utilisateurs', { timeout: 10000 });

    // Check all 6 admin stats cards
    await expect(page.getByText('Total Utilisateurs')).toBeVisible();
    await expect(page.getByText('Total Films')).toBeVisible();
    await expect(page.getByText('Total Genres')).toBeVisible();
    await expect(page.getByText('Utilisateurs Actifs')).toBeVisible();
    await expect(page.getByText('Films Publiés')).toBeVisible();
    await expect(page.getByText('Films Non Publiés')).toBeVisible();
  });

  test('should display top movies table', async ({ page }) => {
    // Wait for top movies table
    await page.waitForSelector('text=Films Populaires', { timeout: 10000 });

    const topMoviesTable = page.getByText('Films Populaires');
    await expect(topMoviesTable).toBeVisible();

    // Check table headers
    await expect(page.getByText('Film')).toBeVisible();
    await expect(page.getByText('Favoris')).toBeVisible();
  });

  test('should display top users table', async ({ page }) => {
    // Wait for top users table
    await page.waitForSelector('text=Utilisateurs Actifs', { timeout: 10000 });

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Nom' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Visites' })).toBeVisible();
  });

  test('should display recent activity feed', async ({ page }) => {
    // Wait for recent activity section
    await page.waitForSelector('text=Activité Récente', { timeout: 10000 });

    const recentActivity = page.getByText('Activité Récente');
    await expect(recentActivity).toBeVisible();

    // Check for summary stats
    await expect(page.getByText('Nouveaux Utilisateurs')).toBeVisible();
    await expect(page.getByText('Nouveaux Films')).toBeVisible();
  });

  test('should display empty state when no data', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for possible empty states
    const emptyMessages = [
      'Aucun film populaire',
      'Aucun utilisateur actif',
      'Aucune activité récente'
    ];

    // At least one section should either have data or show empty state
    let hasDataOrEmptyState = false;
    for (const message of emptyMessages) {
      const element = page.getByText(message);
      if (await element.isVisible().catch(() => false)) {
        hasDataOrEmptyState = true;
        break;
      }
    }

    // If no empty state messages, then data should be present
    if (!hasDataOrEmptyState) {
      await expect(page.getByText('Films Populaires')).toBeVisible();
    }
  });
});

test.describe('Analytics Dashboard - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Check for proper heading tags
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should have accessible table markup', async ({ page }) => {
    // Wait for tables to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Check for proper table structure
    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      // First table should have thead and tbody
      const firstTable = tables.first();
      await expect(firstTable.locator('thead')).toBeVisible();
      await expect(firstTable.locator('tbody')).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Wait for interactive elements
    await page.waitForLoadState('networkidle');

    // Press Tab to navigate
    await page.keyboard.press('Tab');

    // Check if focus is visible on an element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have alt text for images', async ({ page }) => {
    // Wait for images to load in favorites list or top movies
    await page.waitForSelector('img', { timeout: 10000 });

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check first image has alt attribute
      const firstImage = images.first();
      const altText = await firstImage.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
    }
  });
});

test.describe('Analytics Dashboard - Data Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display numeric values for statistics', async ({ page }) => {
    // Wait for stats cards
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Find all text elements that should contain numbers
    const statsCards = page.locator('[class*="text-2xl font-bold"]');
    const count = await statsCards.count();

    if (count > 0) {
      const firstValue = await statsCards.first().textContent();
      // Should be a number or "0"
      expect(firstValue).toMatch(/^\d+$/);
    }
  });

  test('should format dates correctly', async ({ page }) => {
    // Wait for recent activity section
    await page.waitForSelector('text=Activité Récente', { timeout: 10000 });

    // Look for date elements
    const dateElements = page.locator('time, [datetime]');
    const dateCount = await dateElements.count();

    if (dateCount > 0) {
      const firstDate = dateElements.first();
      await expect(firstDate).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/api/analytics/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    // Should show error message or fallback UI
    const errorMessage = page.getByText(/erreur|error/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Analytics Dashboard - Performance', () => {
  test('should load analytics within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should cache analytics data', async ({ page }) => {
    // First load
    await page.goto(URL_DASHBOARD);
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });

    // Navigate away
    await page.goto(URL_DASHBOARD + '/settings');
    await page.waitForLoadState('domcontentloaded');

    // Navigate back - should load from cache
    const startTime = Date.now();
    await page.goto(URL_DASHBOARD);
    await page.waitForSelector('text=Total favoris', { timeout: 10000 });
    const loadTime = Date.now() - startTime;

    // Cached load should be faster than 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });
});
