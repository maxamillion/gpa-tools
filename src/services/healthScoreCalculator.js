/**
 * Health Score Calculator
 *
 * Aggregates individual metrics into category and overall health scores.
 */

import { METRIC_CATEGORIES } from '../config/metricDefinitions.js';
import { getGrade, getScoreLevel } from '../config/thresholds.js';

export class HealthScoreCalculator {
  /**
   * Calculate overall health score from metrics
   * @param {Array<Object>} metrics - Calculated metrics with scores
   * @returns {Object} Health score data
   */
  calculate(metrics) {
    const categories = {};

    // Group metrics by category and calculate category scores
    for (const [categoryId, categoryDef] of Object.entries(METRIC_CATEGORIES)) {
      const categoryMetrics = metrics.filter(m => m.category === categoryId);
      const categoryScore = this.calculateCategoryScore(categoryMetrics);
      const grade = getGrade(categoryScore);

      categories[categoryId] = {
        ...categoryDef,
        score: Math.round(categoryScore),
        grade: grade.grade,
        gradeColor: grade.color,
        level: getScoreLevel(categoryScore),
        metricCount: categoryMetrics.length,
        metrics: categoryMetrics,
      };
    }

    // Calculate weighted overall score
    let weightedSum = 0;
    let totalWeight = 0;

    for (const categoryData of Object.values(categories)) {
      const weight = categoryData.weight;
      weightedSum += categoryData.score * weight;
      totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const overallGrade = getGrade(overallScore);

    return {
      score: Math.round(overallScore),
      grade: overallGrade.grade,
      gradeColor: overallGrade.color,
      level: getScoreLevel(overallScore),
      categories,
      summary: this.generateSummary(categories, overallScore),
    };
  }

  /**
   * Calculate score for a category
   * @param {Array<Object>} metrics - Metrics in this category
   * @returns {number} Category score 0-100
   */
  calculateCategoryScore(metrics) {
    if (metrics.length === 0) {
      return 0;
    }

    // Simple average of metric scores
    const totalScore = metrics.reduce((sum, m) => sum + (m.score || 0), 0);
    return totalScore / metrics.length;
  }

  /**
   * Generate human-readable summary
   * @param {Object} categories - Category scores
   * @param {number} overallScore - Overall score
   * @returns {Object} Summary data
   */
  generateSummary(categories, overallScore) {
    const strengths = [];
    const improvements = [];

    for (const data of Object.values(categories)) {
      if (data.score >= 75) {
        strengths.push({
          category: data.name,
          score: data.score,
          icon: data.icon,
        });
      } else if (data.score < 50) {
        improvements.push({
          category: data.name,
          score: data.score,
          icon: data.icon,
        });
      }
    }

    // Sort by score
    strengths.sort((a, b) => b.score - a.score);
    improvements.sort((a, b) => a.score - b.score);

    // Generate text summary
    let text = '';
    if (overallScore >= 80) {
      text = 'This project demonstrates excellent overall health with strong practices across multiple areas.';
    } else if (overallScore >= 60) {
      text = 'This project shows good health fundamentals with some areas that could be strengthened.';
    } else if (overallScore >= 40) {
      text = 'This project has room for improvement in several key health indicators.';
    } else {
      text = 'This project would benefit significantly from improvements to its health practices.';
    }

    return {
      text,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
    };
  }
}
