/**
 * Health Score Calculator Service
 * Calculates overall repository health score from individual metrics
 * Supports custom metric weighting via ConfigurationManager
 */

import { scoreToGrade } from '../utils/scoring.js';

export class HealthScoreCalculator {
  /**
   * Create a new HealthScoreCalculator
   * @param {ConfigurationManager} configManager - Optional configuration manager for custom weighting
   */
  constructor(configManager = null) {
    this.configManager = configManager;
  }

  /**
   * Calculate overall health score and category breakdown
   * @param {Array<Metric>} metrics - Array of calculated metrics
   * @returns {Object} Overall score, grade, and category breakdown
   */
  calculateOverallScore(metrics) {
    if (!metrics || metrics.length === 0) {
      return {
        overallScore: 0,
        overallGrade: 'F',
        categoryBreakdown: {},
      };
    }

    // Calculate category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(metrics);

    // Calculate overall score using weighted or simple average
    const overallScore = this.configManager
      ? this.configManager.calculateWeightedScore(metrics)
      : this.calculateSimpleAverage(metrics);

    // Calculate overall grade
    const overallGrade = scoreToGrade(overallScore);

    return {
      overallScore,
      overallGrade,
      categoryBreakdown,
    };
  }

  /**
   * Calculate simple average of all metric scores
   * @param {Array<Metric>} metrics - Array of calculated metrics
   * @returns {number} Average score
   */
  calculateSimpleAverage(metrics) {
    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    return Math.round(totalScore / metrics.length);
  }

  /**
   * Calculate average score and grade per category
   * @param {Array<Metric>} metrics - Array of calculated metrics
   * @returns {Object} Category breakdown with scores and grades
   */
  calculateCategoryBreakdown(metrics) {
    const breakdown = {};

    // Group metrics by category
    const categorized = metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {});

    // Calculate average score and grade for each category
    Object.entries(categorized).forEach(([category, categoryMetrics]) => {
      const totalScore = categoryMetrics.reduce((sum, metric) => sum + metric.score, 0);
      const avgScore = Math.round(totalScore / categoryMetrics.length);
      const grade = scoreToGrade(avgScore);

      breakdown[category] = {
        score: avgScore,
        grade,
      };
    });

    return breakdown;
  }
}
