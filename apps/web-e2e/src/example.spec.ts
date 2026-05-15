import { test, expect } from '@playwright/test';

test('root redirects to login', async ({ page }) => {
  await page.goto('/');

  // Unauthenticated root should redirect to /login
  await expect(page).toHaveURL(/\/login$/);
});
