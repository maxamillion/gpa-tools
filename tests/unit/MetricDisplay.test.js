/**
 * Unit tests for MetricDisplay Web Component
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Metric } from '../../src/models/Metric.js';
import '../../src/components/MetricDisplay.js';

describe('MetricDisplay Component', () => {
  let container;
  let metricDisplay;
  let testMetric;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    metricDisplay = document.createElement('metric-display');
    container.appendChild(metricDisplay);

    testMetric = new Metric({
      id: 'commit-frequency',
      name: 'Commit Frequency',
      category: 'activity',
      value: 12.5,
      score: 85,
      grade: 'Good',
      explanation: 'Average commits per week over the last 90 days',
      whyItMatters: 'High commit frequency indicates active development',
      threshold: { excellent: { min: 20 }, good: { min: 5, max: 20 } },
      dataSource: 'GitHub API',
      calculatedAt: new Date(),
      confidence: 'high',
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Component Registration', () => {
    it('should be registered as custom element', () => {
      expect(customElements.get('metric-display')).toBeDefined();
    });

    it('should create instance with shadowDOM', () => {
      expect(metricDisplay.shadowRoot).toBeTruthy();
    });
  });

  describe('Metric Property', () => {
    it('should accept metric property', () => {
      metricDisplay.metric = testMetric;
      expect(metricDisplay.metric).toBe(testMetric);
    });

    it('should trigger render when metric is set', async () => {
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for render

      const nameElement = metricDisplay.shadowRoot.querySelector('.metric-name');
      expect(nameElement.textContent).toBe('Commit Frequency');
    });

    it('should handle null metric gracefully', () => {
      metricDisplay.metric = null;
      const nameElement = metricDisplay.shadowRoot.querySelector('.metric-name');
      expect(nameElement).toBeNull();
    });
  });

  describe('Rendering', () => {
    beforeEach(async () => {
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should display metric name', () => {
      const nameElement = metricDisplay.shadowRoot.querySelector('.metric-name');
      expect(nameElement.textContent).toBe('Commit Frequency');
    });

    it('should display metric value', () => {
      const valueElement = metricDisplay.shadowRoot.querySelector('.metric-value');
      expect(valueElement.textContent).toContain('12.5');
    });

    it('should display metric score', () => {
      const scoreElement = metricDisplay.shadowRoot.querySelector('.metric-score');
      expect(scoreElement.textContent).toContain('85');
    });

    it('should display metric grade', () => {
      const gradeElement = metricDisplay.shadowRoot.querySelector('.metric-grade');
      expect(gradeElement.textContent).toBe('Good');
    });

    it('should display metric explanation', () => {
      const explanationElement = metricDisplay.shadowRoot.querySelector('.metric-explanation');
      expect(explanationElement.textContent).toBe('Average commits per week over the last 90 days');
    });

    it('should apply grade-specific CSS class', () => {
      const card = metricDisplay.shadowRoot.querySelector('.metric-card');
      expect(card.classList.contains('grade-good')).toBe(true);
    });
  });

  describe('Grade Styling', () => {
    it('should apply correct class for A+ grade', async () => {
      testMetric.grade = 'A+';
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));

      const card = metricDisplay.shadowRoot.querySelector('.metric-card');
      expect(card.classList.contains('grade-a-plus')).toBe(true);
    });

    it('should apply correct class for Excellent grade', async () => {
      testMetric.grade = 'Excellent';
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));

      const card = metricDisplay.shadowRoot.querySelector('.metric-card');
      expect(card.classList.contains('grade-excellent')).toBe(true);
    });

    it('should apply correct class for Poor grade', async () => {
      testMetric.grade = 'Poor';
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));

      const card = metricDisplay.shadowRoot.querySelector('.metric-card');
      expect(card.classList.contains('grade-poor')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should have ARIA role', () => {
      const card = metricDisplay.shadowRoot.querySelector('.metric-card');
      expect(card.getAttribute('role')).toBe('article');
    });

    it('should have ARIA label with metric name', () => {
      const card = metricDisplay.shadowRoot.querySelector('.metric-card');
      expect(card.getAttribute('aria-label')).toContain('Commit Frequency');
    });

    it('should have semantic heading for metric name', () => {
      const nameElement = metricDisplay.shadowRoot.querySelector('h3.metric-name');
      expect(nameElement).toBeTruthy();
    });
  });

  describe('Confidence Indicators', () => {
    it('should show high confidence indicator', async () => {
      testMetric.confidence = 'high';
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));

      const confidenceElement = metricDisplay.shadowRoot.querySelector('.confidence-indicator');
      expect(confidenceElement.textContent).toContain('High');
    });

    it('should show medium confidence indicator', async () => {
      testMetric.confidence = 'medium';
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));

      const confidenceElement = metricDisplay.shadowRoot.querySelector('.confidence-indicator');
      expect(confidenceElement.textContent).toContain('Medium');
    });

    it('should show low confidence indicator', async () => {
      testMetric.confidence = 'low';
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));

      const confidenceElement = metricDisplay.shadowRoot.querySelector('.confidence-indicator');
      expect(confidenceElement.textContent).toContain('Low');
    });
  });

  describe('Metric Information Modal', () => {
    beforeEach(async () => {
      metricDisplay.metric = testMetric;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should have info button', () => {
      const infoButton = metricDisplay.shadowRoot.querySelector('.info-button');
      expect(infoButton).toBeTruthy();
    });

    it('should have aria-label on info button', () => {
      const infoButton = metricDisplay.shadowRoot.querySelector('.info-button');
      expect(infoButton.getAttribute('aria-label')).toContain('information');
    });

    it('should contain metric-info-modal element', () => {
      const modal = metricDisplay.shadowRoot.querySelector('metric-info-modal');
      expect(modal).toBeTruthy();
    });

    it('should pass metric data to modal', () => {
      const modal = metricDisplay.shadowRoot.querySelector('metric-info-modal');
      expect(modal.metric).toBe(testMetric);
    });

    it('should open modal when info button clicked', async () => {
      const infoButton = metricDisplay.shadowRoot.querySelector('.info-button');
      const modal = metricDisplay.shadowRoot.querySelector('metric-info-modal');

      const openSpy = vi.spyOn(modal, 'open');
      infoButton.click();

      expect(openSpy).toHaveBeenCalled();
    });
  });
});
