import { URL_HOME } from '@/shared/route';
import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('has title', async ({ page }) => {
    await page.goto(URL_HOME);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle('Nūberu Bāgu');
  });
});
