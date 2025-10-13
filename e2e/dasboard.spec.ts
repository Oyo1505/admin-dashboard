import { URL_DASHBOARD } from '@/shared/route';
import { expect, test } from '@playwright/test';

test.describe('Dasboard Page', () => {
  test('has title', async ({ page }) => {
    await page.goto(URL_DASHBOARD);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle('Nūberu Bāgu');
  });
});
