/**
 * MetricDisplay Web Component
 * Displays a single metric card with value, score, grade, and explanation
 */

import './MetricInfoModal.js';

export class MetricDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._metric = null;
  }

  get metric() {
    return this._metric;
  }

  set metric(value) {
    this._metric = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  setupEventListeners() {
    const infoButton = this.shadowRoot.querySelector('.info-button');
    const modal = this.shadowRoot.querySelector('metric-info-modal');

    if (infoButton && modal) {
      infoButton.addEventListener('click', () => {
        modal.open();
      });
    }
  }

  // eslint-disable-next-line max-lines-per-function -- Web Component render methods combine styles and markup
  render() {
    if (!this._metric) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const gradeClass = this.getGradeClass(this._metric.grade);
    const confidenceText = this.getConfidenceText(this._metric.confidence);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .metric-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e1e4e8);
          border-radius: var(--border-radius, 8px);
          padding: var(--spacing-md, 1rem);
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
          transition: var(--transition-fast, 150ms ease);
        }

        .metric-card:hover {
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
          transform: translateY(-2px);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm, 0.5rem);
        }

        .metric-name {
          margin: 0;
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
        }

        .info-button {
          background: none;
          border: none;
          color: var(--color-text-secondary, #586069);
          cursor: pointer;
          padding: var(--spacing-xs, 0.25rem);
          font-size: var(--font-size-lg, 1.125rem);
          line-height: 1;
          transition: var(--transition-fast, 150ms ease);
          border-radius: var(--border-radius-sm, 4px);
        }

        .info-button:hover {
          background-color: var(--color-surface-alt, #f6f8fa);
          color: var(--color-text-primary, #24292e);
        }

        .info-button:focus {
          outline: 2px solid var(--color-info, #0366d6);
          outline-offset: 2px;
        }

        .metric-value {
          font-size: var(--font-size-2xl, 2rem);
          font-weight: 700;
          color: var(--color-text-primary, #24292e);
          margin: var(--spacing-sm, 0.5rem) 0;
        }

        .metric-score {
          display: inline-block;
          font-size: var(--font-size-md, 1rem);
          font-weight: 600;
          margin-right: var(--spacing-sm, 0.5rem);
          color: var(--color-text-secondary, #586069);
        }

        .metric-grade {
          display: inline-block;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          border-radius: var(--border-radius-sm, 4px);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: 600;
          text-transform: uppercase;
        }

        .metric-explanation {
          margin: var(--spacing-md, 1rem) 0 var(--spacing-sm, 0.5rem);
          font-size: var(--font-size-sm, 0.875rem);
          color: var(--color-text-secondary, #586069);
          line-height: 1.5;
        }

        .confidence-indicator {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-text-tertiary, #6a737d);
          font-style: italic;
        }

        /* Grade-specific styles */
        .grade-a-plus .metric-grade,
        .grade-excellent .metric-grade {
          background-color: var(--color-success-light, #dcffe4);
          color: var(--color-success-dark, #22863a);
          border: 1px solid var(--color-success, #28a745);
        }

        .grade-a .metric-grade,
        .grade-good .metric-grade {
          background-color: var(--color-info-light, #dbedff);
          color: var(--color-info-dark, #005cc5);
          border: 1px solid var(--color-info, #0366d6);
        }

        .grade-b .metric-grade,
        .grade-fair .metric-grade {
          background-color: var(--color-warning-light, #fff5b1);
          color: var(--color-warning-dark, #735c0f);
          border: 1px solid var(--color-warning, #ffd33d);
        }

        .grade-c .metric-grade,
        .grade-d .metric-grade,
        .grade-poor .metric-grade {
          background-color: var(--color-danger-light, #ffe3e6);
          color: var(--color-danger-dark, #cb2431);
          border: 1px solid var(--color-danger, #d73a49);
        }

        .grade-f .metric-grade,
        .grade-fail .metric-grade {
          background-color: var(--color-danger-light, #ffe3e6);
          color: var(--color-danger-dark, #cb2431);
          border: 1px solid var(--color-danger, #d73a49);
        }

        .grade-pass .metric-grade {
          background-color: var(--color-success-light, #dcffe4);
          color: var(--color-success-dark, #22863a);
          border: 1px solid var(--color-success, #28a745);
        }
      </style>

      <article
        class="metric-card ${gradeClass}"
        role="article"
        aria-label="${this._metric.name} metric: ${this._metric.value}, grade ${this._metric.grade}"
      >
        <div class="metric-header">
          <h3 class="metric-name">${this._metric.name}</h3>
          <button class="info-button" aria-label="View ${this._metric.name} information">ⓘ</button>
        </div>
        <div class="metric-value">${this.formatValue(this._metric.value)}</div>
        <div>
          <span class="metric-score">Score: ${this._metric.score}/100</span>
          <span class="metric-grade">${this._metric.grade}</span>
        </div>
        <p class="metric-explanation">${this._metric.explanation}</p>
        <div class="confidence-indicator">Confidence: ${confidenceText}</div>
      </article>

      <metric-info-modal></metric-info-modal>
    `;

    // Set up modal with metric data and event listeners
    const modal = this.shadowRoot.querySelector('metric-info-modal');
    if (modal) {
      modal.metric = this._metric;
    }
    this.setupEventListeners();
  }

  getGradeClass(grade) {
    const gradeMap = {
      'A+': 'grade-a-plus',
      'A': 'grade-a',
      'B': 'grade-b',
      'C': 'grade-c',
      'D': 'grade-d',
      'F': 'grade-f',
      'Excellent': 'grade-excellent',
      'Good': 'grade-good',
      'Fair': 'grade-fair',
      'Poor': 'grade-poor',
      'Pass': 'grade-pass',
      'Fail': 'grade-fail',
    };
    return gradeMap[grade] || 'grade-unknown';
  }

  getConfidenceText(confidence) {
    const confidenceMap = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };
    return confidenceMap[confidence] || 'Unknown';
  }

  formatValue(value) {
    if (value === null) {
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
}

// Register the custom element
customElements.define('metric-display', MetricDisplay);
