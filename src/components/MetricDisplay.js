/**
 * MetricDisplay Web Component
 * Displays a single metric card with value, score, grade, and explanation
 */

import './MetricDetailModal.js';
import './MetricTooltip.js';

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
    const modal = this.shadowRoot.querySelector('metric-detail-modal');

    if (infoButton && modal) {
      infoButton.addEventListener('click', () => {
        // Open modal with full metric data including examples and thresholds
        modal.open({
          id: this._metric.id,
          name: this._metric.name,
          category: this._metric.category,
          explanation: this._metric.explanation,
          value: this._metric.value,
          score: this._metric.score,
          grade: this._metric.grade,
          chaossLink: this._metric.chaossLink,
          threshold: this._metric.threshold,
          examples: this._metric.examples,
        });
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
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.5rem);
        }

        metric-tooltip {
          display: inline-flex;
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

        .supporting-evidence {
          margin-top: var(--spacing-sm, 0.5rem);
          padding: var(--spacing-sm, 0.5rem);
          background-color: var(--color-surface-alt, #f6f8fa);
          border-radius: var(--border-radius-sm, 4px);
          font-size: var(--font-size-sm, 0.875rem);
        }

        .supporting-evidence summary {
          cursor: pointer;
          font-weight: 600;
          color: var(--color-text-secondary, #586069);
          user-select: none;
        }

        .supporting-evidence summary:hover {
          color: var(--color-text-primary, #24292e);
        }

        .supporting-evidence p {
          margin: var(--spacing-xs, 0.25rem) 0 0;
          color: var(--color-text-secondary, #586069);
          line-height: 1.5;
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

        .grade-manual-review-needed .metric-grade {
          background-color: var(--color-warning-light, #fff5b1);
          color: var(--color-warning-dark, #735c0f);
          border: 1px solid var(--color-warning, #ffd33d);
        }

        /* Threshold Visualization */
        .threshold-visualization {
          margin: var(--spacing-md, 1rem) 0;
        }

        .threshold-title {
          font-size: var(--font-size-xs, 0.75rem);
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-text-secondary, #586069);
          margin-bottom: var(--spacing-xs, 0.25rem);
          letter-spacing: 0.5px;
        }

        .threshold-bar {
          position: relative;
          display: flex;
          height: 32px;
          border-radius: var(--border-radius, 8px);
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .threshold-segment {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xs, 0.75rem);
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          transition: var(--transition-fast, 150ms ease);
        }

        .threshold-segment:hover {
          filter: brightness(1.1);
        }

        .threshold-segment.poor {
          background-color: var(--color-danger, #d73a49);
        }

        .threshold-segment.fair {
          background-color: var(--color-warning, #ffd33d);
          color: var(--color-warning-dark, #735c0f);
        }

        .threshold-segment.good {
          background-color: var(--color-info, #0366d6);
        }

        .threshold-segment.excellent {
          background-color: var(--color-success, #28a745);
        }

        .score-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background-color: white;
          border: 3px solid var(--color-text-primary, #24292e);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          z-index: 10;
        }

        .score-marker::after {
          content: attr(data-score);
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--color-text-primary, #24292e);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: var(--font-size-xs, 0.75rem);
          font-weight: 700;
          white-space: nowrap;
        }

        .threshold-labels {
          display: flex;
          justify-content: space-between;
          margin-top: var(--spacing-xs, 0.25rem);
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-text-tertiary, #6a737d);
        }

        .threshold-label {
          text-align: center;
          font-weight: 500;
        }
      </style>

      <article
        class="metric-card ${gradeClass}"
        role="article"
        aria-label="${this._metric.name} metric: ${this._metric.value}, grade ${this._metric.grade}"
      >
        <div class="metric-header">
          <h3 class="metric-name">
            ${this._metric.name}
            <metric-tooltip id="tooltip-${this._metric.id}"></metric-tooltip>
          </h3>
          <button class="info-button" aria-label="View detailed ${this._metric.name} information">ⓘ</button>
        </div>
        <div class="metric-value">${this.formatValue(this._metric.value)}</div>
        <div>
          <span class="metric-score">Score: ${this._metric.score}/100</span>
          <span class="metric-grade">${this._metric.grade}</span>
        </div>
        ${this._metric.score !== null && this._metric.score !== undefined ? this._renderThresholdVisualization() : ''}
        <p class="metric-explanation">${this._metric.explanation}</p>
        <div class="confidence-indicator">Confidence: ${confidenceText}</div>
        ${this._metric.supportingEvidence ? `
          <details class="supporting-evidence">
            <summary>Supporting Evidence</summary>
            <p>${this._metric.supportingEvidence}</p>
          </details>
        ` : ''}
      </article>

      <metric-detail-modal id="modal-${this._metric.id}"></metric-detail-modal>
    `;

    // Set up tooltip with metric data
    const tooltip = this.shadowRoot.querySelector('metric-tooltip');
    if (tooltip) {
      tooltip.metric = {
        id: this._metric.id,
        name: this._metric.name,
        category: this._metric.category,
        explanation: this._metric.explanation,
        chaossLink: this._metric.chaossLink,
        threshold: this._metric.threshold,
      };
    }

    // Set up event listeners for modal
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
      'manual-review-needed': 'grade-manual-review-needed',
      'Manual Review Needed': 'grade-manual-review-needed',
    };
    return gradeMap[grade] || 'grade-unknown';
  }

  getConfidenceText(confidence) {
    const confidenceMap = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      definite: 'Definite',
      likely: 'Likely',
      'manual-review-needed': 'Manual Review Needed',
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

  /**
   * Render threshold visualization bar showing score ranges
   * @returns {string} HTML string for threshold visualization
   */
  _renderThresholdVisualization() {
    const score = this._metric.score;

    // Skip visualization if score is N/A or invalid
    if (score === null || score === undefined || score < 0 || score > 100) {
      return '';
    }

    // Calculate score position as percentage (0-100)
    const scorePosition = score;

    return `
      <div class="threshold-visualization" role="img" aria-label="Score visualization: ${score} out of 100">
        <div class="threshold-title">Score Range</div>
        <div class="threshold-bar">
          <div class="threshold-segment poor" title="Poor: 0-50">Poor</div>
          <div class="threshold-segment fair" title="Fair: 50-70">Fair</div>
          <div class="threshold-segment good" title="Good: 70-85">Good</div>
          <div class="threshold-segment excellent" title="Excellent: 85-100">Excellent</div>
          <div class="score-marker" data-score="${score}" style="left: ${scorePosition}%"></div>
        </div>
        <div class="threshold-labels">
          <span class="threshold-label">0</span>
          <span class="threshold-label">50</span>
          <span class="threshold-label">70</span>
          <span class="threshold-label">85</span>
          <span class="threshold-label">100</span>
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('metric-display', MetricDisplay);
