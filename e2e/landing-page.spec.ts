import { URL_BASE } from '@/shared/route';
import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test('has title', async ({ page }) => {
    await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Nūberu Bāgu');
  });

  test('should display google login button', async ({ page }) => {
    await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });

    // Test mode cookie is set by middleware, login button appears immediately
    const loginButton = page.getByRole('button', { name: /connexion/i });
    await expect(loginButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to privacy policy page', async ({ page }) => {
    await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });

    const policyLink = page.getByRole('link', {
      name: /politique de confidentialité/i,
    });
    await expect(policyLink).toBeVisible({ timeout: 5000 });

    await policyLink.click();
    await page.waitForURL('**/regles-de-confidentialite', {
      timeout: 10000,
    });

    await expect(page).toHaveURL(new RegExp('regles-de-confidentialite$'));
  });

  test('should navigate to legal mentions page', async ({ page }) => {
    await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });

    const legalLink = page.getByRole('link', {
      name: /mentions légales/i,
    });
    await expect(legalLink).toBeVisible({ timeout: 5000 });

    await legalLink.click();
    await page.waitForURL('**/mentions-legales', { timeout: 10000 });

    await expect(page).toHaveURL(new RegExp('mentions-legales$'));
  });
});
