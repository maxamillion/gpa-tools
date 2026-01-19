/**
 * Health Score Card Web Component
 *
 * Displays the overall health score and grade for a repository.
 */

export class HealthScoreCard extends HTMLElement {
  constructor() {
    super();
    this.data = null;
  }

  /**
   * Set the component data and render
   * @param {Object} data - Repository analysis results
   */
  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    if (!this.data) {
      return;
    }

    const { repository, healthScore } = this.data;
    const gradeClass = healthScore.gradeColor.replace('grade-', '');

    this.innerHTML = `
      <div class="health-score-card">
        <div class="repo-info">
          <h2 class="repo-name">
            <a href="${repository.url}" target="_blank" rel="noopener">
              ${this.escapeHtml(repository.fullName)}
            </a>
          </h2>
          ${repository.description ? `
            <p class="repo-description">${this.escapeHtml(repository.description)}</p>
          ` : ''}
          <div class="repo-stats">
            <span class="stat" title="Stars">
              <span aria-hidden="true">⭐</span> ${this.formatNumber(repository.stars)}
            </span>
            <span class="stat" title="Forks">
              <span aria-hidden="true">🍴</span> ${this.formatNumber(repository.forks)}
            </span>
          </div>
        </div>

        <div class="score-display" role="img" aria-label="Health Score: ${healthScore.score} out of 100, Grade: ${healthScore.grade}">
          <div class="grade-badge grade-${gradeClass}" aria-hidden="true">
            ${healthScore.grade}
          </div>
          <div class="score-details">
            <div class="score-value">${healthScore.score}</div>
            <div class="score-label">Health Score</div>
          </div>
        </div>

        <div class="progress-bar" role="progressbar" aria-valuenow="${healthScore.score}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill grade-${gradeClass}" style="width: ${healthScore.score}%"></div>
        </div>

        ${this.renderSummary(healthScore.summary)}
      </div>
    `;

    this.addStyles();
  }

  renderSummary(summary) {
    if (!summary) {
      return '';
    }

    let html = `<div class="summary-section">`;

    if (summary.text) {
      html += `<p class="summary-text">${this.escapeHtml(summary.text)}</p>`;
    }

    if (summary.strengths?.length > 0) {
      html += `
        <div class="summary-list strengths">
          <h4 class="summary-heading">
            <span aria-hidden="true">💪</span> Strengths
          </h4>
          <ul>
            ${summary.strengths.map(s => `
              <li>
                <span aria-hidden="true">${s.icon}</span>
                ${this.escapeHtml(s.category)} (${s.score})
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    if (summary.improvements?.length > 0) {
      html += `
        <div class="summary-list improvements">
          <h4 class="summary-heading">
            <span aria-hidden="true">📈</span> Areas for Improvement
          </h4>
          <ul>
            ${summary.improvements.map(s => `
              <li>
                <span aria-hidden="true">${s.icon}</span>
                ${this.escapeHtml(s.category)} (${s.score})
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  addStyles() {
    // Add component-specific styles if not already present
    if (document.querySelector('#health-score-card-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'health-score-card-styles';
    style.textContent = `
      .repo-stats {
        display: flex;
        gap: var(--space-4);
        justify-content: center;
        margin-top: var(--space-3);
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .stat {
        display: flex;
        align-items: center;
        gap: var(--space-1);
      }

      .score-details {
        text-align: left;
      }

      .summary-section {
        margin-top: var(--space-6);
        padding-top: var(--space-6);
        border-top: 1px solid var(--color-border);
        text-align: left;
      }

      .summary-text {
        color: var(--color-text-secondary);
        margin-bottom: var(--space-4);
      }

      .summary-list {
        margin-bottom: var(--space-4);
      }

      .summary-list:last-child {
        margin-bottom: 0;
      }

      .summary-heading {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin-bottom: var(--space-2);
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .summary-list ul {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }

      .summary-list li {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-1) var(--space-3);
        background: var(--color-bg-tertiary);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .strengths li {
        background: var(--color-success-bg);
        color: var(--color-success);
      }

      .improvements li {
        background: var(--color-warning-bg);
        color: var(--color-warning);
      }
    `;
    document.head.appendChild(style);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
