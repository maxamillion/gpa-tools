/**
 * Export utilities for comparison data
 * FR-031: Export comparison results in multiple formats
 */

/**
 * Export evaluations as JSON
 * @param {Array} evaluations - Array of evaluation objects with repository and metrics
 * @returns {string} JSON string
 */
export function exportAsJSON(evaluations) {
  if (!evaluations || evaluations.length === 0) {
    throw new Error('No evaluations to export');
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    count: evaluations.length,
    evaluations: evaluations.map((evaluation) => ({
      repository: {
        owner: evaluation.repository.owner,
        name: evaluation.repository.name,
        fullName: evaluation.repository.fullName,
        description: evaluation.repository.description,
        url: evaluation.repository.url,
      },
      healthScore: {
        overallScore: evaluation.healthScore.overallScore,
        overallGrade: evaluation.healthScore.overallGrade,
      },
      metrics: evaluation.metrics.map((metric) => ({
        id: metric.id,
        name: metric.name,
        category: metric.category,
        value: metric.value,
        score: metric.score,
        grade: metric.grade,
        explanation: metric.explanation,
      })),
      evaluatedAt: evaluation.evaluatedAt,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export evaluations as CSV
 * @param {Array} evaluations - Array of evaluation objects
 * @returns {string} CSV string
 */
export function exportAsCSV(evaluations) {
  if (!evaluations || evaluations.length === 0) {
    throw new Error('No evaluations to export');
  }

  // Collect all unique metrics across all evaluations
  const allMetrics = new Map();
  evaluations.forEach((evaluation) => {
    evaluation.metrics.forEach((metric) => {
      if (!allMetrics.has(metric.id)) {
        allMetrics.set(metric.id, metric.name);
      }
    });
  });

  // Build CSV header
  const headers = ['Repository', 'Overall Score', 'Overall Grade'];
  allMetrics.forEach((name) => {
    headers.push(`${name} - Score`);
    headers.push(`${name} - Grade`);
  });

  const csvRows = [headers.join(',')];

  // Build CSV rows
  evaluations.forEach((evaluation) => {
    const row = [
      `"${evaluation.repository.fullName}"`,
      evaluation.healthScore.overallScore.toFixed(1),
      evaluation.healthScore.overallGrade,
    ];

    // Add metric scores and grades
    allMetrics.forEach((name, id) => {
      const metric = evaluation.metrics.find((m) => m.id === id);
      if (metric) {
        row.push(metric.score !== null ? metric.score : 'N/A');
        row.push(`"${metric.grade}"`);
      } else {
        row.push('N/A');
        row.push('N/A');
      }
    });

    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Download exported data as file
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} mimeType - MIME type for the file
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export comparison and trigger download
 * @param {Array} evaluations - Array of evaluation objects
 * @param {string} format - Export format ('json' or 'csv')
 */
export function exportComparison(evaluations, format = 'json') {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const repoNames = evaluations.map((e) => e.repository.name).join('-');
  const filename = `comparison-${repoNames}-${timestamp}.${format}`;

  let content;
  let mimeType;

  if (format === 'json') {
    content = exportAsJSON(evaluations);
    mimeType = 'application/json';
  } else if (format === 'csv') {
    content = exportAsCSV(evaluations);
    mimeType = 'text/csv';
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }

  downloadFile(content, filename, mimeType);
}
