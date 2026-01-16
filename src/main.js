/**
 * Main entry point for the Open Source Project Health Analyzer
 * Initializes the application and sets up event handlers
 */

import { parseRepoFromUrl } from './utils/urlParams.js';
import { EvaluationOrchestrator } from './services/evaluationOrchestrator.js';
import { HealthScoreCalculator } from './services/healthScoreCalculator.js';
import { CacheManager } from './services/cacheManager.js';
import { CriterionEvaluator } from './services/CriterionEvaluator.js';
import { exportComparison } from './utils/export.js';
import './components/HealthScoreCard.js';
import './components/CategorySection.js';
import './components/CustomCriteriaForm.js';
import './components/ComparisonTable.js';
import './components/MetricChart.js';

/**
 * Render evaluation results using Web Components
 * @param {Object} evaluation - Evaluation results
 * @param {Object} healthScore - Calculated health score
 * @param {HTMLElement} container - Container element
 * @param {Function} onAddToComparison - Callback for "Add to Comparison" button
 */
function renderResults(evaluation, healthScore, container, onAddToComparison) {
  // Create health score card
  const healthScoreCard = document.createElement('health-score-card');
  healthScoreCard.score = healthScore.overallScore;
  healthScoreCard.grade = healthScore.overallGrade;
  healthScoreCard.categoryBreakdown = healthScore.categoryBreakdown;

  // Create metric chart with lazy-loaded Chart.js
  const metricChart = document.createElement('metric-chart');
  metricChart.categoryBreakdown = healthScore.categoryBreakdown;

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
  container.appendChild(metricChart);
  categorySections.forEach((section) => container.appendChild(section));

  // Add custom criteria section if there are any
  if (evaluation.customCriteria && evaluation.customCriteria.length > 0) {
    const customCriteriaSection = document.createElement('category-section');
    customCriteriaSection.category = 'Custom Criteria';
    customCriteriaSection.metrics = evaluation.customCriteria.map(criterion => ({
      id: criterion.id,
      name: criterion.name,
      category: 'Custom Criteria',
      value: criterion.resultValue,
      score: criterion.result === 'pass' ? 100 : criterion.result === 'fail' ? 0 : null,
      grade: criterion.result === 'pass' ? 'Pass' : criterion.result === 'fail' ? 'Fail' : criterion.result,
      explanation: criterion.description,
      confidence: criterion.confidence,
      supportingEvidence: criterion.supportingEvidence
    }));
    container.appendChild(customCriteriaSection);
  }

  // Add "Add to Comparison" button if callback provided
  if (onAddToComparison) {
    const comparisonButton = document.createElement('button');
    comparisonButton.textContent = 'Add to Comparison';
    comparisonButton.className = 'add-to-comparison-button';
    comparisonButton.style.cssText = `
      margin-top: var(--spacing-lg);
      padding: var(--spacing-sm) var(--spacing-lg);
      background-color: var(--color-primary, #0366d6);
      color: white;
      border: none;
      border-radius: var(--border-radius, 8px);
      font-size: var(--font-size-md, 1rem);
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    `;
    comparisonButton.addEventListener('click', onAddToComparison);
    comparisonButton.addEventListener('mouseenter', () => {
      comparisonButton.style.backgroundColor = 'var(--color-primary-dark, #0052a3)';
    });
    comparisonButton.addEventListener('mouseleave', () => {
      comparisonButton.style.backgroundColor = 'var(--color-primary, #0366d6)';
    });
    container.appendChild(comparisonButton);
  }
}

/**
 * Render comparison table
 * @param {Array} evaluations - Array of evaluations to compare
 * @param {HTMLElement} container - Container element
 * @param {Function} onRemove - Callback for remove project
 * @param {Function} onExport - Callback for export
 */
