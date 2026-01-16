import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../../../src/components/CustomCriteriaForm.js';

describe('CustomCriteriaForm Component', () => {
  let container;
  let form;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    form = document.createElement('custom-criteria-form');
    container.appendChild(form);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render with empty state', () => {
    expect(form.querySelector('.criteria-list')).toBeTruthy();
    expect(form.querySelector('.add-criterion-button')).toBeTruthy();
    expect(form.querySelector('.no-criteria-message')).toBeTruthy();
  });

  it('should show add criterion form when button clicked', async () => {
    const addButton = form.querySelector('.add-criterion-button');
    addButton.click();

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(form.querySelector('.criterion-form')).toBeTruthy();
    expect(form.querySelector('input[name="name"]')).toBeTruthy();
    expect(form.querySelector('textarea[name="description"]')).toBeTruthy();
    expect(form.querySelector('select[name="type"]')).toBeTruthy();
  });

  it('should add new criterion when form submitted', async () => {
    // Show form
    const addButton = form.querySelector('.add-criterion-button');
    addButton.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    // Fill form
    const nameInput = form.querySelector('input[name="name"]');
    const descInput = form.querySelector('textarea[name="description"]');
    const typeSelect = form.querySelector('select[name="type"]');

    nameInput.value = 'Uses TypeScript';
    descInput.value = 'Project is written in TypeScript';
    typeSelect.value = 'technology';

    // Set up event listener
    const criterionAddedHandler = vi.fn();
    form.addEventListener('criterion-added', criterionAddedHandler);

    // Submit form
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.click();

    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify event dispatched
    expect(criterionAddedHandler).toHaveBeenCalled();
    const eventData = criterionAddedHandler.mock.calls[0][0].detail;
    expect(eventData.criterion).toMatchObject({
      name: 'Uses TypeScript',
      description: 'Project is written in TypeScript',
      type: 'technology'
    });
  });

  it('should display list of criteria', async () => {
    const criteria = [
      {
        id: 'criterion-1',
        name: 'Uses TypeScript',
        description: 'Project uses TypeScript',
        type: 'technology',
        result: 'pass',
        resultValue: true,
        confidence: 'definite'
      },
      {
        id: 'criterion-2',
        name: 'Has Docker',
        description: 'Project has Docker support',
        type: 'capability',
        result: 'fail',
        resultValue: false,
        confidence: 'definite'
      }
    ];

    form.criteria = criteria;
    await new Promise(resolve => setTimeout(resolve, 10));

    const criteriaItems = form.querySelectorAll('.criterion-item');
    expect(criteriaItems.length).toBe(2);

    expect(criteriaItems[0].textContent).toContain('Uses TypeScript');
    expect(criteriaItems[0].querySelector('.result-badge').textContent).toContain('Pass');

    expect(criteriaItems[1].textContent).toContain('Has Docker');
    expect(criteriaItems[1].querySelector('.result-badge').textContent).toContain('Fail');
  });

  it('should delete criterion when delete button clicked', async () => {
    const criteria = [
      {
        id: 'criterion-1',
        name: 'Uses TypeScript',
        type: 'technology'
      }
    ];

    form.criteria = criteria;
    await new Promise(resolve => setTimeout(resolve, 10));

    // Set up event listener
    const criterionDeletedHandler = vi.fn();
    form.addEventListener('criterion-deleted', criterionDeletedHandler);

    // Click delete button
    const deleteButton = form.querySelector('.delete-criterion-button');
    deleteButton.click();

    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify event dispatched
    expect(criterionDeletedHandler).toHaveBeenCalled();
    const eventData = criterionDeletedHandler.mock.calls[0][0].detail;
    expect(eventData.criterionId).toBe('criterion-1');
  });

  it('should edit criterion when edit button clicked', async () => {
    const criteria = [
      {
        id: 'criterion-1',
        name: 'Uses TypeScript',
        description: 'Project uses TypeScript',
        type: 'technology'
      }
    ];

    form.criteria = criteria;
    await new Promise(resolve => setTimeout(resolve, 10));

    // Click edit button
    const editButton = form.querySelector('.edit-criterion-button');
    editButton.click();

    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify form populated with existing values
    const nameInput = form.querySelector('input[name="name"]');
    const descInput = form.querySelector('textarea[name="description"]');
    const typeSelect = form.querySelector('select[name="type"]');

    expect(nameInput.value).toBe('Uses TypeScript');
    expect(descInput.value).toBe('Project uses TypeScript');
    expect(typeSelect.value).toBe('technology');
  });

  it('should validate required fields', async () => {
    // Show form
    const addButton = form.querySelector('.add-criterion-button');
    addButton.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    // Try to submit empty form
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.click();

    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify validation error displayed
    const errorMessage = form.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('required');
  });

  it('should be accessible with ARIA labels', () => {
    expect(form.getAttribute('role')).toBe('region');
    expect(form.getAttribute('aria-label')).toBeTruthy();

    const addButton = form.querySelector('.add-criterion-button');
    expect(addButton.getAttribute('aria-label')).toBeTruthy();
  });

  it('should support keyboard navigation', async () => {
    // Show form
    const addButton = form.querySelector('.add-criterion-button');
    addButton.focus();

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    addButton.dispatchEvent(enterEvent);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(form.querySelector('.criterion-form')).toBeTruthy();
  });
});
