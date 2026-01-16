/**
 * MetricChart Web Component
 * Visualizes metric category scores using Chart.js with lazy loading
 * Chart.js (~60KB) is loaded dynamically only when chart is rendered
 */

export class MetricChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._categoryBreakdown = null;
    this._chartInstance = null;
    this._chartLoaded = false;
  }

  /**
   * Set category breakdown data
   * @param {Object} value - Category breakdown object { category: { score, metrics } }
   */
  set categoryBreakdown(value) {
    this._categoryBreakdown = value;
    if (this.isConnected) {
      this.render();
    }
  }

  get categoryBreakdown() {
    return this._categoryBreakdown;
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    // Clean up chart instance when component is removed
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }
  }

  /**
   * Render the chart with loading state
   */
  async render() {
    if (!this._categoryBreakdown) {
      this._renderEmptyState();
      return;
    }

    // Show loading state while Chart.js loads
    this._renderLoadingState();

    try {
      // Lazy load Chart.js (~60KB gzipped) - only loads when chart is needed
      if (!this._chartLoaded) {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);
        this._chartLoaded = true;
      }

      // Render the chart
      await this._renderChart();
    } catch (error) {
      console.error('Failed to load chart:', error);
      this._renderErrorState();
    }
  }

  /**
   * Render empty state when no data available
   */
  _renderEmptyState() {
    this.shadowRoot.innerHTML = `
      <style>
        .empty-state {
          padding: var(--spacing-lg, 1.5rem);
          text-align: center;
          color: var(--color-text-secondary, #586069);
          font-size: var(--font-size-sm, 0.875rem);
        }
      </style>
      <div class="empty-state">No category data available for visualization</div>
    `;
  }

  /**
   * Render loading state while Chart.js loads
   */
  _renderLoadingState() {
    this.shadowRoot.innerHTML = `
      <style>
        .loading-state {
          padding: var(--spacing-lg, 1.5rem);
          text-align: center;
          color: var(--color-text-secondary, #586069);
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid var(--color-border, #e1e4e8);
          border-top-color: var(--color-primary, #0366d6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="loading-state">
        <div class="spinner" role="status" aria-label="Loading chart"></div>
        <p>Loading visualization...</p>
      </div>
    `;
  }

  /**
   * Render error state if Chart.js fails to load
   */
  _renderErrorState() {
    this.shadowRoot.innerHTML = `
      <style>
        .error-state {
          padding: var(--spacing-lg, 1.5rem);
          text-align: center;
          color: var(--color-danger, #d73a49);
          font-size: var(--font-size-sm, 0.875rem);
        }
      </style>
      <div class="error-state">Failed to load chart visualization</div>
    `;
  }

  /**
   * Render the actual Chart.js chart
   */
  async _renderChart() {
    const { Chart } = await import('chart.js');

    // Prepare data for chart
    const categories = Object.keys(this._categoryBreakdown);
    const scores = categories.map((cat) => this._categoryBreakdown[cat].score);

    // Create canvas element
    this._renderChartContainer();

    const canvas = this.shadowRoot.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    // Destroy previous chart instance if it exists
    if (this._chartInstance) {
      this._chartInstance.destroy();
    }

    // Create new chart with configuration
    const chartConfig = this._getChartConfig(categories, scores);
    this._chartInstance = new Chart(ctx, chartConfig);
  }

  /**
   * Render the chart container HTML
   */
  _renderChartContainer() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .chart-container {
          position: relative;
          padding: var(--spacing-md, 1rem);
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e1e4e8);
          border-radius: var(--border-radius, 8px);
        }

        .chart-title {
          margin: 0 0 var(--spacing-md, 1rem);
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          color: var(--color-text-primary, #24292e);
          text-align: center;
        }

        canvas {
          max-height: 300px;
        }
      </style>

      <div class="chart-container">
        <h3 class="chart-title">Category Score Distribution</h3>
        <canvas
          role="img"
          aria-label="Bar chart showing category scores"
        ></canvas>
      </div>
    `;
  }

  /**
   * Get Chart.js configuration object
   */
  // eslint-disable-next-line max-lines-per-function -- Chart.js config object is inherently verbose
  _getChartConfig(categories, scores) {
    return {
      type: 'bar',
      data: {
        labels: categories.map((cat) => this._formatCategoryName(cat)),
        datasets: [
          {
            label: 'Score',
            data: scores,
            backgroundColor: scores.map((score) => this._getScoreColor(score)),
            borderColor: scores.map((score) => this._getScoreBorderColor(score)),
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Score: ${context.parsed.y}/100`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
            },
            title: {
              display: true,
              text: 'Score (out of 100)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Category',
            },
          },
        },
      },
    };
  }

  /**
   * Format category name for display
   */
  _formatCategoryName(category) {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get color based on score
   */
  _getScoreColor(score) {
    if (score >= 90) return 'rgba(40, 167, 69, 0.6)'; // Green (A)
    if (score >= 80) return 'rgba(3, 102, 214, 0.6)'; // Blue (B)
    if (score >= 70) return 'rgba(255, 211, 61, 0.6)'; // Yellow (C)
    return 'rgba(215, 58, 73, 0.6)'; // Red (D/F)
  }

  /**
   * Get border color based on score
   */
  _getScoreBorderColor(score) {
    if (score >= 90) return 'rgb(40, 167, 69)'; // Green (A)
    if (score >= 80) return 'rgb(3, 102, 214)'; // Blue (B)
    if (score >= 70) return 'rgb(255, 211, 61)'; // Yellow (C)
    return 'rgb(215, 58, 73)'; // Red (D/F)
  }
}

// Define the custom element
customElements.define('metric-chart', MetricChart);