function renderComparisonTable(evaluations, container, onRemove, onExport) {
  container.innerHTML = '';

  // Create comparison controls
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  `;

  const title = document.createElement('h2');
  title.textContent = `Comparing ${evaluations.length} Projects`;
  title.style.cssText = 'margin: 0; color: var(--color-text-primary);';

  const exportButtons = document.createElement('div');
  exportButtons.style.cssText = 'display: flex; gap: var(--spacing-sm);';

  const exportJSONBtn = document.createElement('button');
  exportJSONBtn.textContent = 'Export JSON';
  exportJSONBtn.className = 'export-button';
  exportJSONBtn.style.cssText = `
    padding: var(--spacing-xs) var(--spacing-md);
    background-color: var(--color-success, #28a745);
    color: white;
    border: none;
    border-radius: var(--border-radius, 6px);
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    cursor: pointer;
  `;
  exportJSONBtn.addEventListener('click', () => onExport('json'));

  const exportCSVBtn = document.createElement('button');
  exportCSVBtn.textContent = 'Export CSV';
  exportCSVBtn.className = 'export-button';
  exportCSVBtn.style.cssText = exportJSONBtn.style.cssText;
  exportCSVBtn.addEventListener('click', () => onExport('csv'));

  exportButtons.appendChild(exportJSONBtn);
  exportButtons.appendChild(exportCSVBtn);

  controls.appendChild(title);
  controls.appendChild(exportButtons);
  container.appendChild(controls);

  // Create comparison table
  const comparisonTable = document.createElement('comparison-table');
  comparisonTable.evaluations = evaluations;
  comparisonTable.addEventListener('remove-project', (event) => {
    onRemove(event.detail.projectId);
  });

  container.appendChild(comparisonTable);
}

// Application initialization
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const form = document.getElementById('repo-form');
  const urlInput = document.getElementById('repo-url');
  const resultsSection = document.getElementById('results-section');
  const loadingIndicator = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');
  const comparisonSection = document.getElementById('comparison-section');
  const comparisonContainer = document.getElementById('comparison-container');

  // Initialize services
  const orchestrator = new EvaluationOrchestrator();
  const healthCalculator = new HealthScoreCalculator();
  const cacheManager = new CacheManager();
  const criterionEvaluator = new CriterionEvaluator();

  // Multi-evaluation state management (T088)
  let comparisonEvaluations = [];
  let currentEvaluation = null;

  // Initialize custom criteria form
  const customCriteriaForm = document.getElementById('custom-criteria-form');
  if (customCriteriaForm) {
    // Load saved criteria from localStorage
    const savedCriteria = cacheManager.loadCustomCriteria();
    customCriteriaForm.criteria = savedCriteria;

    // Handle criterion added
    customCriteriaForm.addEventListener('criterion-added', (event) => {
      const { criterion } = event.detail;
      cacheManager.addCustomCriterion(criterion);

      // Reload criteria to show updated list
      customCriteriaForm.criteria = cacheManager.loadCustomCriteria();
    });

    // Handle criterion updated
    customCriteriaForm.addEventListener('criterion-updated', (event) => {
      const { criterion } = event.detail;
      cacheManager.updateCustomCriterion(criterion.id, criterion);

      // Reload criteria to show updated list
      customCriteriaForm.criteria = cacheManager.loadCustomCriteria();
    });

    // Handle criterion deleted
    customCriteriaForm.addEventListener('criterion-deleted', (event) => {
      const { criterionId } = event.detail;
      cacheManager.deleteCustomCriterion(criterionId);

      // Reload criteria to show updated list
      customCriteriaForm.criteria = cacheManager.loadCustomCriteria();
    });
  }

  // Comparison handlers (T090)
  const addToComparison = () => {
    if (!currentEvaluation) return;

    // Check if already in comparison
    const exists = comparisonEvaluations.some(
      (e) => e.repository.fullName === currentEvaluation.repository.fullName
    );

    if (exists) {
      alert('This project is already in the comparison.');
      return;
    }

    // Add to comparison
    comparisonEvaluations.push(currentEvaluation);

    // Show comparison section
    if (comparisonSection) {
      comparisonSection.removeAttribute('hidden');
      updateComparisonView();
    }
  };

  const removeFromComparison = (projectId) => {
    comparisonEvaluations = comparisonEvaluations.filter(
      (e) => e.repository.fullName !== projectId
    );

    if (comparisonEvaluations.length === 0 && comparisonSection) {
      comparisonSection.setAttribute('hidden', '');
    } else {
      updateComparisonView();
    }
  };

  const exportComparisons = (format) => {
    if (comparisonEvaluations.length === 0) {
      alert('No projects to export.');
      return;
    }

    try {
      exportComparison(comparisonEvaluations, format);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export comparison: ${error.message}`);
    }
  };

  const updateComparisonView = () => {
    if (!comparisonContainer) return;

    renderComparisonTable(
      comparisonEvaluations,
      comparisonContainer,
      removeFromComparison,
      exportComparisons
    );
  };

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

      // Get custom criteria from storage
      const customCriteria = cacheManager.loadCustomCriteria();

      // Evaluate repository (including custom criteria)
      const evaluation = await orchestrator.evaluate(owner, name, customCriteria);

      // Calculate overall health score
      const healthScore = healthCalculator.calculateOverallScore(evaluation.metrics);

      // Store current evaluation with health score for comparison
      currentEvaluation = {
        repository: evaluation.repository,
        metrics: evaluation.metrics,
        healthScore,
        evaluatedAt: evaluation.evaluatedAt,
      };

      // Hide loading
      loadingIndicator.setAttribute('aria-busy', 'false');
      loadingIndicator.setAttribute('hidden', '');

      // Render results with comparison button
      renderResults(evaluation, healthScore, resultsContainer, addToComparison);

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
