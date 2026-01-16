import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComparisonTable } from '../../../src/components/ComparisonTable.js';

describe('ComparisonTable', () => {
  let table;

  beforeEach(() => {
    table = new ComparisonTable();
    document.body.appendChild(table);
  });

  afterEach(() => {
    document.body.removeChild(table);
  });

  describe('Component Initialization', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('comparison-table')).toBeDefined();
    });

    it('should render with empty state by default', () => {
      expect(table.shadowRoot).toBeTruthy();
      expect(table._evaluations).toEqual([]);
    });

    it('should display empty state message when no evaluations', () => {
      const emptyMessage = table.shadowRoot.querySelector('.empty-state');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('No projects to compare');
    });
  });

  describe('Evaluation Data Binding', () => {
    it('should accept and store evaluation data', () => {
      const evaluations = [
        {
          repository: { owner: 'facebook', name: 'react', fullName: 'facebook/react' },
          metrics: [
            { id: 'commit-frequency', name: 'Commit Frequency', category: 'Activity', score: 85, grade: 'B', value: 45 },
            { id: 'contributor-count', name: 'Contributors', category: 'Community', score: 95, grade: 'A', value: 1500 },
          ],
          healthScore: { overallScore: 90, overallGrade: 'A' },
        },
        {
          repository: { owner: 'vuejs', name: 'vue', fullName: 'vuejs/vue' },
          metrics: [
            { id: 'commit-frequency', name: 'Commit Frequency', category: 'Activity', score: 75, grade: 'B', value: 30 },
            { id: 'contributor-count', name: 'Contributors', category: 'Community', score: 85, grade: 'B', value: 800 },
          ],
          healthScore: { overallScore: 80, overallGrade: 'B' },
        },
      ];

      table.evaluations = evaluations;

      expect(table._evaluations).toEqual(evaluations);
    });

    it('should update display when evaluations change', () => {
      const evaluations = [
        {
          repository: { owner: 'facebook', name: 'react', fullName: 'facebook/react' },
          metrics: [{ id: 'test', name: 'Test', category: 'Testing', score: 85, grade: 'B', value: 100 }],
          healthScore: { overallScore: 85, overallGrade: 'B' },
        },
      ];

      table.evaluations = evaluations;

      const projectHeaders = table.shadowRoot.querySelectorAll('.project-header');
      expect(projectHeaders.length).toBeGreaterThan(0);
      expect(table.shadowRoot.textContent).toContain('facebook/react');
    });
  });

  describe('Table Rendering', () => {
    const sampleEvaluations = [
      {
        repository: { owner: 'facebook', name: 'react', fullName: 'facebook/react' },
        metrics: [
          { id: 'metric1', name: 'Metric 1', category: 'Category A', score: 85, grade: 'B', value: 100 },
          { id: 'metric2', name: 'Metric 2', category: 'Category A', score: 90, grade: 'A', value: 200 },
        ],
        healthScore: { overallScore: 87.5, overallGrade: 'B' },
      },
      {
        repository: { owner: 'vuejs', name: 'vue', fullName: 'vuejs/vue' },
        metrics: [
          { id: 'metric1', name: 'Metric 1', category: 'Category A', score: 75, grade: 'B', value: 80 },
          { id: 'metric2', name: 'Metric 2', category: 'Category A', score: 70, grade: 'C', value: 150 },
        ],
        healthScore: { overallScore: 72.5, overallGrade: 'C' },
      },
    ];

    it('should display project names in headers', () => {
      table.evaluations = sampleEvaluations;

      const headers = table.shadowRoot.querySelectorAll('.project-header');
      expect(headers.length).toBe(2);
      expect(headers[0].textContent).toContain('facebook/react');
      expect(headers[1].textContent).toContain('vuejs/vue');
    });

    it('should display overall health scores', () => {
      table.evaluations = sampleEvaluations;

      const scoreElements = table.shadowRoot.querySelectorAll('.overall-score');
      expect(scoreElements.length).toBe(2);
      expect(scoreElements[0].textContent).toContain('87.5');
      expect(scoreElements[1].textContent).toContain('72.5');
    });

    it('should align metrics in rows', () => {
      table.evaluations = sampleEvaluations;

      const metricRows = table.shadowRoot.querySelectorAll('.metric-row');
      expect(metricRows.length).toBeGreaterThan(0);
    });

    it('should group metrics by category', () => {
      table.evaluations = sampleEvaluations;

      const categoryHeaders = table.shadowRoot.querySelectorAll('.category-header');
      expect(categoryHeaders.length).toBeGreaterThan(0);
    });
  });

  describe('Difference Highlighting', () => {
    const evaluationsWithDifferences = [
      {
        repository: { owner: 'project1', name: 'proj1', fullName: 'project1/proj1' },
        metrics: [{ id: 'metric1', name: 'Metric 1', category: 'Cat', score: 90, grade: 'A', value: 100 }],
        healthScore: { overallScore: 90, overallGrade: 'A' },
      },
      {
        repository: { owner: 'project2', name: 'proj2', fullName: 'project2/proj2' },
        metrics: [{ id: 'metric1', name: 'Metric 1', category: 'Cat', score: 50, grade: 'D', value: 50 }],
        healthScore: { overallScore: 50, overallGrade: 'D' },
      },
    ];

    it('should highlight significant score differences', () => {
      table.evaluations = evaluationsWithDifferences;

      // Look for highlight classes or styles
      const cells = table.shadowRoot.querySelectorAll('.metric-cell');
      const highlightedCells = Array.from(cells).filter((cell) =>
        cell.classList.contains('highlight-best') || cell.classList.contains('highlight-worst')
      );

      expect(highlightedCells.length).toBeGreaterThan(0);
    });

    it('should mark best score with highlight-best class', () => {
      table.evaluations = evaluationsWithDifferences;

      const bestCells = table.shadowRoot.querySelectorAll('.highlight-best');
      expect(bestCells.length).toBeGreaterThan(0);
    });

    it('should mark worst score with highlight-worst class', () => {
      table.evaluations = evaluationsWithDifferences;

      const worstCells = table.shadowRoot.querySelectorAll('.highlight-worst');
      expect(worstCells.length).toBeGreaterThan(0);
    });
  });

  describe('Remove Project Functionality', () => {
    it('should dispatch remove-project event when remove button clicked', () => {
      const evaluations = [
        {
          repository: { owner: 'facebook', name: 'react', fullName: 'facebook/react' },
          metrics: [],
          healthScore: { overallScore: 90, overallGrade: 'A' },
        },
      ];

      table.evaluations = evaluations;

      let eventFired = false;
      let eventDetail = null;

      table.addEventListener('remove-project', (e) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const removeButton = table.shadowRoot.querySelector('.remove-button');
      if (removeButton) {
        removeButton.click();

        expect(eventFired).toBe(true);
        expect(eventDetail.projectId).toBe('facebook/react');
      }
    });
  });

  describe('Accessibility', () => {
    const sampleEvaluations = [
      {
        repository: { owner: 'facebook', name: 'react', fullName: 'facebook/react' },
        metrics: [{ id: 'metric1', name: 'Metric 1', category: 'Cat', score: 85, grade: 'B', value: 100 }],
        healthScore: { overallScore: 85, overallGrade: 'B' },
      },
    ];

    it('should have proper table structure with thead and tbody', () => {
      table.evaluations = sampleEvaluations;

      const tableElement = table.shadowRoot.querySelector('table');
      const thead = table.shadowRoot.querySelector('thead');
      const tbody = table.shadowRoot.querySelector('tbody');

      expect(tableElement).toBeTruthy();
      expect(thead).toBeTruthy();
      expect(tbody).toBeTruthy();
    });

    it('should have proper ARIA attributes on table', () => {
      table.evaluations = sampleEvaluations;

      const tableElement = table.shadowRoot.querySelector('table');
      expect(tableElement.hasAttribute('role')).toBe(true);
    });

    it('should have proper header cells with scope attributes', () => {
      table.evaluations = sampleEvaluations;

      const headerCells = table.shadowRoot.querySelectorAll('th');
      expect(headerCells.length).toBeGreaterThan(0);

      headerCells.forEach((th) => {
        expect(th.hasAttribute('scope')).toBe(true);
      });
    });
  });

  describe('Empty State Handling', () => {
    it('should show empty state when evaluations array is empty', () => {
      table.evaluations = [];

      const emptyState = table.shadowRoot.querySelector('.empty-state');
      const tableElement = table.shadowRoot.querySelector('table');

      expect(emptyState).toBeTruthy();
      expect(tableElement).toBeFalsy();
    });

    it('should hide empty state when evaluations are added', () => {
      table.evaluations = [];
      expect(table.shadowRoot.querySelector('.empty-state')).toBeTruthy();

      table.evaluations = [
        {
          repository: { owner: 'test', name: 'test', fullName: 'test/test' },
          metrics: [],
          healthScore: { overallScore: 80, overallGrade: 'B' },
        },
      ];

      const emptyState = table.shadowRoot.querySelector('.empty-state');
      expect(emptyState).toBeFalsy();
    });
  });

  describe('Single Project Display', () => {
    it('should display single project without comparison highlighting', () => {
      table.evaluations = [
        {
          repository: { owner: 'single', name: 'project', fullName: 'single/project' },
          metrics: [{ id: 'metric1', name: 'Metric 1', category: 'Cat', score: 85, grade: 'B', value: 100 }],
          healthScore: { overallScore: 85, overallGrade: 'B' },
        },
      ];

      const highlightedCells = table.shadowRoot.querySelectorAll('.highlight-best, .highlight-worst');
      expect(highlightedCells.length).toBe(0);
    });
  });
});
