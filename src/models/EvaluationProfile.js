/**
 * EvaluationProfile Model
 * Complete evaluation configuration and results for a repository
 * FR-030, FR-032, FR-033: Shareable URLs and persistence
 */

import { Repository } from './Repository.js';
import { Metric } from './Metric.js';
import { CustomCriterion } from './CustomCriterion.js';

export class EvaluationProfile {
  constructor({
    id,
    repository,
    baselineMetrics,
    customCriteria = [],
    healthScore,
    createdAt,
    evaluatedAt,
    shareUrl,
    cacheKey,
  }) {
    // Validate required fields
    if (!id || !repository || !baselineMetrics || !healthScore || !createdAt || !evaluatedAt) {
      throw new Error(
        'EvaluationProfile requires: id, repository, baselineMetrics, healthScore, createdAt, evaluatedAt'
      );
    }

    // Validate dates
    const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
    const evaluated = evaluatedAt instanceof Date ? evaluatedAt : new Date(evaluatedAt);

    if (created > evaluated) {
      throw new Error('createdAt must be before or equal to evaluatedAt');
    }

    this.id = id;
    this.repository = repository instanceof Repository ? repository : new Repository(repository);
    this.baselineMetrics = baselineMetrics.map((m) => (m instanceof Metric ? m : new Metric(m)));
    this.customCriteria = customCriteria.map((c) =>
      c instanceof CustomCriterion ? c : new CustomCriterion(c)
    );
    this.healthScore = healthScore;
    this.createdAt = created;
    this.evaluatedAt = evaluated;
    this.shareUrl = shareUrl;
    this.cacheKey = cacheKey || this.generateCacheKey();
  }

  /**
   * Generate cache key for localStorage
   * FR-032: Persist until user clears data
   */
  generateCacheKey() {
    const repoKey = `${this.repository.owner}/${this.repository.name}`;
    const customKey = this.customCriteria.length > 0 ? `:custom:${this.customCriteria.length}` : '';
    return `repo:${repoKey}:eval:v1${customKey}`;
  }

  /**
   * Generate shareable URL with encoded parameters
   * FR-030, FR-033: Shareable evaluation profiles
   */
  generateShareableUrl(baseUrl) {
    const params = new URLSearchParams();

    // Add repository
    params.append('repo', `${this.repository.owner}/${this.repository.name}`);

    // Add custom criteria if present
    if (this.customCriteria.length > 0) {
      const criteriaData = this.customCriteria.map((c) => ({
        name: c.name,
        description: c.description,
        type: c.type,
        evaluationType: c.evaluationType,
        evaluationLogic: c.evaluationLogic,
      }));

      // Encode as base64 to keep URL cleaner
      const encoded = btoa(JSON.stringify(criteriaData));
      params.append('criteria', encoded);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate comparison URL for multiple repositories
   * FR-033: Shareable comparison views
   * @param {string} baseUrl - Base URL for the application
   * @param {Array<string>} repositories - Array of repo names in "owner/name" format
   * @returns {string} URL with encoded comparison parameters
   */
  static generateComparisonUrl(baseUrl, repositories) {
    if (!repositories || repositories.length === 0) {
      throw new Error('At least one repository is required for comparison URL');
    }

    const params = new URLSearchParams();

    // Add each repository as a separate compare parameter
    repositories.forEach((repo) => {
      params.append('compare', repo);
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Parse comparison URL to extract repositories
   * @param {string} url - URL with comparison parameters
   * @returns {Array<string>} Array of repository names
   */
  static parseComparisonUrl(url) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    // Get all 'compare' parameters
    const repositories = params.getAll('compare');

    return repositories;
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      repository: this.repository.toJSON ? this.repository.toJSON() : this.repository,
      baselineMetrics: this.baselineMetrics.map((m) => (m.toJSON ? m.toJSON() : m)),
      customCriteria: this.customCriteria.map((c) => (c.toJSON ? c.toJSON() : c)),
      healthScore: this.healthScore,
      createdAt: this.createdAt.toISOString(),
      evaluatedAt: this.evaluatedAt.toISOString(),
      shareUrl: this.shareUrl,
      cacheKey: this.cacheKey,
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json) {
    return new EvaluationProfile({
      id: json.id,
      repository: json.repository,
      baselineMetrics: json.baselineMetrics || [],
      customCriteria: json.customCriteria || [],
      healthScore: json.healthScore,
      createdAt: json.createdAt,
      evaluatedAt: json.evaluatedAt,
      shareUrl: json.shareUrl,
      cacheKey: json.cacheKey,
    });
  }

  /**
   * Serialize for localStorage (JSON string)
   * FR-032: Persist custom criteria
   */
  serialize() {
    return JSON.stringify(this.toJSON());
  }

  /**
   * Deserialize from localStorage
   */
  static deserialize(serialized) {
    const json = JSON.parse(serialized);
    return EvaluationProfile.fromJSON(json);
  }

  /**
   * Create a new evaluation profile with generated ID
   */
  static create(data) {
    const id = `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new EvaluationProfile({
      id,
      createdAt: new Date(),
      evaluatedAt: new Date(),
      ...data,
    });
  }

  /**
   * Add custom criterion to profile
   */
  addCustomCriterion(criterion) {
    const customCriterion =
      criterion instanceof CustomCriterion ? criterion : new CustomCriterion(criterion);
    this.customCriteria.push(customCriterion);
    this.cacheKey = this.generateCacheKey(); // Update cache key
  }

  /**
   * Remove custom criterion by ID
   */
  removeCustomCriterion(criterionId) {
    this.customCriteria = this.customCriteria.filter((c) => c.id !== criterionId);
    this.cacheKey = this.generateCacheKey(); // Update cache key
  }

  /**
   * Update custom criterion
   */
  updateCustomCriterion(criterionId, updates) {
    const index = this.customCriteria.findIndex((c) => c.id === criterionId);
    if (index !== -1) {
      this.customCriteria[index] = new CustomCriterion({
        ...this.customCriteria[index],
        ...updates,
      });
    }
  }
}
