import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should see login page
    await expect(page.getByText('Climbing Training Planner')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('can toggle between sign in and sign up', async ({ page }) => {
    await page.goto('/');
    
    // Should start with Sign In
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Click Sign Up link
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should now show Create Account
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder('you@example.com').fill('invalid@test.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.locator('text=/failed|error|invalid/i')).toBeVisible({ timeout: 5000 });
  });
});
