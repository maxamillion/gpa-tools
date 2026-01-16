/**
 * MetricDetailModal - Web Component for detailed metric information
 * Full-screen modal dialog with comprehensive metric details, thresholds, and examples
 * WCAG 2.1 AA compliant with focus management and keyboard navigation
 */

export class MetricDetailModal extends HTMLElement {
  constructor() {
    super();
    this._metric = null;
    this._isOpen = false;
    this._previousFocus = null;
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Check if the modal is currently open
   */
  get isOpen() {
    return this._isOpen;
  }

  connectedCallback() {
    this.render();
    this._attachEventListeners();
  }

  disconnectedCallback() {
    // Clean up event listeners
    document.removeEventListener('keydown', this._escapeHandler);

    // Restore body scroll if modal was open when disconnected
    if (this._isOpen) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Open the modal with metric data
   * @param {Object} metric - Metric object with details to display
   */
  open(metric) {
    this._metric = metric;
    this._isOpen = true;
    this._previousFocus = document.activeElement;

    // Update modal content
    this.render();

    // Add open class for styling
    this.classList.add('open');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus on close button
    requestAnimationFrame(() => {
      const closeButton = this.shadowRoot.querySelector('.close-button');
      if (closeButton) {
        closeButton.focus();
      }
    });

    // Dispatch opened event
    this.dispatchEvent(
      new CustomEvent('modal-opened', {
        detail: { metric: this._metric },
        bubbles: true,
      })
    );
  }

  /**
   * Close the modal
   */
  close() {
    this._isOpen = false;

    // Remove open class
    this.classList.remove('open');

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus to previous element
    if (this._previousFocus && this._previousFocus.focus) {
      this._previousFocus.focus();
    }

    // Dispatch closed event
    this.dispatchEvent(
      new CustomEvent('modal-closed', {
        bubbles: true,
      })
    );
  }

  /**
   * Render the modal component
   */
  render() {
    const modalId = this._metric ? `modal-${this._metric.id}` : 'modal';
    const titleId = `${modalId}-title`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
        }

        :host(.open) {
          display: block;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-lg, 20px);
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          position: relative;
          background-color: var(--color-background, #fff);
          border-radius: var(--border-radius, 8px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: var(--spacing-xl, 32px);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .close-button {
          position: absolute;
          top: var(--spacing-md, 16px);
          right: var(--spacing-md, 16px);
          width: 32px;
          height: 32px;
          border: none;
          background-color: transparent;
          color: var(--color-text-secondary, #666);
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover,
        .close-button:focus {
          background-color: var(--color-background-light, #f5f5f5);
          color: var(--color-text-primary, #333);
          outline: 2px solid var(--color-primary, #0066cc);
          outline-offset: 2px;
        }

        .modal-header {
          margin-bottom: var(--spacing-lg, 24px);
          padding-bottom: var(--spacing-md, 16px);
          border-bottom: 2px solid var(--color-border, #e0e0e0);
        }

        .modal-title {
          margin: 0 0 var(--spacing-xs, 8px) 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-primary, #333);
        }

        .modal-category {
          display: inline-block;
          padding: var(--spacing-xs, 4px) var(--spacing-sm, 12px);
          background-color: var(--color-primary-light, #e6f2ff);
          color: var(--color-primary, #0066cc);
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
        }

        .modal-body {
          margin-bottom: var(--spacing-lg, 24px);
        }

        .section {
          margin-bottom: var(--spacing-lg, 24px);
        }

        .section-title {
          margin: 0 0 var(--spacing-sm, 12px) 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary, #333);
        }

        .metric-explanation {
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-text-secondary, #555);
        }

        .current-score {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md, 16px);
          padding: var(--spacing-md, 16px);
          background-color: var(--color-background-light, #f9f9f9);
          border-radius: var(--border-radius, 8px);
        }

        .score-item {
          text-align: center;
        }

        .score-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-text-secondary, #666);
          margin-bottom: var(--spacing-xs, 4px);
        }

        .score-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary, #0066cc);
        }

        .threshold-section {
          padding: var(--spacing-md, 16px);
          background-color: var(--color-background-light, #f9f9f9);
          border-radius: var(--border-radius, 8px);
        }

        .threshold-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: var(--spacing-sm, 12px);
        }

        .threshold-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 12px);
          padding: var(--spacing-sm, 12px);
          background-color: white;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .threshold-item.excellent { border-color: #4ade80; }
        .threshold-item.good { border-color: #a3e635; }
        .threshold-item.fair { border-color: #fbbf24; }
        .threshold-item.poor { border-color: #f87171; }

        .threshold-label {
          font-weight: 600;
          min-width: 90px;
          text-transform: capitalize;
        }

        .threshold-value {
          color: var(--color-text-secondary, #666);
        }

        .examples-section {
          padding: var(--spacing-md, 16px);
          background-color: var(--color-background-light, #f9f9f9);
          border-radius: var(--border-radius, 8px);
        }

        .examples-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: var(--spacing-sm, 10px);
        }

        .examples-list li {
          padding-left: var(--spacing-md, 20px);
          position: relative;
          line-height: 1.5;
          color: var(--color-text-secondary, #555);
        }

        .examples-list li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--color-primary, #0066cc);
          font-weight: bold;
        }

        .chaoss-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs, 6px);
          padding: var(--spacing-sm, 12px) var(--spacing-md, 20px);
          background-color: var(--color-primary, #0066cc);
          color: white;
          text-decoration: none;
          border-radius: var(--border-radius, 6px);
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .chaoss-link:hover,
        .chaoss-link:focus {
          background-color: var(--color-primary-dark, #0052a3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
          outline: 2px solid var(--color-primary-light, #4d94ff);
          outline-offset: 2px;
        }

        .chaoss-link::after {
          content: '↗';
        }

        @media (max-width: 600px) {
          .modal-content {
            padding: var(--spacing-lg, 24px);
          }

          .modal-title {
            font-size: 24px;
          }

          .current-score {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="modal-overlay" role="presentation">
        <div
          class="modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="${titleId}"
        >
          <button
            class="close-button"
            aria-label="Close modal"
            tabindex="0"
          >
            ×
          </button>

          ${this._metric ? this._renderModalContent(titleId) : ''}
        </div>
      </div>
    `;

    this._attachEventListeners();
  }

  /**
   * Render the modal content based on metric data
   */
  _renderModalContent(titleId) {
    if (!this._metric) return '';

    return `
      <div class="modal-header">
        <h2 class="modal-title" id="${titleId}">
          ${this._metric.name}
        </h2>
        <span class="modal-category">${this._metric.category}</span>
      </div>

      <div class="modal-body">
        <!-- Explanation Section -->
        <section class="section">
          <h3 class="section-title">What This Metric Measures</h3>
          <p class="metric-explanation">
            ${this._metric.explanation}
          </p>
        </section>

        <!-- Current Score Section -->
        ${
          this._metric.value !== undefined || this._metric.score !== undefined || this._metric.grade !== undefined
            ? `
        <section class="section">
          <h3 class="section-title">Current Score</h3>
          <div class="current-score">
            ${this._metric.value !== undefined ? `<div class="score-item"><span class="score-label">Value</span><span class="score-value">${this._metric.value}</span></div>` : ''}
            ${this._metric.score !== undefined ? `<div class="score-item"><span class="score-label">Score</span><span class="score-value">${this._metric.score}</span></div>` : ''}
            ${this._metric.grade !== undefined ? `<div class="score-item"><span class="score-label">Grade</span><span class="score-value">${this._metric.grade}</span></div>` : ''}
          </div>
        </section>
        `
            : ''
        }

        <!-- Thresholds Section -->
        ${this._metric.threshold ? this._renderThresholds() : ''}

        <!-- Examples Section -->
        ${this._metric.examples ? this._renderExamples() : ''}

        <!-- CHAOSS Link Section -->
        ${
          this._metric.chaossLink
            ? `
        <section class="section">
          <a
            href="${this._metric.chaossLink}"
            target="_blank"
            rel="noopener noreferrer"
            class="chaoss-link"
          >
            Learn More on CHAOSS
          </a>
        </section>
        `
            : ''
        }
      </div>
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
      <section class="section threshold-section">
        <h3 class="section-title">Score Thresholds</h3>
        <ul class="threshold-list">
          ${levels
            .filter((level) => thresholds[level])
            .map(
              (level) => `
            <li class="threshold-item ${level}">
              <span class="threshold-label">${level}</span>
              <span class="threshold-value">${thresholds[level]}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </section>
    `;
  }

  /**
   * Render examples section
   */
  _renderExamples() {
    if (!this._metric.examples || this._metric.examples.length === 0) return '';

    return `
      <section class="section examples-section">
        <h3 class="section-title">Real-World Examples</h3>
        <ul class="examples-list">
          ${this._metric.examples.map((example) => `<li>${example}</li>`).join('')}
        </ul>
      </section>
    `;
  }

  /**
   * Attach event listeners for modal interactions
   */
  _attachEventListeners() {
    // Remove old listeners first
    if (this._boundEscapeHandler) {
      document.removeEventListener('keydown', this._boundEscapeHandler);
    }

    // Get elements
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    const content = this.shadowRoot.querySelector('.modal-content');
    const closeButton = this.shadowRoot.querySelector('.close-button');

    if (!overlay || !content || !closeButton) return;

    // Close button click
    closeButton.addEventListener('click', () => this.close());

    // Overlay click (but not content click)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    // Prevent clicks inside content from closing modal
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Escape key to close
    this._boundEscapeHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        e.preventDefault();
        this.close();
      }
    };

    document.addEventListener('keydown', this._boundEscapeHandler);
  }
}

// Define the custom element
customElements.define('metric-detail-modal', MetricDetailModal);
