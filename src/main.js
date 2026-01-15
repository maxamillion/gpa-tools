/**
 * Main entry point for the Open Source Project Health Analyzer
 * Initializes the application and sets up event handlers
 */

import { parseRepoFromUrl } from './utils/urlParams.js';
import { EvaluationOrchestrator } from './services/evaluationOrchestrator.js';
import { HealthScoreCalculator } from './services/healthScoreCalculator.js';
import './components/HealthScoreCard.js';
import './components/CategorySection.js';

/**
 * Render evaluation results using Web Components
 */
function renderResults(evaluation, healthScore, container) {
  // Create health score card
  const healthScoreCard = document.createElement('health-score-card');
  healthScoreCard.score = healthScore.overallScore;
  healthScoreCard.grade = healthScore.overallGrade;
  healthScoreCard.categoryBreakdown = healthScore.categoryBreakdown;

  // Group metrics by category
  const metricsByCategory = evaluation.metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {});

  // Create category sections
  const categorySections = Object.entries(metricsByCategory).map(([category, metrics]) => {
    const section = document.createElement('category-section');
    section.category = category;
    section.metrics = metrics;
    return section;
  });

  // Clear container and add components
  container.innerHTML = '';
  container.appendChild(healthScoreCard);
  categorySections.forEach((section) => container.appendChild(section));
}

// Application initialization
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const form = document.getElementById('repo-form');
  const urlInput = document.getElementById('repo-url');
  const resultsSection = document.getElementById('results-section');
  const loadingIndicator = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');

  // Initialize services
  const orchestrator = new EvaluationOrchestrator();
  const healthCalculator = new HealthScoreCalculator();

  // Form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const url = urlInput.value.trim();

    if (!url) {
      return;
    }

    // Show loading state
    resultsSection.removeAttribute('hidden');
    loadingIndicator.setAttribute('aria-busy', 'true');
    loadingIndicator.removeAttribute('hidden');
    resultsContainer.innerHTML = '';

    try {
      // Parse repository URL
      const { owner, name } = parseRepoFromUrl(url);

      // Evaluate repository
      const evaluation = await orchestrator.evaluate(owner, name);

      // Calculate overall health score
      const healthScore = healthCalculator.calculateOverallScore(evaluation.metrics);

      // Hide loading
      loadingIndicator.setAttribute('aria-busy', 'false');
      loadingIndicator.setAttribute('hidden', '');

      // Render results
      renderResults(evaluation, healthScore, resultsContainer);

    } catch (error) {
      console.error('Error analyzing repository:', error);
      loadingIndicator.setAttribute('aria-busy', 'false');
      loadingIndicator.setAttribute('hidden', '');

      let errorMessage = error.message;
      if (error.message.includes('Not Found')) {
        errorMessage = 'Repository not found. Please check the URL and try again.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later or provide authentication.';
      }

      resultsContainer.innerHTML = `
        <div style="padding: var(--spacing-lg); background-color: var(--color-danger-light); border: 1px solid var(--color-danger); border-radius: var(--border-radius);">
          <h2 style="margin: 0 0 var(--spacing-md); color: var(--color-danger-dark);">Error</h2>
          <p style="margin: 0; color: var(--color-text-primary);">${errorMessage}</p>
        </div>
      `;
    }
  });
});
