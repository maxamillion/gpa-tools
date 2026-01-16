/**
 * ComparisonTable - Web Component for side-by-side project comparison
 * Displays multiple project evaluations with aligned metrics and difference highlighting
 * WCAG 2.1 AA compliant with accessible table structure
 */

export class ComparisonTable extends HTMLElement {
  constructor() {
    super();
    this._evaluations = [];
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Set the evaluations to compare
   * @param {Array} value - Array of evaluation objects
   */
  set evaluations(value) {
    this._evaluations = value || [];
    this.render();
  }

  get evaluations() {
    return this._evaluations;
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Render the comparison table
   */
  render() {
    if (!this._evaluations || this._evaluations.length === 0) {
      this._renderEmptyState();
      return;
    }

    // Group metrics by category for organized display
    const metricsByCategory = this._groupMetricsByCategory();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .comparison-container {
          overflow-x: auto;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e1e4e8);
          border-radius: var(--border-radius, 8px);
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        thead {
          background-color: var(--color-surface-alt, #f6f8fa);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        th {
          padding: var(--spacing-md, 1rem);
          text-align: left;
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
          border-bottom: 2px solid var(--color-border, #e1e4e8);
        }

        th.metric-header {
          min-width: 200px;
          position: sticky;
          left: 0;
          background-color: var(--color-surface-alt, #f6f8fa);
          z-index: 11;
        }

        .project-header {
          text-align: center;
          position: relative;
          min-width: 180px;
        }

        .project-name {
          font-size: var(--font-size-lg, 1.125rem);
          margin-bottom: var(--spacing-xs, 0.25rem);
          color: var(--color-primary, #0366d6);
        }

        .overall-score {
          font-size: var(--font-size-sm, 0.875rem);
          color: var(--color-text-secondary, #586069);
        }

        .overall-grade {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          font-size: var(--font-size-xs, 0.75rem);
          margin-left: var(--spacing-xs, 0.25rem);
        }

        .overall-grade.grade-a { background-color: #dcffe4; color: #22863a; }
        .overall-grade.grade-b { background-color: #dbedff; color: #005cc5; }
        .overall-grade.grade-c { background-color: #fff5b1; color: #735c0f; }
        .overall-grade.grade-d,
        .overall-grade.grade-f { background-color: #ffe3e6; color: #cb2431; }

        .remove-button {
          position: absolute;
          top: var(--spacing-xs, 0.25rem);
          right: var(--spacing-xs, 0.25rem);
          background: none;
          border: 1px solid var(--color-border, #e1e4e8);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-text-secondary, #586069);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-button:hover {
          background-color: var(--color-danger-light, #ffe3e6);
          border-color: var(--color-danger, #d73a49);
          color: var(--color-danger-dark, #cb2431);
        }

        .remove-button:focus {
          outline: 2px solid var(--color-primary, #0366d6);
          outline-offset: 2px;
        }

        tbody tr {
          border-bottom: 1px solid var(--color-border-light, #f0f0f0);
        }

        tbody tr:hover {
          background-color: var(--color-surface-hover, #fafbfc);
        }

        td {
          padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
          color: var(--color-text-secondary, #586069);
        }

        td.metric-name-cell {
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
          position: sticky;
          left: 0;
          background-color: var(--color-surface, #ffffff);
          z-index: 1;
        }

        tbody tr:hover td.metric-name-cell {
          background-color: var(--color-surface-hover, #fafbfc);
        }

        .category-header {
          background-color: var(--color-surface-alt, #f6f8fa);
          font-weight: 700;
          color: var(--color-text-primary, #24292e);
          text-transform: uppercase;
          font-size: var(--font-size-sm, 0.875rem);
          letter-spacing: 0.5px;
        }

        .metric-cell {
          text-align: center;
          position: relative;
        }

        .metric-score {
          display: block;
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .metric-grade {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: var(--font-size-xs, 0.75rem);
          font-weight: 600;
        }

        .metric-value {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-text-tertiary, #6a737d);
          margin-top: 2px;
        }

        /* Highlighting for best/worst scores */
        .highlight-best {
          background-color: var(--color-success-light, #dcffe4);
          position: relative;
        }

        .highlight-best::before {
          content: '↑';
          position: absolute;
          top: 4px;
          right: 4px;
          color: var(--color-success-dark, #22863a);
          font-weight: bold;
          font-size: var(--font-size-sm, 0.875rem);
        }

        .highlight-worst {
          background-color: var(--color-danger-light, #ffe3e6);
          position: relative;
        }

        .highlight-worst::before {
          content: '↓';
          position: absolute;
          top: 4px;
          right: 4px;
          color: var(--color-danger-dark, #cb2431);
          font-weight: bold;
          font-size: var(--font-size-sm, 0.875rem);
        }

        /* Grade styling */
        .metric-grade.grade-a,
        .metric-grade.grade-a-plus { background-color: #dcffe4; color: #22863a; }
        .metric-grade.grade-b { background-color: #dbedff; color: #005cc5; }
        .metric-grade.grade-c { background-color: #fff5b1; color: #735c0f; }
        .metric-grade.grade-d,
        .metric-grade.grade-f { background-color: #ffe3e6; color: #cb2431; }
        .metric-grade.grade-pass { background-color: #dcffe4; color: #22863a; }
        .metric-grade.grade-fail { background-color: #ffe3e6; color: #cb2431; }

        @media (max-width: 768px) {
          .comparison-container {
            font-size: var(--font-size-sm, 0.875rem);
          }

          th, td {
            padding: var(--spacing-xs, 0.5rem);
          }

          .project-name {
            font-size: var(--font-size-md, 1rem);
          }
        }
      </style>

      <div class="comparison-container">
        <table role="table" aria-label="Project comparison table">
          <thead>
            <tr>
              <th scope="col" class="metric-header">Metric</th>
              ${this._evaluations.map((evaluation) => this._renderProjectHeader(evaluation)).join('')}
            </tr>
          </thead>
          <tbody>
            ${this._renderTableBody(metricsByCategory)}
          </tbody>
        </table>
      </div>
    `;

    this._attachEventListeners();
  }

  /**
   * Render empty state when no evaluations to compare
   */
  _renderEmptyState() {
    this.shadowRoot.innerHTML = `
      <style>
        .empty-state {
          padding: var(--spacing-xl, 2rem);
          text-align: center;
          background-color: var(--color-surface-alt, #f6f8fa);
          border: 2px dashed var(--color-border, #e1e4e8);
          border-radius: var(--border-radius, 8px);
          color: var(--color-text-secondary, #586069);
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: var(--spacing-md, 1rem);
        }

        .empty-state-title {
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          margin: 0 0 var(--spacing-sm, 0.5rem) 0;
          color: var(--color-text-primary, #24292e);
        }

        .empty-state-message {
          margin: 0;
          font-size: var(--font-size-md, 1rem);
        }
      </style>

      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3 class="empty-state-title">No projects to compare</h3>
        <p class="empty-state-message">Evaluate projects and click "Add to Comparison" to see them here.</p>
      </div>
    `;
  }

  /**
   * Render project header column
   */
  _renderProjectHeader(evaluation) {
    const gradeClass = this._getGradeClass(evaluation.healthScore.overallGrade);

    return `
      <th scope="col" class="project-header">
        <button
          class="remove-button"
          data-project-id="${evaluation.repository.fullName}"
          aria-label="Remove ${evaluation.repository.fullName} from comparison"
        >
          ×
        </button>
        <div class="project-name">${evaluation.repository.fullName}</div>
        <div class="overall-score">
          Score: ${evaluation.healthScore.overallScore.toFixed(1)}
          <span class="overall-grade ${gradeClass}">${evaluation.healthScore.overallGrade}</span>
        </div>
      </th>
    `;
  }

  /**
   * Render table body with metrics grouped by category
   */
  _renderTableBody(metricsByCategory) {
    let html = '';

    for (const [category, metricIds] of Object.entries(metricsByCategory)) {
      // Category header row
      html += `
        <tr class="category-row">
          <td colspan="${this._evaluations.length + 1}" class="category-header">
            ${category}
          </td>
        </tr>
      `;

      // Metric rows for this category
      for (const metricId of metricIds) {
        html += this._renderMetricRow(metricId);
      }
    }

    return html;
  }

  /**
   * Render a single metric row with values from all projects
   */
  _renderMetricRow(metricId) {
    // Get metric data from all evaluations
    const metricData = this._evaluations.map((evaluation) => {
      const metric = evaluation.metrics.find((m) => m.id === metricId);
      return metric || null;
    });

    // Get metric name from first available metric
    const firstMetric = metricData.find((m) => m !== null);
    if (!firstMetric) return '';

    // Calculate best/worst scores for highlighting (only if 2+ projects)
    const scores = metricData.map((m) => (m && m.score !== null ? m.score : -1));
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores.filter((s) => s >= 0));
    const shouldHighlight = this._evaluations.length >= 2 && maxScore !== minScore;

    return `
      <tr class="metric-row">
        <td class="metric-name-cell" scope="row">${firstMetric.name}</td>
        ${metricData
          .map((metric) => {
            if (!metric) {
              return '<td class="metric-cell">N/A</td>';
            }

            const isHighlightBest = shouldHighlight && metric.score === maxScore && maxScore > 0;
            const isHighlightWorst = shouldHighlight && metric.score === minScore && minScore >= 0 && minScore < maxScore;
            const highlightClass = isHighlightBest ? 'highlight-best' : isHighlightWorst ? 'highlight-worst' : '';
            const gradeClass = this._getGradeClass(metric.grade);

            return `
              <td class="metric-cell ${highlightClass}">
                <div class="metric-score">${metric.score !== null ? metric.score : 'N/A'}</div>
                <span class="metric-grade ${gradeClass}">${metric.grade}</span>
                <div class="metric-value">${this._formatValue(metric.value)}</div>
              </td>
            `;
          })
          .join('')}
      </tr>
    `;
  }

  /**
   * Group all metrics by category
   */
  _groupMetricsByCategory() {
    const categories = {};

    // Collect all unique metrics across all evaluations
    const allMetrics = new Map();

    this._evaluations.forEach((evaluation) => {
      evaluation.metrics.forEach((metric) => {
        if (!allMetrics.has(metric.id)) {
          allMetrics.set(metric.id, metric);
        }
      });
    });

    // Group by category
    allMetrics.forEach((metric) => {
      if (!categories[metric.category]) {
        categories[metric.category] = [];
      }
      categories[metric.category].push(metric.id);
    });

    return categories;
  }

  /**
   * Get CSS class for grade styling
   */
  _getGradeClass(grade) {
    const gradeMap = {
      'A+': 'grade-a-plus',
      A: 'grade-a',
      B: 'grade-b',
      C: 'grade-c',
      D: 'grade-d',
      F: 'grade-f',
      Pass: 'grade-pass',
      Fail: 'grade-fail',
    };
    return gradeMap[grade] || '';
  }

  /**
   * Format metric value for display
   */
  _formatValue(value) {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'number') {
      return value.toLocaleString('en-US');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value;
  }

  /**
   * Attach event listeners for interactive elements
   */
  _attachEventListeners() {
    const removeButtons = this.shadowRoot.querySelectorAll('.remove-button');

    removeButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const projectId = button.getAttribute('data-project-id');

        this.dispatchEvent(
          new CustomEvent('remove-project', {
            detail: { projectId },
            bubbles: true,
          })
        );
      });
    });
  }
}

// Define the custom element
customElements.define('comparison-table', ComparisonTable);
