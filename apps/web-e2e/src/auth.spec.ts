import { expect, test } from '@playwright/test';

test('register → dashboard → logout → re-redirect to /login', async ({ page }) => {
  // 1. Anonymous → redirected to /login
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);

  // 2. Go to register
  await page.getByRole('link', { name: /create one/i }).click();
  await expect(page).toHaveURL(/\/register$/);

  // 3. Fill the register form
  const email = `e2e-${Date.now()}@example.com`;
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel('Full name (optional)').fill('E2E Tester');
  await page.getByRole('button', { name: /create account/i }).click();

  // 4. Land on dashboard, email visible
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
  await expect(page.getByTestId('current-user-email')).toHaveText(email);

  // 5. Logout
  await page.getByTestId('logout-button').click();
  await expect(page).toHaveURL(/\/login$/);

  // 6. Re-visit dashboard → bounced back to login
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});
