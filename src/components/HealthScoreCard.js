/**
 * HealthScoreCard Web Component
 * Displays overall repository health score with category breakdown
 */

export class HealthScoreCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._score = null;
    this._grade = null;
    this._categoryBreakdown = null;
  }

  get score() {
    return this._score;
  }

  set score(value) {
    this._score = value;
    this.render();
  }

  get grade() {
    return this._grade;
  }

  set grade(value) {
    this._grade = value;
    this.render();
  }

  get categoryBreakdown() {
    return this._categoryBreakdown;
  }

  set categoryBreakdown(value) {
    this._categoryBreakdown = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function -- Web Component render methods combine styles and markup
  render() {
    if (this._score === null) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const gradeClass = this.getGradeClass(this._grade);
    const categoryHTML = this.renderCategoryBreakdown();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .health-card {
          background: linear-gradient(135deg, var(--color-surface, #ffffff) 0%, var(--color-surface-alt, #f6f8fa) 100%);
          border: 2px solid var(--color-border, #e1e4e8);
          border-radius: var(--border-radius-lg, 12px);
          padding: var(--spacing-xl, 2rem);
          box-shadow: var(--shadow-lg, 0 8px 16px rgba(0, 0, 0, 0.1));
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .card-title {
          margin: 0 0 var(--spacing-lg, 1.5rem);
          font-size: var(--font-size-2xl, 2rem);
          font-weight: 700;
          color: var(--color-text-primary, #24292e);
          text-align: center;
        }

        .score-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-lg, 1.5rem);
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .health-score {
          font-size: var(--font-size-4xl, 3.5rem);
          font-weight: 800;
          color: var(--color-text-primary, #24292e);
        }

        .score-separator {
          font-size: var(--font-size-2xl, 2rem);
          color: var(--color-text-tertiary, #6a737d);
        }

        .health-grade {
          display: inline-block;
          padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
          border-radius: var(--border-radius, 8px);
          font-size: var(--font-size-2xl, 2rem);
          font-weight: 700;
          text-transform: uppercase;
        }

        .progress-bar {
          width: 100%;
          height: 24px;
          background-color: var(--color-surface-alt, #f6f8fa);
          border-radius: var(--border-radius-lg, 12px);
          overflow: hidden;
          margin-bottom: var(--spacing-xl, 2rem);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary, #0366d6) 0%, var(--color-primary-light, #58a6ff) 100%);
          border-radius: var(--border-radius-lg, 12px);
          transition: width 0.6s ease, background-color 0.3s ease;
        }

        .category-breakdown {
          margin-top: var(--spacing-lg, 1.5rem);
        }

        .category-breakdown-title {
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
          margin-bottom: var(--spacing-md, 1rem);
        }

        .category-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e1e4e8);
          border-radius: var(--border-radius, 8px);
        }

        .category-name {
          font-size: var(--font-size-md, 1rem);
          font-weight: 500;
          color: var(--color-text-primary, #24292e);
          text-transform: capitalize;
        }

        .category-score {
          font-size: var(--font-size-md, 1rem);
          font-weight: 600;
          color: var(--color-text-secondary, #586069);
        }

        /* Grade-specific styles */
        .grade-a-plus .health-grade,
        .grade-a .health-grade {
          background-color: var(--color-success-light, #dcffe4);
          color: var(--color-success-dark, #22863a);
          border: 2px solid var(--color-success, #28a745);
        }

        .grade-a-plus .progress-fill,
        .grade-a .progress-fill {
          background: linear-gradient(90deg, var(--color-success, #28a745) 0%, var(--color-success-light, #dcffe4) 100%);
        }

        .grade-b .health-grade {
          background-color: var(--color-info-light, #dbedff);
          color: var(--color-info-dark, #005cc5);
          border: 2px solid var(--color-info, #0366d6);
        }

        .grade-b .progress-fill {
          background: linear-gradient(90deg, var(--color-info, #0366d6) 0%, var(--color-info-light, #dbedff) 100%);
        }

        .grade-c .health-grade {
          background-color: var(--color-warning-light, #fff5b1);
          color: var(--color-warning-dark, #735c0f);
          border: 2px solid var(--color-warning, #ffd33d);
        }

        .grade-c .progress-fill {
          background: linear-gradient(90deg, var(--color-warning, #ffd33d) 0%, var(--color-warning-light, #fff5b1) 100%);
        }

        .grade-d .health-grade,
        .grade-f .health-grade {
          background-color: var(--color-danger-light, #ffe3e6);
          color: var(--color-danger-dark, #cb2431);
          border: 2px solid var(--color-danger, #d73a49);
        }

        .grade-d .progress-fill,
        .grade-f .progress-fill {
          background: linear-gradient(90deg, var(--color-danger, #d73a49) 0%, var(--color-danger-light, #ffe3e6) 100%);
        }
      </style>

      <section
        class="health-card ${gradeClass}"
        role="region"
        aria-label="Overall health score: ${this._score} out of 100, grade ${this._grade}"
      >
        <h2 class="card-title">Overall Health Score</h2>

        <div class="score-display">
          <span class="health-score">${this._score}</span>
          <span class="score-separator">/</span>
          <span class="score-separator">100</span>
          <span class="health-grade">${this._grade}</span>
        </div>

        <div
          class="progress-bar"
          role="progressbar"
          aria-valuenow="${this._score}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-fill" style="width: ${this._score}%"></div>
        </div>

        ${categoryHTML}
      </section>
    `;
  }

  renderCategoryBreakdown() {
    if (!this._categoryBreakdown) {
      return '';
    }

    const categories = Object.entries(this._categoryBreakdown)
      .map(
        ([name, data]) => `
        <div class="category-item">
          <span class="category-name">${this.formatCategoryName(name)}</span>
          <span class="category-score">${data.score}/100</span>
        </div>
      `
      )
      .join('');

    return `
      <div class="category-breakdown">
        <h3 class="category-breakdown-title">Category Breakdown</h3>
        <div class="category-list">
          ${categories}
        </div>
      </div>
    `;
  }

  formatCategoryName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getGradeClass(grade) {
    if (!grade) return '';

    const gradeMap = {
      'A+': 'grade-a-plus',
      'A': 'grade-a',
      'B': 'grade-b',
      'C': 'grade-c',
      'D': 'grade-d',
      'F': 'grade-f',
    };
    return gradeMap[grade] || '';
  }
}

// Register the custom element
customElements.define('health-score-card', HealthScoreCard);
