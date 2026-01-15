/**
 * E2E tests for evaluating projects (User Story 1 - MVP)
 * Following TDD: Write tests FIRST
 */

import { test, expect } from '@playwright/test';

test.describe('Project Evaluation (US1 - MVP)', () => {
  test('should display repository input form on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Open Source Project Health Analyzer');
    await expect(page.locator('#repo-url')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate GitHub URL format', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#repo-url');
    await input.fill('invalid-url');

    // HTML5 validation should trigger
    const isValid = await input.evaluate((el) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should show loading state when analyzing', async ({ page }) => {
    await page.goto('/');

    await page.locator('#repo-url').fill('https://github.com/facebook/react');
    await page.locator('button[type="submit"]').click();

    // Should show loading indicator
    await expect(page.locator('#loading')).toBeVisible();
    expect(await page.locator('#loading').getAttribute('aria-busy')).toBe('true');
  });

  test.skip('should display baseline metrics after successful analysis', async ({ page }) => {
    // This will be implemented once API integration is complete
    await page.goto('/');

    await page.locator('#repo-url').fill('https://github.com/facebook/react');
    await page.locator('button[type="submit"]').click();

    // Wait for results
    await expect(page.locator('#results-container')).toBeVisible({ timeout: 10000 });

    // Should display all 18 baseline metrics
    const metrics = page.locator('.metric-card');
    await expect(metrics).toHaveCount(18);
  });

  test.skip('should show error message for invalid repository', async ({ page }) => {
    // This will be implemented once API integration is complete
    await page.goto('/');

    await page.locator('#repo-url').fill('https://github.com/invalid/repository-that-does-not-exist');
    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(page.locator('#results-container')).toContainText('Error');
  });
});
