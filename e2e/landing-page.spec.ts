import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle('Nūberu Bāgu');
  });

  test('should display google login button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loginButton = page.getByRole('button', { name: /connexion/i });
    await expect(loginButton).toBeVisible();
  });

  test('should navigate to privacy policy page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const policyLink = page.getByRole('link', {
      name: /politique de confidentialité/i,
    });
    await expect(policyLink).toBeVisible();

    await Promise.all([
      page.waitForURL('**/regles-de-confidentialite'),
      policyLink.click(),
    ]);

    await expect(page).toHaveURL(new RegExp('regles-de-confidentialite$'));
  });

  test('should navigate to legal mentions page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const legalLink = page.getByRole('link', {
      name: /mentions légales/i,
    });
    await expect(legalLink).toBeVisible();

    await Promise.all([
      page.waitForURL('**/mentions-legales'),
      legalLink.click(),
    ]);

    await expect(page).toHaveURL(new RegExp('mentions-legales$'));
  });
});
