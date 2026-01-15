/**
 * Unit tests for CategorySection Web Component
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Metric } from '../../src/models/Metric.js';
import '../../src/components/CategorySection.js';

describe('CategorySection Component', () => {
  let container;
  let categorySection;
  let testMetrics;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    categorySection = document.createElement('category-section');
    container.appendChild(categorySection);

    testMetrics = [
      new Metric({
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'activity',
        value: 12.5,
        score: 85,
        grade: 'Good',
        explanation: 'Average commits per week over the last 90 days',
        whyItMatters: 'High commit frequency indicates active development',
        threshold: {},
        dataSource: 'GitHub API',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
      new Metric({
        id: 'release-cadence',
        name: 'Release Cadence',
        category: 'activity',
        value: 14,
        score: 90,
        grade: 'Excellent',
        explanation: 'Average days between releases',
        whyItMatters: 'Regular releases show healthy project maintenance',
        threshold: {},
        dataSource: 'GitHub API',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Component Registration', () => {
    it('should be registered as custom element', () => {
      expect(customElements.get('category-section')).toBeDefined();
    });

    it('should create instance with shadowDOM', () => {
      expect(categorySection.shadowRoot).toBeTruthy();
    });
  });

  describe('Category Property', () => {
    it('should accept category property', () => {
      categorySection.category = 'activity';
      expect(categorySection.category).toBe('activity');
    });

    it('should trigger render when category is set', async () => {
      categorySection.category = 'activity';
      categorySection.metrics = testMetrics;
      await new Promise(resolve => setTimeout(resolve, 0));

      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement.textContent).toContain('Activity');
    });
  });

  describe('Metrics Property', () => {
    it('should accept metrics property', () => {
      categorySection.metrics = testMetrics;
      expect(categorySection.metrics).toBe(testMetrics);
    });

    it('should display metric cards', async () => {
      categorySection.category = 'activity';
      categorySection.metrics = testMetrics;
      await new Promise(resolve => setTimeout(resolve, 0));

      const metricCards = categorySection.shadowRoot.querySelectorAll('metric-display');
      expect(metricCards.length).toBe(2);
    });

    it('should handle empty metrics array', async () => {
      categorySection.category = 'activity';
      categorySection.metrics = [];
      await new Promise(resolve => setTimeout(resolve, 0));

      const metricCards = categorySection.shadowRoot.querySelectorAll('metric-display');
      expect(metricCards.length).toBe(0);
    });
  });

  describe('Category Naming', () => {
    it('should display "Activity Metrics" for activity category', async () => {
      categorySection.category = 'activity';
      categorySection.metrics = testMetrics;
      await new Promise(resolve => setTimeout(resolve, 0));

      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement.textContent).toBe('Activity Metrics');
    });

    it('should display "Community Metrics" for community category', async () => {
      categorySection.category = 'community';
      categorySection.metrics = [];
      await new Promise(resolve => setTimeout(resolve, 0));

      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement.textContent).toBe('Community Metrics');
    });

    it('should display "Maintenance Metrics" for maintenance category', async () => {
      categorySection.category = 'maintenance';
      categorySection.metrics = [];
      await new Promise(resolve => setTimeout(resolve, 0));

      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement.textContent).toBe('Maintenance Metrics');
    });

    it('should display "Documentation Metrics" for documentation category', async () => {
      categorySection.category = 'documentation';
      categorySection.metrics = [];
      await new Promise(resolve => setTimeout(resolve, 0));

      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement.textContent).toBe('Documentation Metrics');
    });

    it('should display "Security & Governance Metrics" for security category', async () => {
      categorySection.category = 'security';
      categorySection.metrics = [];
      await new Promise(resolve => setTimeout(resolve, 0));

      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement.textContent).toBe('Security & Governance Metrics');
    });
  });

  describe('Rendering', () => {
    beforeEach(async () => {
      categorySection.category = 'activity';
      categorySection.metrics = testMetrics;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should display category title', () => {
      const titleElement = categorySection.shadowRoot.querySelector('.category-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toBe('Activity Metrics');
    });

    it('should display metrics grid', () => {
      const gridElement = categorySection.shadowRoot.querySelector('.metrics-grid');
      expect(gridElement).toBeTruthy();
    });

    it('should pass metric data to metric-display components', () => {
      const metricCards = categorySection.shadowRoot.querySelectorAll('metric-display');
      expect(metricCards[0].metric).toBe(testMetrics[0]);
      expect(metricCards[1].metric).toBe(testMetrics[1]);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      categorySection.category = 'activity';
      categorySection.metrics = testMetrics;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should have ARIA role', () => {
      const section = categorySection.shadowRoot.querySelector('.category-section');
      expect(section.getAttribute('role')).toBe('region');
    });

    it('should have ARIA label with category name', () => {
      const section = categorySection.shadowRoot.querySelector('.category-section');
      expect(section.getAttribute('aria-label')).toContain('Activity');
    });

    it('should use semantic heading for category title', () => {
      const titleElement = categorySection.shadowRoot.querySelector('h2.category-title');
      expect(titleElement).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no category is set', () => {
      const section = categorySection.shadowRoot.querySelector('.category-section');
      expect(section).toBeNull();
    });

    it('should render empty state when no metrics are set', async () => {
      categorySection.category = 'activity';
      categorySection.metrics = null;
      await new Promise(resolve => setTimeout(resolve, 0));

      const section = categorySection.shadowRoot.querySelector('.category-section');
      expect(section).toBeNull();
    });
  });

  describe('Category Statistics', () => {
    beforeEach(async () => {
      categorySection.category = 'activity';
      categorySection.metrics = testMetrics;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should display metric count', () => {
      const statsElement = categorySection.shadowRoot.querySelector('.category-stats');
      expect(statsElement.textContent).toContain('2 metrics');
    });

    it('should display average score', () => {
      const statsElement = categorySection.shadowRoot.querySelector('.category-stats');
      const expectedAvg = Math.round((85 + 90) / 2); // Implementation rounds the average
      expect(statsElement.textContent).toContain(`${expectedAvg}`);
    });
  });
});
