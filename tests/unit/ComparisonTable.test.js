/**
 * Unit tests for ComparisonTable Web Component
 * Displays side-by-side comparison of multiple repository health metrics
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Metric } from '../../src/models/Metric.js';
import '../../src/components/ComparisonTable.js';

describe('ComparisonTable Component', () => {
  let container;
  let comparisonTable;
  let testEvaluations;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    comparisonTable = document.createElement('comparison-table');
    container.appendChild(comparisonTable);

    // Create test evaluations for two repositories
    testEvaluations = [
      {
        repository: {
          owner: 'facebook',
          name: 'react',
          fullName: 'facebook/react',
        },
        metrics: [
          new Metric({
            id: 'commit-frequency',
            name: 'Commit Frequency',
            category: 'activity',
            value: 15,
            score: 90,
            grade: 'A',
            explanation: '',
            whyItMatters: '',
            threshold: {},
            dataSource: '',
            calculatedAt: new Date(),
            confidence: 'high',
          }),
          new Metric({
            id: 'test-coverage',
            name: 'Test Coverage',
            category: 'maintenance',
            value: 85,
            score: 85,
            grade: 'A',
            explanation: '',
            whyItMatters: '',
            threshold: {},
            dataSource: '',
            calculatedAt: new Date(),
            confidence: 'high',
          }),
        ],
        healthScore: {
          overallScore: 87,
          overallGrade: 'A',
        },
      },
      {
        repository: {
          owner: 'vuejs',
          name: 'vue',
          fullName: 'vuejs/vue',
        },
        metrics: [
          new Metric({
            id: 'commit-frequency',
            name: 'Commit Frequency',
            category: 'activity',
            value: 12,
            score: 80,
            grade: 'B',
            explanation: '',
            whyItMatters: '',
            threshold: {},
            dataSource: '',
            calculatedAt: new Date(),
            confidence: 'high',
          }),
          new Metric({
            id: 'test-coverage',
            name: 'Test Coverage',
            category: 'maintenance',
            value: 90,
            score: 95,
            grade: 'A+',
            explanation: '',
            whyItMatters: '',
            threshold: {},
            dataSource: '',
            calculatedAt: new Date(),
            confidence: 'high',
          }),
        ],
        healthScore: {
          overallScore: 88,
          overallGrade: 'A',
        },
      },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Component Registration', () => {
    it('should be registered as custom element', () => {
      expect(customElements.get('comparison-table')).toBeDefined();
    });

    it('should create instance with shadowDOM', () => {
      expect(comparisonTable.shadowRoot).toBeTruthy();
    });
  });

  describe('Repository Headers', () => {
    beforeEach(() => {
      comparisonTable.evaluations = testEvaluations;
    });

    it('should display repository names in header', () => {
      const headers = comparisonTable.shadowRoot.querySelectorAll('.repo-header');
      expect(headers.length).toBe(2);
      expect(headers[0].textContent).toContain('facebook/react');
      expect(headers[1].textContent).toContain('vuejs/vue');
    });

    it('should display overall health scores in header', () => {
      const scores = comparisonTable.shadowRoot.querySelectorAll('.overall-score');
      expect(scores.length).toBe(2);
      expect(scores[0].textContent).toContain('87');
      expect(scores[1].textContent).toContain('88');
    });

    it('should display overall grades in header', () => {
      const grades = comparisonTable.shadowRoot.querySelectorAll('.overall-grade');
      expect(grades.length).toBe(2);
      expect(grades[0].textContent).toContain('A');
      expect(grades[1].textContent).toContain('A');
    });
  });

  describe('Metric Rows', () => {
    beforeEach(() => {
      comparisonTable.evaluations = testEvaluations;
    });

    it('should display one row per unique metric', () => {
      const metricRows = comparisonTable.shadowRoot.querySelectorAll('.metric-row');
      expect(metricRows.length).toBe(2); // commit-frequency and test-coverage
    });

    it('should display metric name in first column', () => {
      const metricNames = comparisonTable.shadowRoot.querySelectorAll('.metric-name');
      expect(metricNames.length).toBeGreaterThan(0);
      const names = Array.from(metricNames).map((el) => el.textContent);
      expect(names).toContain('Commit Frequency');
      expect(names).toContain('Test Coverage');
    });

    it('should display metric scores for each repository', () => {
      const rows = comparisonTable.shadowRoot.querySelectorAll('.metric-row');
      const firstRow = rows[0]; // Commit Frequency
      const scores = firstRow.querySelectorAll('.metric-score');
      expect(scores.length).toBe(2);
      expect(scores[0].textContent).toContain('90');
      expect(scores[1].textContent).toContain('80');
    });

    it('should display metric grades for each repository', () => {
      const rows = comparisonTable.shadowRoot.querySelectorAll('.metric-row');
      const firstRow = rows[0]; // Commit Frequency
      const grades = firstRow.querySelectorAll('.metric-grade');
      expect(grades.length).toBe(2);
      expect(grades[0].textContent).toContain('A');
      expect(grades[1].textContent).toContain('B');
    });
  });

  describe('Highlighting', () => {
    beforeEach(() => {
      comparisonTable.evaluations = testEvaluations;
    });

    it('should highlight highest score in each metric row', () => {
      const rows = comparisonTable.shadowRoot.querySelectorAll('.metric-row');
      const firstRow = rows[0]; // Commit Frequency: 90 vs 80
      const cells = firstRow.querySelectorAll('.metric-cell');
      expect(cells[0].classList.contains('best-score')).toBe(true);
    });

    it('should highlight lowest score in each metric row', () => {
      const rows = comparisonTable.shadowRoot.querySelectorAll('.metric-row');
      const firstRow = rows[0]; // Commit Frequency: 90 vs 80
      const cells = firstRow.querySelectorAll('.metric-cell');
      expect(cells[1].classList.contains('worst-score')).toBe(true);
    });

    it('should not highlight when all scores are equal', () => {
      // Create evaluation where both repos have same score
      comparisonTable.evaluations = [
        {
          ...testEvaluations[0],
          metrics: [
            new Metric({
              id: 'commit-frequency',
              name: 'Commit Frequency',
              category: 'activity',
              value: 15,
              score: 85,
              grade: 'A',
              explanation: '',
              whyItMatters: '',
              threshold: {},
              dataSource: '',
              calculatedAt: new Date(),
              confidence: 'high',
            }),
          ],
        },
        {
          ...testEvaluations[1],
          metrics: [
            new Metric({
              id: 'commit-frequency',
              name: 'Commit Frequency',
              category: 'activity',
              value: 12,
              score: 85,
              grade: 'A',
              explanation: '',
              whyItMatters: '',
              threshold: {},
              dataSource: '',
              calculatedAt: new Date(),
              confidence: 'high',
            }),
          ],
        },
      ];

      const cells = comparisonTable.shadowRoot.querySelectorAll('.metric-cell');
      const hasHighlight = Array.from(cells).some(
        (cell) => cell.classList.contains('best-score') || cell.classList.contains('worst-score')
      );
      expect(hasHighlight).toBe(false);
    });
  });

  describe('Empty State', () => {
    it('should display message when no evaluations provided', () => {
      comparisonTable.evaluations = [];
      const emptyMessage = comparisonTable.shadowRoot.querySelector('.empty-state');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('No repositories to compare');
    });

    it('should display message when single evaluation provided', () => {
      comparisonTable.evaluations = [testEvaluations[0]];
      const message = comparisonTable.shadowRoot.querySelector('.info-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Add more repositories');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      comparisonTable.evaluations = testEvaluations;
    });

    it('should use table layout for comparison', () => {
      const table = comparisonTable.shadowRoot.querySelector('table');
      expect(table).toBeTruthy();
    });

    it('should have scrollable container for many repositories', () => {
      const container = comparisonTable.shadowRoot.querySelector('.comparison-container');
      expect(container).toBeTruthy();

      // Verify overflow-x: auto is defined in styles
      const styleElement = comparisonTable.shadowRoot.querySelector('style');
      expect(styleElement.textContent).toContain('overflow-x: auto');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      comparisonTable.evaluations = testEvaluations;
    });

    it('should have table headers with scope attribute', () => {
      const headers = comparisonTable.shadowRoot.querySelectorAll('th');
      headers.forEach((header) => {
        expect(header.getAttribute('scope')).toBeTruthy();
      });
    });

    it('should have descriptive caption for screen readers', () => {
      const caption = comparisonTable.shadowRoot.querySelector('caption');
      expect(caption).toBeTruthy();
      expect(caption.textContent).toContain('Repository comparison');
    });
  });
});
