import { URL_DASHBOARD } from '@/shared/route';
import { expect, test } from '@playwright/test';
const BASE_URL =
  process.env.NEXTAUTH_URL || 'http://localhost:3000' + URL_DASHBOARD;

test.describe('Dasboard Page', () => {
  test('has title', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle('Nūberu Bāgu');
  });
});
