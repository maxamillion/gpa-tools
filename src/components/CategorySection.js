/**
 * Category Section Web Component
 *
 * Displays a category of metrics with expandable details.
 */

export class CategorySection extends HTMLElement {
  constructor() {
    super();
    this.data = null;
    this.isOpen = false;
  }

  /**
   * Set the component data and render
   * @param {Object} data - Category data with metrics
   */
  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    if (!this.data) {
      return;
    }

    const { name, icon, description, grade, gradeColor, weight, metrics } = this.data;
    const gradeClass = gradeColor.replace('grade-', '');

    this.innerHTML = `
      <details class="category-section" ${this.isOpen ? 'open' : ''}>
        <summary class="category-header" role="button" aria-expanded="${this.isOpen}">
          <div class="category-title">
            <span class="category-icon" aria-hidden="true">${icon}</span>
            <span>${this.escapeHtml(name)}</span>
            <span class="category-weight">(${Math.round(weight * 100)}% weight)</span>
          </div>
          <div class="category-score">
            <span class="category-grade grade-${gradeClass}">${grade}</span>
            <span class="expand-icon" aria-hidden="true">▼</span>
          </div>
        </summary>
        <div class="category-content">
          <p class="category-description">${this.escapeHtml(description)}</p>
          <div class="metrics-list">
            ${metrics.map(metric => this.renderMetric(metric)).join('')}
          </div>
        </div>
      </details>
    `;

    // Track open state
    const details = this.querySelector('details');
    details.addEventListener('toggle', () => {
      this.isOpen = details.open;
    });

    this.addStyles();
  }

  renderMetric(metric) {
    const scoreClass = metric.level?.class || 'score-fair';
    const isBoolean = metric.isBoolean || metric.type === 'boolean';

    return `
      <div class="metric-item" data-metric-id="${metric.id}">
        <div class="metric-info">
          <div class="metric-name">${this.escapeHtml(metric.name)}</div>
          <div class="metric-description">${this.escapeHtml(metric.description)}</div>
          ${metric.note ? `<div class="metric-note">${this.escapeHtml(metric.note)}</div>` : ''}
        </div>
        <div class="metric-value">
          <span class="metric-raw">${this.escapeHtml(String(metric.displayValue))}</span>
          ${isBoolean ? `
            <span class="${metric.rawValue ? 'metric-pass' : 'metric-fail'}" aria-label="${metric.rawValue ? 'Pass' : 'Fail'}">
              ${metric.rawValue ? '✓' : '✗'}
            </span>
          ` : `
            <span class="metric-score ${scoreClass}" aria-label="Score: ${Math.round(metric.score)}">
              ${Math.round(metric.score)}
            </span>
          `}
        </div>
      </div>
    `;
  }

  addStyles() {
    // Add component-specific styles if not already present
    if (document.querySelector('#category-section-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'category-section-styles';
    style.textContent = `
      .category-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-4);
      }

      .metrics-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .metric-note {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        font-style: italic;
        margin-top: var(--space-1);
      }

      .metric-pass {
        color: var(--color-success);
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-lg);
      }

      .metric-fail {
        color: var(--color-error);
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-lg);
      }
    `;
    document.head.appendChild(style);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
