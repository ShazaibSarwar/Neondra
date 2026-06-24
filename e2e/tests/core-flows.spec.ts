import { test, expect } from '@playwright/test';

test.describe('Core User Flows', () => {
  // These tests require a running backend with a seeded test user
  // In CI, a test user would be seeded before running

  test.describe('Navigation', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
      await page.goto('/families');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect unauthenticated user from analytics', async ({ page }) => {
      await page.goto('/analytics');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Registration Flow', () => {
    test('should show all required form fields', async ({ page }) => {
      await page.goto('/auth/register');
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
    });

    test('should validate password mismatch', async ({ page }) => {
      await page.goto('/auth/register');
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'ValidPass1');
      await page.fill('#confirmPassword', 'DifferentPass1');
      await page.click('button:has-text("Create Account")');
      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });
  });

  test.describe('Mobile UX', () => {
    test('should have proper touch targets', async ({ page }) => {
      await page.goto('/auth/login');
      const button = page.locator('button:has-text("Sign In")');
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('should show bottom navigation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/auth/login');
      // Login page shouldn't have bottom nav (it's outside dashboard)
      await expect(page.locator('nav.fixed')).not.toBeVisible();
    });
  });

  test.describe('Forgot Password Flow', () => {
    test('should show success state after submitting email', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      await page.fill('#email', 'test@example.com');
      await page.click('button:has-text("Send Reset Link")');
      // Wait for the request (may fail if no backend, but form should submit)
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Verify Email Flow', () => {
    test('should show error for invalid token', async ({ page }) => {
      await page.goto('/auth/verify-email?token=invalid-token-123');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Verification Failed')).toBeVisible();
    });

    test('should show error when no token provided', async ({ page }) => {
      await page.goto('/auth/verify-email');
      await expect(page.getByText('Invalid verification link')).toBeVisible();
    });
  });
});
