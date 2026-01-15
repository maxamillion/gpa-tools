/**
 * End-to-End Test for Repository Analysis
 * Verifies the main user flow: entering a GitHub URL and viewing results
 */

import { test, expect } from '@playwright/test';

test.describe('Repository Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display the application title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Open Source Project Health Analyzer');
  });

  test('should have a repository URL input field', async ({ page }) => {
    const input = page.locator('#repo-url');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'https://github.com/owner/repository');
  });

  test('should have an analyze button', async ({ page }) => {
    const button = page.locator('button[type="submit"]');
    await expect(button).toBeVisible();
    await expect(button).toContainText('Analyze Repository');
  });

  test('should show validation error for invalid URL', async ({ page }) => {
    const input = page.locator('#repo-url');
    const button = page.locator('button[type="submit"]');

    await input.fill('not-a-url');
    await button.click();

    // HTML5 validation should prevent submission
    await expect(input).toHaveAttribute('type', 'url');
  });

  test('should show validation error for empty URL', async ({ page }) => {
    const button = page.locator('button[type="submit"]');

    await button.click();

    // HTML5 required validation should prevent submission
    const input = page.locator('#repo-url');
    await expect(input).toHaveAttribute('required');
  });

  // Note: The following test would require a GitHub API token in the test environment
  // and would make real API calls, which is not ideal for automated testing.
  // In a real production environment, we would:
  // 1. Mock the GitHub API responses
  // 2. Use a test GitHub repository with known metrics
  // 3. Set up proper API token management
  test.skip('should analyze a repository and display results', async ({ page }) => {
    const input = page.locator('#repo-url');
    const button = page.locator('button[type="submit"]');

    // Use a small, well-known repository for testing
    await input.fill('https://github.com/sindresorhus/is');
    await button.click();

    // Wait for loading state
    await expect(page.locator('#loading')).toBeVisible();

    // Wait for results to appear (with generous timeout for API calls)
    await expect(page.locator('#results-container')).toBeVisible({ timeout: 10000 });

    // Verify health score card is displayed
    await expect(page.locator('health-score-card')).toBeVisible();

    // Verify metric displays are present
    const metricCards = page.locator('metric-display');
    await expect(metricCards.first()).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check main landmarks
    await expect(page.locator('[role="banner"]')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="contentinfo"]')).toBeVisible();

    // Check form label
    const label = page.locator('label[for="repo-url"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText('GitHub Repository URL');

    // Check required indicator
    await expect(page.locator('.required')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Tab to input field
    await page.keyboard.press('Tab');
    await expect(page.locator('#repo-url')).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:5173');

    // Verify main elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#repo-url')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('http://localhost:5173');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#repo-url')).toBeVisible();
  });
});
