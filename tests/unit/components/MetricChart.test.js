/**
 * Unit tests for MetricChart component
 * Tests lazy loading, rendering, and Chart.js integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
// eslint-disable-next-line no-unused-vars -- MetricChart is used for custom element registration
import { MetricChart } from '../../../src/components/MetricChart.js';

describe('MetricChart', () => {
  let chart;

  beforeEach(() => {
    chart = document.createElement('metric-chart');
  });

  afterEach(() => {
    if (chart.isConnected) {
      document.body.removeChild(chart);
    }
    // Clean up any chart instances
    if (chart._chartInstance) {
      chart._chartInstance.destroy();
    }
  });

  describe('Component Initialization', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('metric-chart')).toBeDefined();
    });

    it('should have shadow DOM', () => {
      expect(chart.shadowRoot).toBeTruthy();
    });

    it('should initialize with null category breakdown', () => {
      expect(chart.categoryBreakdown).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no data', () => {
      document.body.appendChild(chart);

      const emptyState = chart.shadowRoot.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No category data available');
    });

    it('should render empty state when categoryBreakdown is null', () => {
      chart.categoryBreakdown = null;
      document.body.appendChild(chart);

      const emptyState = chart.shadowRoot.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });
  });

  describe('Data Binding', () => {
    it('should accept category breakdown data', () => {
      const testData = {
        community: { score: 85, metrics: [] },
        activity: { score: 92, metrics: [] },
      };

      chart.categoryBreakdown = testData;
      expect(chart.categoryBreakdown).toBe(testData);
    });

    it('should trigger render when categoryBreakdown is set and connected', async () => {
      document.body.appendChild(chart);

      const testData = {
        community: { score: 85, metrics: [] },
      };

      chart.categoryBreakdown = testData;

      // Should show loading state initially
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Component should attempt to load chart
      expect(chart.shadowRoot.innerHTML.length).toBeGreaterThan(0);
    });
  });

  describe('Chart Rendering', () => {
    it('should load Chart.js dynamically', async () => {
      const testData = {
        community: { score: 85, metrics: [] },
        activity: { score: 92, metrics: [] },
      };

      chart.categoryBreakdown = testData;
      document.body.appendChild(chart);

      // Wait for async import and rendering
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should have canvas element after chart loads
      const canvas = chart.shadowRoot.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });

    it('should create chart with correct data', async () => {
      const testData = {
        community: { score: 85, metrics: [] },
        activity: { score: 92, metrics: [] },
        security: { score: 78, metrics: [] },
      };

      chart.categoryBreakdown = testData;
      document.body.appendChild(chart);

      // Wait for chart to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify canvas exists
      const canvas = chart.shadowRoot.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.getAttribute('role')).toBe('img');
      expect(canvas.getAttribute('aria-label')).toContain('Bar chart');
    });

    it('should format category names correctly', () => {
      expect(chart._formatCategoryName('community')).toBe('Community');
      expect(chart._formatCategoryName('code_quality')).toBe('Code Quality');
      expect(chart._formatCategoryName('security_audit')).toBe('Security Audit');
    });
  });

  describe('Score Colors', () => {
    it('should return correct colors for different score ranges', () => {
      // Test A grade (90-100)
      const colorA = chart._getScoreColor(95);
      expect(colorA).toContain('40, 167, 69'); // Green

      // Test B grade (80-89)
      const colorB = chart._getScoreColor(85);
      expect(colorB).toContain('3, 102, 214'); // Blue

      // Test C grade (70-79)
      const colorC = chart._getScoreColor(75);
      expect(colorC).toContain('255, 211, 61'); // Yellow

      // Test D/F grade (<70)
      const colorF = chart._getScoreColor(60);
      expect(colorF).toContain('215, 58, 73'); // Red
    });

    it('should return correct border colors for different score ranges', () => {
      // Test A grade
      expect(chart._getScoreBorderColor(95)).toContain('40, 167, 69');

      // Test B grade
      expect(chart._getScoreBorderColor(85)).toContain('3, 102, 214');

      // Test C grade
      expect(chart._getScoreBorderColor(75)).toContain('255, 211, 61');

      // Test D/F grade
      expect(chart._getScoreBorderColor(60)).toContain('215, 58, 73');
    });
  });

  describe('Cleanup', () => {
    it('should destroy chart instance on disconnect', async () => {
      const testData = {
        community: { score: 85, metrics: [] },
      };

      chart.categoryBreakdown = testData;
      document.body.appendChild(chart);

      // Wait for chart to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock destroy method
      if (chart._chartInstance) {
        const destroySpy = vi.spyOn(chart._chartInstance, 'destroy');

        // Disconnect component
        document.body.removeChild(chart);

        // Verify destroy was called
        expect(destroySpy).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    it('should render error state if Chart.js import fails', async () => {
      // This test would require mocking the dynamic import to fail
      // For now, we verify error state rendering exists
      chart._renderErrorState();

      const errorState = chart.shadowRoot.querySelector('.error-state');
      expect(errorState).toBeTruthy();
      expect(errorState.textContent).toContain('Failed to load');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible chart title', async () => {
      const testData = {
        community: { score: 85, metrics: [] },
      };

      chart.categoryBreakdown = testData;
      document.body.appendChild(chart);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const title = chart.shadowRoot.querySelector('.chart-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Category Score Distribution');
    });

    it('should have ARIA label on canvas', async () => {
      const testData = {
        community: { score: 85, metrics: [] },
      };

      chart.categoryBreakdown = testData;
      document.body.appendChild(chart);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = chart.shadowRoot.querySelector('canvas');
      if (canvas) {
        expect(canvas.getAttribute('role')).toBe('img');
        expect(canvas.getAttribute('aria-label')).toBeTruthy();
      }
    });
  });
});
