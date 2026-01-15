/**
 * CategorySection Web Component
 * Displays metrics grouped by category with statistics
 */

import './MetricDisplay.js';

export class CategorySection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._category = null;
    this._metrics = null;
  }

  get category() {
    return this._category;
  }

  set category(value) {
    this._category = value;
    this.render();
  }

  get metrics() {
    return this._metrics;
  }

  set metrics(value) {
    this._metrics = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function -- Web Component render methods combine styles and markup
  render() {
    if (!this._category || !this._metrics) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const categoryTitle = this.getCategoryTitle(this._category);
    const stats = this.calculateStats();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .category-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg, 1.5rem);
          padding-bottom: var(--spacing-md, 1rem);
          border-bottom: 2px solid var(--color-border, #e1e4e8);
        }

        .category-title {
          margin: 0;
          font-size: var(--font-size-xl, 1.5rem);
          font-weight: 700;
          color: var(--color-text-primary, #24292e);
        }

        .category-stats {
          font-size: var(--font-size-sm, 0.875rem);
          color: var(--color-text-secondary, #586069);
        }

        .stat-label {
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg, 1.5rem);
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <section
        class="category-section"
        role="region"
        aria-label="${categoryTitle}"
      >
        <div class="category-header">
          <h2 class="category-title">${categoryTitle}</h2>
          <div class="category-stats">
            <span class="stat-label">${stats.count} metrics</span>
            ${stats.count > 0 ? ` | Avg: <span class="stat-label">${stats.avgScore}/100</span>` : ''}
          </div>
        </div>

        <div class="metrics-grid">
          ${this.renderMetrics()}
        </div>
      </section>
    `;

    // Set metric data on metric-display components
    const metricCards = this.shadowRoot.querySelectorAll('metric-display');
    this._metrics.forEach((metric, index) => {
      if (metricCards[index]) {
        metricCards[index].metric = metric;
      }
    });
  }

  renderMetrics() {
    return this._metrics.map(() => '<metric-display></metric-display>').join('');
  }

  getCategoryTitle(category) {
    const titleMap = {
      activity: 'Activity Metrics',
      community: 'Community Metrics',
      maintenance: 'Maintenance Metrics',
      documentation: 'Documentation Metrics',
      security: 'Security & Governance Metrics',
    };
    return titleMap[category] || 'Metrics';
  }

  calculateStats() {
    if (!this._metrics || this._metrics.length === 0) {
      return { count: 0, avgScore: 0 };
    }

    const totalScore = this._metrics.reduce((sum, metric) => sum + metric.score, 0);
    const avgScore = Math.round(totalScore / this._metrics.length);

    return {
      count: this._metrics.length,
      avgScore,
    };
  }
}

// Register the custom element
customElements.define('category-section', CategorySection);
