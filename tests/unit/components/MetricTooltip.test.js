import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetricTooltip } from '../../../src/components/MetricTooltip.js';

describe('MetricTooltip', () => {
  let tooltip;

  beforeEach(() => {
    tooltip = new MetricTooltip();
    document.body.appendChild(tooltip);
  });

  afterEach(() => {
    document.body.removeChild(tooltip);
  });

  describe('Component Initialization', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('metric-tooltip')).toBeDefined();
    });

    it('should render with default empty state', () => {
      expect(tooltip.shadowRoot).toBeTruthy();
      expect(tooltip.shadowRoot.querySelector('.tooltip-trigger')).toBeTruthy();
    });
  });

  describe('Metric Data Binding', () => {
    it('should accept and store metric data', () => {
      const metricData = {
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'Activity',
        explanation: 'Measures how actively the project is being developed',
        chaossLink: 'https://chaoss.community/metric-commit-frequency/',
        threshold: {
          excellent: '> 30 commits/month',
          good: '10-30 commits/month',
          fair: '3-10 commits/month',
          poor: '< 3 commits/month',
        },
      };

      tooltip.metric = metricData;

      expect(tooltip._metric).toEqual(metricData);
    });

    it('should update display when metric changes', () => {
      const metricData = {
        id: 'test-metric',
        name: 'Test Metric',
        category: 'Testing',
        explanation: 'Test explanation',
      };

      tooltip.metric = metricData;

      const tooltipContent = tooltip.shadowRoot.querySelector('.tooltip-content');
      expect(tooltipContent).toBeTruthy();
      expect(tooltipContent.textContent).toContain('Test Metric');
      expect(tooltipContent.textContent).toContain('Test explanation');
    });
  });

  describe('Tooltip Visibility', () => {
    beforeEach(() => {
      tooltip.metric = {
        id: 'test-metric',
        name: 'Test Metric',
        category: 'Testing',
        explanation: 'Test explanation',
      };
    });

    it('should show tooltip on trigger hover', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      expect(content.classList.contains('visible')).toBe(false);

      trigger.dispatchEvent(new MouseEvent('mouseenter'));

      expect(content.classList.contains('visible')).toBe(true);
    });

    it('should hide tooltip on trigger mouse leave', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      expect(content.classList.contains('visible')).toBe(true);

      trigger.dispatchEvent(new MouseEvent('mouseleave'));
      expect(content.classList.contains('visible')).toBe(false);
    });

    it('should show tooltip on trigger focus (keyboard navigation)', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      trigger.dispatchEvent(new FocusEvent('focus'));

      expect(content.classList.contains('visible')).toBe(true);
    });

    it('should hide tooltip on trigger blur', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      trigger.dispatchEvent(new FocusEvent('focus'));
      expect(content.classList.contains('visible')).toBe(true);

      trigger.dispatchEvent(new FocusEvent('blur'));
      expect(content.classList.contains('visible')).toBe(false);
    });
  });

  describe('CHAOSS Link Integration', () => {
    it('should display CHAOSS link when provided', () => {
      tooltip.metric = {
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'Activity',
        explanation: 'Test explanation',
        chaossLink: 'https://chaoss.community/metric-commit-frequency/',
      };

      const tooltipContent = tooltip.shadowRoot.querySelector('.tooltip-content');
      const link = tooltipContent.querySelector('a[href*="chaoss.community"]');

      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('https://chaoss.community/metric-commit-frequency/');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should not display CHAOSS link when not provided', () => {
      tooltip.metric = {
        id: 'custom-metric',
        name: 'Custom Metric',
        category: 'Custom',
        explanation: 'Custom explanation',
      };

      const tooltipContent = tooltip.shadowRoot.querySelector('.tooltip-content');
      const link = tooltipContent.querySelector('a[href*="chaoss.community"]');

      expect(link).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      tooltip.metric = {
        id: 'test-metric',
        name: 'Test Metric',
        category: 'Testing',
        explanation: 'Test explanation',
      };
    });

    it('should have proper ARIA attributes on trigger', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');

      expect(trigger.getAttribute('role')).toBe('button');
      expect(trigger.getAttribute('aria-label')).toContain('Test Metric');
      expect(trigger.hasAttribute('tabindex')).toBe(true);
    });

    it('should have proper ARIA attributes on tooltip content', () => {
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      expect(content.getAttribute('role')).toBe('tooltip');
      expect(content.hasAttribute('id')).toBe(true);
    });

    it('should connect trigger to content via aria-describedby', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      expect(trigger.getAttribute('aria-describedby')).toBe(content.getAttribute('id'));
    });

    it('should be keyboard navigable with Enter key', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      trigger.dispatchEvent(enterEvent);

      expect(content.classList.contains('visible')).toBe(true);
    });

    it('should close tooltip with Escape key', () => {
      const trigger = tooltip.shadowRoot.querySelector('.tooltip-trigger');
      const content = tooltip.shadowRoot.querySelector('.tooltip-content');

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      expect(content.classList.contains('visible')).toBe(true);

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      tooltip.shadowRoot.dispatchEvent(escapeEvent);

      expect(content.classList.contains('visible')).toBe(false);
    });
  });

  describe('Threshold Display', () => {
    it('should display thresholds when provided', () => {
      tooltip.metric = {
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'Activity',
        explanation: 'Test explanation',
        threshold: {
          excellent: '> 30 commits/month',
          good: '10-30 commits/month',
          fair: '3-10 commits/month',
          poor: '< 3 commits/month',
        },
      };

      const tooltipContent = tooltip.shadowRoot.querySelector('.tooltip-content');
      const thresholdSection = tooltipContent.querySelector('.threshold-info');

      expect(thresholdSection).toBeTruthy();
      expect(thresholdSection.textContent).toContain('> 30 commits/month');
      expect(thresholdSection.textContent).toContain('10-30 commits/month');
    });

    it('should not display threshold section when not provided', () => {
      tooltip.metric = {
        id: 'custom-metric',
        name: 'Custom Metric',
        category: 'Custom',
        explanation: 'Custom explanation',
      };

      const tooltipContent = tooltip.shadowRoot.querySelector('.tooltip-content');
      const thresholdSection = tooltipContent.querySelector('.threshold-info');

      expect(thresholdSection).toBeFalsy();
    });
  });
});
