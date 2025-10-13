import { URL_MOVIES } from '@/shared/route';
import { expect, test } from '@playwright/test';

test.describe('Movies Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to movies page before each test
    await page.goto(URL_MOVIES);
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle('Nūberu Bāgu');
  });

  test('has Input Search', async ({ page }) => {
    // Wait for the input to be visible with a longer timeout
    const inputSearch = page.getByTestId('input-search');
    await expect(inputSearch).toBeVisible({ timeout: 10000 });

    // Also check by placeholder text
    const inputPlaceholder = page.getByPlaceholder(
      'Rechercher des films ou réalisateurs...'
    );
    await expect(inputPlaceholder).toBeVisible();
  });

  test('search input is interactive', async ({ page }) => {
    const inputSearch = page.getByTestId('input-search');
    await expect(inputSearch).toBeVisible({ timeout: 10000 });

    // Type in the search input
    await inputSearch.fill('Inception');
    await expect(inputSearch).toHaveValue('Inception');

    // Clear the input
    await inputSearch.clear();
    await expect(inputSearch).toHaveValue('');
  });
});
