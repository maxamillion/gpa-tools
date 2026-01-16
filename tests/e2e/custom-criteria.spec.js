import { test, expect } from '@playwright/test';

test.describe('Custom Criteria Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should add custom criterion', async ({ page }) => {
    await page.goto('/');

    // Find and click the "Add Custom Criterion" button
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    // Fill out the form
    await page.fill('input[name="name"]', 'Uses TypeScript');
    await page.fill('textarea[name="description"]', 'Project is written in TypeScript');
    await page.selectOption('select[name="type"]', 'technology');
    await page.selectOption('select[name="evaluationType"]', 'automatic');
    await page.fill('input[name="evaluationLogic"]', 'check for typescript in dependencies');

    // Submit the form
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Verify the criterion appears in the list
    await expect(page.locator('.criterion-item')).toHaveCount(1);
    await expect(page.locator('.criterion-name')).toContainText('Uses TypeScript');
    await expect(page.locator('.criterion-description')).toContainText('Project is written in TypeScript');
    await expect(page.locator('.criterion-type')).toContainText('technology');
  });

  test('should persist custom criteria across page reloads', async ({ page }) => {
    await page.goto('/');

    // Add a criterion
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    await page.fill('input[name="name"]', 'Has Docker');
    await page.fill('textarea[name="description"]', 'Project has Docker support');
    await page.selectOption('select[name="type"]', 'capability');
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Verify criterion is visible
    await expect(page.locator('.criterion-item')).toHaveCount(1);

    // Reload the page
    await page.reload();

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify criterion still exists
    await expect(page.locator('.criterion-item')).toHaveCount(1);
    await expect(page.locator('.criterion-name')).toContainText('Has Docker');
  });

  test('should edit existing custom criterion', async ({ page }) => {
    await page.goto('/');

    // Add a criterion
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    await page.fill('input[name="name"]', 'Original Name');
    await page.fill('textarea[name="description"]', 'Original description');
    await page.selectOption('select[name="type"]', 'technology');
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Click edit button
    await page.click('button.edit-criterion-button');

    // Update the criterion
    await page.fill('input[name="name"]', 'Updated Name');
    await page.fill('textarea[name="description"]', 'Updated description');
    await page.click('button[type="submit"]:has-text("Update Criterion")');

    // Verify changes
    await expect(page.locator('.criterion-name')).toContainText('Updated Name');
    await expect(page.locator('.criterion-description')).toContainText('Updated description');
  });

  test('should delete custom criterion', async ({ page }) => {
    await page.goto('/');

    // Add a criterion
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    await page.fill('input[name="name"]', 'To Be Deleted');
    await page.fill('textarea[name="description"]', 'This will be deleted');
    await page.selectOption('select[name="type"]', 'technology');
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Verify criterion exists
    await expect(page.locator('.criterion-item')).toHaveCount(1);

    // Set up dialog handler to accept the confirmation
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await page.click('button.delete-criterion-button');

    // Verify criterion is deleted
    await expect(page.locator('.criterion-item')).toHaveCount(0);
    await expect(page.locator('.no-criteria-message')).toBeVisible();
  });

  test('should add multiple custom criteria', async ({ page }) => {
    await page.goto('/');

    // Add first criterion
    let addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    await page.fill('input[name="name"]', 'First Criterion');
    await page.fill('textarea[name="description"]', 'First description');
    await page.selectOption('select[name="type"]', 'technology');
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Add second criterion
    addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.click();

    await page.fill('input[name="name"]', 'Second Criterion');
    await page.fill('textarea[name="description"]', 'Second description');
    await page.selectOption('select[name="type"]', 'capability');
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Verify both criteria exist
    await expect(page.locator('.criterion-item')).toHaveCount(2);
  });

  test('should show validation error for empty required fields', async ({ page }) => {
    await page.goto('/');

    // Click add button
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Add Criterion")');

    // Verify error message appears
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('required');
  });

  test('should cancel form without adding criterion', async ({ page }) => {
    await page.goto('/');

    // Click add button
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();

    // Fill some fields
    await page.fill('input[name="name"]', 'Will Not Be Added');
    await page.fill('textarea[name="description"]', 'This will be cancelled');

    // Click cancel
    await page.click('button.cancel-button');

    // Verify form is hidden and no criterion was added
    await expect(page.locator('.criterion-form')).not.toBeVisible();
    await expect(page.locator('.criterion-item')).toHaveCount(0);
    await expect(page.locator('.no-criteria-message')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab to the add button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs depending on page structure

    // Find the add button
    const addButton = page.locator('button:has-text("Add Custom Criterion")');
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.focus();
    await page.keyboard.press('Enter');

    // Verify form appears
    await expect(page.locator('.criterion-form')).toBeVisible();

    // Navigate through form fields with Tab
    await page.keyboard.press('Tab'); // to name field
    await page.keyboard.type('Keyboard Test');

    await page.keyboard.press('Tab'); // to description field
    await page.keyboard.type('Testing keyboard navigation');
  });
});
