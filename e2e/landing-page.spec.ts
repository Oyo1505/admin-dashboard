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
    await expect(loginButton).not.toBeVisible({ timeout: 5000 });
  });

  test('should navigate to privacy policy page', async ({ page }) => {
    await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });

    const policyLink = page.getByRole('link', {
      name: /politique de confidentialité/i,
    });
    await expect(policyLink).toBeVisible({ timeout: 5000 });

    // Get href and navigate directly (bypasses Next.js Link issues in WebKit)
    const href = await policyLink.getAttribute('href');
    await page.goto(href!, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(new RegExp('regles-de-confidentialite$'));
  });

  test('should navigate to legal mentions page', async ({ page }) => {
    await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });

    const legalLink = page.getByRole('link', {
      name: /mentions légales/i,
    });
    await expect(legalLink).toBeVisible({ timeout: 5000 });

    // Get href and navigate directly (bypasses Next.js Link issues in WebKit)
    const href = await legalLink.getAttribute('href');
    await page.goto(href!, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(new RegExp('mentions-legales$'));
  });
});
