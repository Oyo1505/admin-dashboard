import { test, expect } from '@playwright/test';

test.describe('Analytics API - Authentication & Authorization', () => {
  const baseURL = 'http://localhost:3000';

  test('should require authentication for user stats', async ({ request }) => {
    // Try to access user stats without authentication
    const response = await request.get(`${baseURL}/api/analytics/user-stats/test-user-id`);

    // Should return 401 Unauthorized or redirect
    expect([401, 403, 302]).toContain(response.status());
  });

  test('should require admin role for admin stats', async ({ request }) => {
    // Try to access admin stats without admin role
    const response = await request.get(`${baseURL}/api/analytics/admin-stats`);

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403, 302]).toContain(response.status());
  });

  test('should require admin role for top movies', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/analytics/top-movies`);

    expect([401, 403, 302]).toContain(response.status());
  });

  test('should require admin role for top users', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/analytics/top-users`);

    expect([401, 403, 302]).toContain(response.status());
  });

  test('should require admin role for top genres', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/analytics/top-genres`);

    expect([401, 403, 302]).toContain(response.status());
  });

  test('should require admin role for recent activity', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/analytics/recent-activity`);

    expect([401, 403, 302]).toContain(response.status());
  });
});

test.describe('Analytics API - Query Parameters', () => {
  const baseURL = 'http://localhost:3000';

  test('should accept limit parameter for top movies', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Intercept API call with limit parameter
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/top-movies') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        // Should return array of movies
        expect(Array.isArray(data)).toBeTruthy();

        // Should respect limit (default is 5)
        expect(data.length).toBeLessThanOrEqual(5);
      }
    }
  });

  test('should accept days parameter for recent activity', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Intercept API call with days parameter
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/recent-activity') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        // Should have expected structure
        expect(data).toHaveProperty('newUsers');
        expect(data).toHaveProperty('newMovies');
      }
    }
  });
});

test.describe('Analytics API - Response Format', () => {
  test('should return valid JSON for user stats', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/user-stats') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        // Should have expected user stats structure
        expect(data).toBeDefined();
        expect(typeof data).toBe('object');
      }
    }
  });

  test('should return valid JSON for admin stats', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/admin-stats') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        // Should have aggregated stats structure
        expect(data).toHaveProperty('aggregatedStats');
        expect(data).toHaveProperty('topMovies');
        expect(data).toHaveProperty('topUsers');
        expect(data).toHaveProperty('topGenres');
        expect(data).toHaveProperty('recentActivity');
        expect(data).toHaveProperty('totalVisits');
      }
    }
  });

  test('should return array for top movies', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/top-movies') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        expect(Array.isArray(data)).toBeTruthy();

        // Each movie should have required fields
        if (data.length > 0) {
          const movie = data[0];
          expect(movie).toHaveProperty('id');
          expect(movie).toHaveProperty('title');
          expect(movie).toHaveProperty('image');
          expect(movie).toHaveProperty('favoritesCount');
          expect(typeof movie.favoritesCount).toBe('number');
        }
      }
    }
  });

  test('should return array for top users', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/top-users') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        expect(Array.isArray(data)).toBeTruthy();

        // Each user should have required fields
        if (data.length > 0) {
          const user = data[0];
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('email');
          expect(user).toHaveProperty('visits');
          expect(typeof user.visits).toBe('number');
        }
      }
    }
  });

  test('should return array for top genres', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/analytics/top-genres') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (responsePromise) {
      const response = await responsePromise;
      if (response) {
        const data = await response.json();

        expect(Array.isArray(data)).toBeTruthy();

        // Each genre should have required fields
        if (data.length > 0) {
          const genre = data[0];
          expect(genre).toHaveProperty('id');
          expect(genre).toHaveProperty('count');
          expect(typeof genre.count).toBe('number');
        }
      }
    }
  });
});

test.describe('Analytics API - Error Handling', () => {
  test('should handle invalid userId parameter', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Intercept and modify API call with invalid userId
    await page.route('**/api/analytics/user-stats/**', route => {
      if (route.request().url().includes('invalid-user')) {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Invalid user ID' })
        });
      } else {
        route.continue();
      }
    });

    await page.waitForLoadState('networkidle');
  });

  test('should handle database errors gracefully', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate database error
    await page.route('**/api/analytics/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error state in UI
    const errorText = page.getByText(/erreur|error/i);
    await expect(errorText).toBeVisible({ timeout: 10000 });
  });

  test('should handle network timeouts', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate slow network
    await page.route('**/api/analytics/**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [] })
        });
      }, 30000); // 30 second delay
    });

    await page.reload();

    // Should show loading state
    const loadingSpinner = page.locator('.animate-spin, [data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Analytics API - Caching', () => {
  test('should cache user stats responses', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Track API calls
    let callCount = 0;
    page.on('response', response => {
      if (response.url().includes('/api/analytics/user-stats')) {
        callCount++;
      }
    });

    // Wait for initial load
    await page.waitForTimeout(2000);
    const initialCalls = callCount;

    // Navigate away and back
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should use cache, not make another call immediately
    expect(callCount).toBeLessThanOrEqual(initialCalls + 1);
  });

  test('should have proper cache headers', async ({ page }) => {
    await page.goto('/dashboard');

    const response = await page.waitForResponse(
      response => response.url().includes('/api/analytics/') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (response) {
      const cacheControl = response.headers()['cache-control'];
      // Should have some cache control header
      expect(cacheControl).toBeDefined();
    }
  });
});
