/**
 * Metric Model
 * Represents a single health indicator measurement
 *
 * Per data-model.md:
 * - Validates score range (0-100)
 * - Validates grade values
 * - Validates category against valid categories
 * - Validates confidence levels
 * - Supports optional trend indicator
 */

const VALID_CATEGORIES = ['activity', 'community', 'maintenance', 'documentation', 'security'];
const VALID_GRADES = ['A+', 'A', 'B', 'C', 'D', 'F', 'Excellent', 'Good', 'Fair', 'Poor', 'Pass', 'Fail'];
const VALID_CONFIDENCE_LEVELS = ['high', 'medium', 'low'];
const VALID_TRENDS = ['improving', 'stable', 'declining'];

export class Metric {
  constructor({
    id,
    name,
    category,
    value,
    score,
    grade,
    explanation,
    whyItMatters,
    threshold,
    dataSource,
    calculatedAt,
    confidence,
    trend = null,
  }) {
    // Validate score range
    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    // Validate grade
    if (!VALID_GRADES.includes(grade)) {
      throw new Error('Invalid grade');
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error('Invalid category');
    }

    // Validate confidence level
    if (!VALID_CONFIDENCE_LEVELS.includes(confidence)) {
      throw new Error('Invalid confidence level');
    }

    // Validate trend if provided
    if (trend !== null && !VALID_TRENDS.includes(trend)) {
      throw new Error('Invalid trend');
    }

    // Assign properties
    this.id = id;
    this.name = name;
    this.category = category;
    this.value = value;
    this.score = score;
    this.grade = grade;
    this.explanation = explanation;
    this.whyItMatters = whyItMatters;
    this.threshold = threshold;
    this.dataSource = dataSource;
    this.calculatedAt = calculatedAt;
    this.confidence = confidence;
    this.trend = trend;
  }
}
