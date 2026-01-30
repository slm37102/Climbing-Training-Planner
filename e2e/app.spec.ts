import { test, expect, Page } from '@playwright/test';

// Helper to bypass auth for testing main app features
// In real tests, you'd mock Firebase or use test accounts
async function mockAuthenticated(page: Page) {
  // Set up localStorage to simulate logged-in state with seed data
  await page.addInitScript(() => {
    // Mock auth state by setting a flag that our app can check
    localStorage.setItem('ctp_test_auth', 'true');
  });
}

test.describe('Dashboard', () => {
  test.skip('shows today\'s scheduled workouts', async ({ page }) => {
    // Skip until auth mocking is set up
    await mockAuthenticated(page);
    await page.goto('/');
    
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByText("Today's Plan")).toBeVisible();
  });
});

test.describe('Planner', () => {
  test.skip('can navigate weeks', async ({ page }) => {
    // Skip until auth mocking is set up
    await mockAuthenticated(page);
    await page.goto('/');
    
    // Navigate to planner
    await page.getByRole('button', { name: /plan/i }).click();
    
    await expect(page.getByText('Weekly Plan')).toBeVisible();
  });
});

test.describe('Session Tracker', () => {
  test.skip('can start a free session', async ({ page }) => {
    // Skip until auth mocking is set up
    await mockAuthenticated(page);
    await page.goto('/');
    
    // Click the center play button
    await page.locator('button:has(svg.lucide-play)').first().click();
    
    await expect(page.getByText(/ready to train|session/i)).toBeVisible();
  });
});
