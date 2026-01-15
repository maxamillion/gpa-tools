/**
 * MetricInfoModal Web Component
 * Displays detailed information about a metric in a modal dialog
 */

export class MetricInfoModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._metric = null;
    this._isOpen = false;
  }

  get metric() {
    return this._metric;
  }

  set metric(value) {
    this._metric = value;
    if (this._isOpen) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  open() {
    this._isOpen = true;
    this.render();
    const dialog = this.shadowRoot.querySelector('dialog');
    if (dialog && !dialog.hasAttribute('open')) {
      // Use showModal() if available (browser), otherwise set attribute (testing)
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }
  }

  close() {
    this._isOpen = false;
    const dialog = this.shadowRoot.querySelector('dialog');
    if (dialog && dialog.hasAttribute('open')) {
      // Use close() if available (browser), otherwise remove attribute (testing)
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }

  setupEventListeners() {
    const dialog = this.shadowRoot.querySelector('dialog');
    if (!dialog) return;

    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        this.close();
      }
    });

    // Close on Escape key
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    // Close button
    const closeBtn = this.shadowRoot.querySelector('.close-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  // eslint-disable-next-line max-lines-per-function -- Web Component render methods combine styles and markup
  render() {
    if (!this._metric) {
      this.shadowRoot.innerHTML = '<dialog></dialog>';
      return;
    }

    const thresholdsHTML = this.renderThresholds();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        dialog {
          border: none;
          border-radius: var(--border-radius-lg, 12px);
          padding: 0;
          max-width: 600px;
          width: 90vw;
          box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
        }

        dialog::backdrop {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg, 1.5rem);
          border-bottom: 2px solid var(--color-border, #e1e4e8);
        }

        .modal-title {
          margin: 0;
          font-size: var(--font-size-xl, 1.5rem);
          font-weight: 700;
          color: var(--color-text-primary, #24292e);
        }

        .close-button {
          background: none;
          border: none;
          font-size: var(--font-size-2xl, 2rem);
          color: var(--color-text-secondary, #586069);
          cursor: pointer;
          padding: var(--spacing-xs, 0.25rem);
          line-height: 1;
          transition: var(--transition-fast, 150ms ease);
        }

        .close-button:hover {
          color: var(--color-text-primary, #24292e);
          transform: scale(1.1);
        }

        .modal-body {
          padding: var(--spacing-lg, 1.5rem);
        }

        .section {
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: var(--font-size-md, 1rem);
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
          margin: 0 0 var(--spacing-sm, 0.5rem);
        }

        .section-content {
          font-size: var(--font-size-md, 1rem);
          line-height: 1.6;
          color: var(--color-text-secondary, #586069);
        }

        .metric-explanation {
          font-size: var(--font-size-lg, 1.125rem);
          line-height: 1.6;
          color: var(--color-text-primary, #24292e);
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .why-it-matters {
          padding: var(--spacing-md, 1rem);
          background-color: var(--color-info-light, #dbedff);
          border-left: 4px solid var(--color-info, #0366d6);
          border-radius: var(--border-radius, 8px);
        }

        .threshold-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .threshold-item {
          display: flex;
          align-items: center;
          padding: var(--spacing-sm, 0.5rem);
          background-color: var(--color-surface-alt, #f6f8fa);
          border-radius: var(--border-radius, 8px);
        }

        .threshold-label {
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
        }

        .data-source {
          font-family: monospace;
          font-size: var(--font-size-sm, 0.875rem);
          padding: var(--spacing-sm, 0.5rem);
          background-color: var(--color-surface-alt, #f6f8fa);
          border-radius: var(--border-radius, 8px);
          overflow-x: auto;
        }
      </style>

      <dialog>
        <div class="modal-header">
          <h2 class="modal-title">${this._metric.name}</h2>
          <button class="close-button" aria-label="Close modal">&times;</button>
        </div>

        <div class="modal-body">
          <p class="metric-explanation">${this._metric.explanation}</p>

          <div class="section why-it-matters">
            <h3 class="section-title">Why It Matters</h3>
            <div class="section-content">${this._metric.whyItMatters}</div>
          </div>

          ${thresholdsHTML}

          <div class="section">
            <h3 class="section-title">Data Source</h3>
            <div class="data-source">${this._metric.dataSource}</div>
          </div>
        </div>
      </dialog>
    `;

    // Re-setup event listeners after rendering
    this.setupEventListeners();

    // Open dialog if should be open
    if (this._isOpen) {
      const dialog = this.shadowRoot.querySelector('dialog');
      if (dialog && !dialog.hasAttribute('open')) {
        // Use showModal() if available (browser), otherwise set attribute (testing)
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    }
  }

  renderThresholds() {
    if (!this._metric.threshold || Object.keys(this._metric.threshold).length === 0) {
      return '';
    }

    const thresholds = Object.entries(this._metric.threshold)
      .map(
        ([_key, value]) => `
        <div class="threshold-item">
          <span class="threshold-label">${value.label}</span>
        </div>
      `
      )
      .join('');

    return `
      <div class="section">
        <h3 class="section-title">Scoring Thresholds</h3>
        <div class="threshold-list">
          ${thresholds}
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('metric-info-modal', MetricInfoModal);
