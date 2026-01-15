/**
 * Unit tests for MetricInfoModal Web Component
 * Following TDD: Write tests FIRST
 */

/* global MouseEvent, KeyboardEvent */

import { describe, it, expect, beforeEach } from 'vitest';
import { Metric } from '../../src/models/Metric.js';
import '../../src/components/MetricInfoModal.js';

describe('MetricInfoModal Component', () => {
  let container;
  let modal;
  let testMetric;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    modal = document.createElement('metric-info-modal');
    container.appendChild(modal);

    testMetric = new Metric({
      id: 'commit-frequency',
      name: 'Commit Frequency',
      category: 'activity',
      value: 12.5,
      score: 85,
      grade: 'Good',
      explanation: 'Average commits per week over the last 90 days',
      whyItMatters: 'High commit frequency indicates active development and regular maintenance',
      threshold: {
        excellent: { min: 20, label: 'Excellent (≥20/week)' },
        good: { min: 5, max: 20, label: 'Good (5-20/week)' },
        fair: { min: 1, max: 5, label: 'Fair (1-5/week)' },
        poor: { max: 1, label: 'Poor (<1/week)' },
      },
      dataSource: 'GitHub API: /repos/{owner}/{repo}/commits',
      calculatedAt: new Date(),
      confidence: 'high',
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Component Registration', () => {
    it('should be registered as custom element', () => {
      expect(customElements.get('metric-info-modal')).toBeDefined();
    });

    it('should create instance with shadowDOM', () => {
      expect(modal.shadowRoot).toBeTruthy();
    });
  });

  describe('Open/Close State', () => {
    it('should be closed by default', () => {
      const dialog = modal.shadowRoot.querySelector('dialog');
      expect(dialog.hasAttribute('open')).toBe(false);
    });

    it('should open when open() is called', () => {
      modal.metric = testMetric;
      modal.open();

      const dialog = modal.shadowRoot.querySelector('dialog');
      expect(dialog.hasAttribute('open')).toBe(true);
    });

    it('should close when close() is called', () => {
      modal.metric = testMetric;
      modal.open();
      modal.close();

      const dialog = modal.shadowRoot.querySelector('dialog');
      expect(dialog.hasAttribute('open')).toBe(false);
    });

    it('should close when backdrop is clicked', async () => {
      modal.metric = testMetric;
      modal.open();

      const dialog = modal.shadowRoot.querySelector('dialog');
      const rect = dialog.getBoundingClientRect();

      // Simulate click outside dialog bounds (on backdrop)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left - 10,  // Click outside left edge
        clientY: rect.top - 10,   // Click outside top edge
      });

      dialog.dispatchEvent(clickEvent);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(dialog.hasAttribute('open')).toBe(false);
    });
  });

  describe('Content Rendering', () => {
    beforeEach(() => {
      modal.metric = testMetric;
      modal.open();
    });

    it('should display metric name', () => {
      const title = modal.shadowRoot.querySelector('.modal-title');
      expect(title.textContent).toContain('Commit Frequency');
    });

    it('should display metric explanation', () => {
      const explanation = modal.shadowRoot.querySelector('.metric-explanation');
      expect(explanation.textContent).toContain('Average commits per week');
    });

    it('should display "Why It Matters" section', () => {
      const whyMatters = modal.shadowRoot.querySelector('.why-it-matters');
      expect(whyMatters.textContent).toContain('High commit frequency');
    });

    it('should display data source', () => {
      const dataSource = modal.shadowRoot.querySelector('.data-source');
      expect(dataSource.textContent).toContain('GitHub API');
    });

    it('should display thresholds', () => {
      const thresholds = modal.shadowRoot.querySelectorAll('.threshold-item');
      expect(thresholds.length).toBeGreaterThan(0);
    });

    it('should display threshold labels', () => {
      const content = modal.shadowRoot.textContent;
      expect(content).toContain('Excellent');
      expect(content).toContain('Good');
      expect(content).toContain('Fair');
      expect(content).toContain('Poor');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      modal.metric = testMetric;
      modal.open();
    });

    it('should use native dialog element', () => {
      const dialog = modal.shadowRoot.querySelector('dialog');
      expect(dialog).toBeTruthy();
    });

    it('should have close button with aria-label', () => {
      const closeBtn = modal.shadowRoot.querySelector('.close-button');
      expect(closeBtn.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have proper heading hierarchy', () => {
      const title = modal.shadowRoot.querySelector('h2.modal-title');
      expect(title).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      modal.metric = testMetric;
      modal.open();

      const dialog = modal.shadowRoot.querySelector('dialog');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      dialog.dispatchEvent(escapeEvent);

      expect(dialog.hasAttribute('open')).toBe(false);
    });
  });
});
