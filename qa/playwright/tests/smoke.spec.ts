import { test, expect } from '@playwright/test';

test('App page loads (placeholder)', async ({ page }) => {
  // If the frontend isn't running yet, this may fail—it's okay for now.
  await page.goto('/');
  await expect(page).toHaveTitle(/VetCare/i); // change once real title is known
});
