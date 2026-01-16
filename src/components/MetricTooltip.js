/**
 * MetricTooltip - Web Component for displaying metric explanations
 * Provides hover/focus tooltips with metric details, CHAOSS links, and thresholds
 * WCAG 2.1 AA compliant with keyboard navigation support
 */

export class MetricTooltip extends HTMLElement {
  constructor() {
    super();
    this._metric = null;
    this._isVisible = false;
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Set the metric data to display in the tooltip
   * @param {Object} value - Metric object with id, name, category, explanation, chaossLink, threshold
   */
  set metric(value) {
    this._metric = value;
    this.render();
  }

  get metric() {
    return this._metric;
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Render the tooltip component
   */
  render() {
    const tooltipId = this._metric ? `tooltip-${this._metric.id}` : 'tooltip';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        .tooltip-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 50%;
          background-color: var(--color-background-light, #f5f5f5);
          color: var(--color-text-secondary, #666);
          font-size: 14px;
          font-weight: bold;
          cursor: help;
          transition: all 0.2s ease;
        }

        .tooltip-trigger:hover,
        .tooltip-trigger:focus {
          background-color: var(--color-primary, #0066cc);
          color: white;
          border-color: var(--color-primary, #0066cc);
          outline: 2px solid var(--color-primary-light, #4d94ff);
          outline-offset: 2px;
        }

        .tooltip-content {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background-color: var(--color-background-dark, #333);
          color: white;
          padding: var(--spacing-md, 12px);
          border-radius: var(--border-radius, 4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 250px;
          max-width: 400px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
        }

        .tooltip-content.visible {
          opacity: 1;
          visibility: visible;
        }

        .tooltip-content::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--color-background-dark, #333);
        }

        .tooltip-header {
          margin: 0 0 var(--spacing-sm, 8px) 0;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding-bottom: var(--spacing-xs, 4px);
        }

        .tooltip-category {
          display: inline-block;
          font-size: 12px;
          color: var(--color-primary-light, #4d94ff);
          margin-left: var(--spacing-xs, 4px);
          font-weight: normal;
        }

        .tooltip-explanation {
          margin: var(--spacing-sm, 8px) 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .threshold-info {
          margin-top: var(--spacing-md, 12px);
          padding-top: var(--spacing-sm, 8px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 13px;
        }

        .threshold-title {
          font-weight: 600;
          margin-bottom: var(--spacing-xs, 4px);
        }

        .threshold-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .threshold-list li {
          padding: 2px 0;
          display: flex;
          gap: var(--spacing-xs, 4px);
        }

        .threshold-label {
          font-weight: 500;
          min-width: 80px;
        }

        .threshold-label.excellent { color: #4ade80; }
        .threshold-label.good { color: #a3e635; }
        .threshold-label.fair { color: #fbbf24; }
        .threshold-label.poor { color: #f87171; }

        .chaoss-link {
          display: inline-block;
          margin-top: var(--spacing-sm, 8px);
          padding-top: var(--spacing-sm, 8px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 13px;
          color: var(--color-primary-light, #4d94ff);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .chaoss-link:hover,
        .chaoss-link:focus {
          color: #fff;
          text-decoration: underline;
        }

        .chaoss-link::after {
          content: ' ↗';
        }
      </style>

      <button
        class="tooltip-trigger"
        role="button"
        aria-label="${this._metric ? `More information about ${this._metric.name}` : 'More information'}"
        aria-describedby="${tooltipId}"
        tabindex="0"
      >
        ?
      </button>

      <div
        class="tooltip-content"
        role="tooltip"
        id="${tooltipId}"
      >
        ${this._metric ? this._renderTooltipContent() : ''}
      </div>
    `;

    this._attachEventListeners();
  }

  /**
   * Render the tooltip content based on metric data
   */
  _renderTooltipContent() {
    if (!this._metric) return '';

    return `
      <h4 class="tooltip-header">
        ${this._metric.name}
        <span class="tooltip-category">(${this._metric.category})</span>
      </h4>

      <p class="tooltip-explanation">
        ${this._metric.explanation}
      </p>

      ${this._metric.threshold ? this._renderThresholds() : ''}

      ${this._metric.chaossLink ? `
        <a
          href="${this._metric.chaossLink}"
          target="_blank"
          rel="noopener noreferrer"
          class="chaoss-link"
        >
          Learn more on CHAOSS
        </a>
      ` : ''}
    `;
  }

  /**
   * Render threshold information
   */
  _renderThresholds() {
    if (!this._metric.threshold) return '';

    const thresholds = this._metric.threshold;
    const levels = ['excellent', 'good', 'fair', 'poor'];

    return `
      <div class="threshold-info">
        <div class="threshold-title">Score Thresholds:</div>
        <ul class="threshold-list">
          ${levels
            .filter((level) => thresholds[level])
            .map(
              (level) => `
            <li>
              <span class="threshold-label ${level}">${level.charAt(0).toUpperCase() + level.slice(1)}:</span>
              <span>${thresholds[level]}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Attach event listeners for tooltip interactions
   */
  _attachEventListeners() {
    const trigger = this.shadowRoot.querySelector('.tooltip-trigger');
    const content = this.shadowRoot.querySelector('.tooltip-content');

    if (!trigger || !content) return;

    // Mouse events
    trigger.addEventListener('mouseenter', () => this._showTooltip());
    trigger.addEventListener('mouseleave', () => this._hideTooltip());

    // Focus events for keyboard navigation
    trigger.addEventListener('focus', () => this._showTooltip());
    trigger.addEventListener('blur', () => this._hideTooltip());

    // Keyboard events
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._toggleTooltip();
      }
    });

    // Escape key to close
    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isVisible) {
        e.preventDefault();
        this._hideTooltip();
        trigger.focus();
      }
    });
  }

  /**
   * Show the tooltip
   */
  _showTooltip() {
    const content = this.shadowRoot.querySelector('.tooltip-content');
    if (content) {
      content.classList.add('visible');
      this._isVisible = true;
    }
  }

  /**
   * Hide the tooltip
   */
  _hideTooltip() {
    const content = this.shadowRoot.querySelector('.tooltip-content');
    if (content) {
      content.classList.remove('visible');
      this._isVisible = false;
    }
  }

  /**
   * Toggle tooltip visibility
   */
  _toggleTooltip() {
    if (this._isVisible) {
      this._hideTooltip();
    } else {
      this._showTooltip();
    }
  }
}

// Define the custom element
customElements.define('metric-tooltip', MetricTooltip);
