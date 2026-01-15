/**
 * ComparisonTable Web Component
 * Displays side-by-side comparison of multiple repository health metrics
 */

export class ComparisonTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._evaluations = [];
  }

  get evaluations() {
    return this._evaluations;
  }

  set evaluations(value) {
    this._evaluations = value || [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._evaluations || this._evaluations.length === 0) {
      this.shadowRoot.innerHTML = this.renderEmptyState();
      return;
    }

    if (this._evaluations.length === 1) {
      this.shadowRoot.innerHTML = this.renderSingleRepoMessage();
      return;
    }

    this.shadowRoot.innerHTML = this.renderComparisonTable();
  }

  renderEmptyState() {
    return `
      <style>
        .empty-state {
          padding: var(--spacing-xl, 2rem);
          text-align: center;
          color: var(--color-text-secondary, #586069);
          font-size: var(--font-size-lg, 1.125rem);
        }
      </style>
      <div class="empty-state">
        No repositories to compare. Add repositories to see their comparison.
      </div>
    `;
  }

  renderSingleRepoMessage() {
    return `
      <style>
        .info-message {
          padding: var(--spacing-lg, 1.5rem);
          text-align: center;
          color: var(--color-text-secondary, #586069);
          background-color: var(--color-info-light, #dbedff);
          border-radius: var(--border-radius, 8px);
        }
      </style>
      <div class="info-message">
        Add more repositories to enable comparison view.
      </div>
    `;
  }

  // eslint-disable-next-line max-lines-per-function -- Web Component render methods combine styles and markup
  renderComparisonTable() {
    const metrics = this.getAllMetrics();
    const headerHTML = this.renderHeader();
    const rowsHTML = metrics.map((metricId) => this.renderMetricRow(metricId)).join('');

    return `
      <style>
        :host {
          display: block;
        }

        .comparison-container {
          overflow-x: auto;
          border-radius: var(--border-radius, 8px);
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: var(--color-surface, #ffffff);
        }

        caption {
          padding: var(--spacing-md, 1rem);
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          text-align: left;
          color: var(--color-text-primary, #24292e);
        }

        th, td {
          padding: var(--spacing-md, 1rem);
          text-align: left;
          border-bottom: 1px solid var(--color-border, #e1e4e8);
        }

        th {
          background-color: var(--color-surface-alt, #f6f8fa);
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
        }

        .repo-header {
          min-width: 200px;
        }

        .repo-name {
          font-size: var(--font-size-md, 1rem);
          font-weight: 600;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .overall-score {
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 700;
          margin-right: var(--spacing-xs, 0.25rem);
        }

        .overall-grade {
          display: inline-block;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          border-radius: var(--border-radius-sm, 4px);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: 600;
          background-color: var(--color-success-light, #dcffe4);
          color: var(--color-success-dark, #22863a);
        }

        .metric-name {
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
        }

        .metric-cell {
          text-align: center;
          min-width: 150px;
        }

        .metric-score {
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          margin-right: var(--spacing-xs, 0.25rem);
        }

        .metric-grade {
          display: inline-block;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          border-radius: var(--border-radius-sm, 4px);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: 600;
        }

        .best-score {
          background-color: var(--color-success-light, #dcffe4);
        }

        .worst-score {
          background-color: var(--color-danger-light, #ffe3e6);
        }

        .metric-row:hover {
          background-color: var(--color-surface-alt, #f6f8fa);
        }

        .metric-not-available {
          color: var(--color-text-tertiary, #6a737d);
          font-style: italic;
        }
      </style>

      <div class="comparison-container">
        <table>
          <caption>Repository comparison table</caption>
          <thead>
            ${headerHTML}
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  renderHeader() {
    const repoHeaders = this._evaluations
      .map(
        (evaluation) => `
        <th scope="col" class="repo-header">
          <div class="repo-name">${evaluation.repository.fullName}</div>
          <div>
            <span class="overall-score">${evaluation.healthScore.overallScore}</span>
            <span class="overall-grade">${evaluation.healthScore.overallGrade}</span>
          </div>
        </th>
      `
      )
      .join('');

    return `
      <tr>
        <th scope="col">Metric</th>
        ${repoHeaders}
      </tr>
    `;
  }

  renderMetricRow(metricId) {
    // Get metric data for each repository
    const metricData = this._evaluations.map((evaluation) => {
      const metric = evaluation.metrics.find((m) => m.id === metricId);
      return metric || null;
    });

    // Get metric name from first available
    const firstMetric = metricData.find((m) => m !== null);
    if (!firstMetric) return '';

    // Find best and worst scores for highlighting
    const scores = metricData.filter((m) => m !== null).map((m) => m.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const shouldHighlight = maxScore !== minScore;

    const cells = metricData
      .map((metric) => {
        if (!metric) {
          return '<td class="metric-cell metric-not-available">N/A</td>';
        }

        const isBest = shouldHighlight && metric.score === maxScore;
        const isWorst = shouldHighlight && metric.score === minScore;
        const highlightClass = isBest ? 'best-score' : isWorst ? 'worst-score' : '';

        return `
        <td class="metric-cell ${highlightClass}">
          <span class="metric-score">${metric.score}</span>
          <span class="metric-grade">${metric.grade}</span>
        </td>
      `;
      })
      .join('');

    return `
      <tr class="metric-row">
        <td class="metric-name">${firstMetric.name}</td>
        ${cells}
      </tr>
    `;
  }

  getAllMetrics() {
    const metricIds = new Set();

    this._evaluations.forEach((evaluation) => {
      evaluation.metrics.forEach((metric) => {
        metricIds.add(metric.id);
      });
    });

    return Array.from(metricIds);
  }
}

// Register the custom element
customElements.define('comparison-table', ComparisonTable);
