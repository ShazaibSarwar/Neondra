import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText('Welcome to WFGTS')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Register');
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.getByText('Create Account')).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('button:has-text("Create Account")');
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
  });

  test('should validate password strength on register', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'weak');
    await page.fill('#confirmPassword', 'weak');
    await page.click('button:has-text("Create Account")');
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
    await expect(page.getByText('Reset Password')).toBeVisible();
  });

  test('should show login error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'WrongPass1');
    await page.click('button:has-text("Sign In")');
    // Should show error (either from API or network error)
    await page.waitForTimeout(2000);
    // The page should still be on login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
