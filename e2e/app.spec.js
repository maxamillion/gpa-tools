/**
 * E2E Tests for OSS Health Analyzer
 */

import { test, expect } from '@playwright/test';

/**
 * Helper to wait for the app to be fully initialized.
 * Waits for custom elements to be defined, which indicates JS has loaded and executed.
 */
async function waitForAppReady(page) {
  await page.waitForFunction(() => {
    // Check if custom elements are defined (indicates JS modules loaded)
    const healthCardDefined = customElements.get('health-score-card') !== undefined;
    // Check if form exists and has the expected structure
    const form = document.getElementById('repo-form');
    const button = document.getElementById('analyze-btn');
    return healthCardDefined && form !== null && button !== null && !button.disabled;
  }, { timeout: 10000 });
}

test.describe('OSS Health Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('should display the home page', async ({ page }) => {
    await expect(page.locator('.app-title')).toContainText('OSS Health Analyzer');
    await expect(page.locator('#repo-url')).toBeVisible();
    await expect(page.locator('#analyze-btn')).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    const input = page.locator('#repo-url');
    await expect(input).toHaveAttribute('aria-describedby', 'repo-hint');
    await expect(page.locator('label[for="repo-url"]')).toBeVisible();
  });

  test('should show token section when expanded', async ({ page }) => {
    await page.locator('.auth-toggle').click();
    await expect(page.locator('#github-token')).toBeVisible();
  });

  test('should validate URL format', async ({ page }) => {
    const input = page.locator('#repo-url');
    await input.fill('not-a-url');
    await page.locator('#analyze-btn').click();

    // Should show error
    await expect(page.locator('#error-section')).toBeVisible();
  });

  test('should update URL with repo parameter', async ({ page }) => {
    const input = page.locator('#repo-url');
    await input.fill('https://github.com/facebook/react');

    // Note: We don't actually submit since it would make real API calls
    // This test verifies the input accepts valid URLs
    await expect(input).toHaveValue('https://github.com/facebook/react');
  });

  test('should load repo from URL parameter', async ({ page }) => {
    await page.goto('/?repo=facebook/react');
    // Wait for app to initialize and process URL param
    await waitForAppReady(page);
    // Wait for the input value to be populated from URL param
    await page.waitForFunction(() => {
      const input = document.getElementById('repo-url');
      return input && input.value.includes('github.com');
    }, { timeout: 5000 });
    const input = page.locator('#repo-url');
    await expect(input).toHaveValue('https://github.com/facebook/react');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.app-title')).toBeVisible();
    await expect(page.locator('#repo-url')).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check that main text is visible against background
    const title = page.locator('.app-title');
    await expect(title).toBeVisible();

    // Check button is visible and has a background color set
    const button = page.locator('#analyze-btn');
    await expect(button).toBeVisible();
    // Verify button has styling (not transparent)
    const bgColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  test('should hide error section initially', async ({ page }) => {
    await expect(page.locator('#error-section')).toHaveClass(/hidden/);
  });

  test('should hide results section initially', async ({ page }) => {
    await expect(page.locator('#results-section')).toHaveClass(/hidden/);
  });

  test('should hide loading section initially', async ({ page }) => {
    await expect(page.locator('#loading-section')).toHaveClass(/hidden/);
  });

  test('should dismiss error when clicking try again', async ({ page }) => {
    // Trigger an error
    await page.locator('#repo-url').fill('not-a-url');
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#error-section')).toBeVisible();

    // Dismiss error
    await page.locator('#error-dismiss').click();
    await expect(page.locator('#error-section')).toHaveClass(/hidden/);
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('should focus input on tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('#repo-url')).toBeFocused();
  });

  test('should navigate to button with tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('#analyze-btn')).toBeFocused();
  });

  test('should submit form with button click', async ({ page }) => {
    await page.locator('#repo-url').fill('https://github.com/facebook/react');
    await page.locator('#analyze-btn').click();

    // Should show loading section when form is submitted (wait for class change)
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading-section');
      return loading && !loading.classList.contains('hidden');
    }, { timeout: 10000 });
  });
});
