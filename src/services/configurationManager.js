/**
 * ConfigurationManager Service
 * Manages custom metric selection and weighting for personalized health scoring
 */

const STORAGE_KEY = 'gpa-config';

// All 18 baseline metrics
const DEFAULT_METRICS = [
  'commit-frequency',
  'code-review-participation',
  'issue-response-time',
  'pull-request-cycle-time',
  'contributor-growth',
  'bus-factor',
  'dependency-freshness',
  'release-frequency',
  'documentation-quality',
  'readme-quality',
  'license-clarity',
  'security-policy',
  'code-of-conduct',
  'contributing-guidelines',
  'issue-tracker-health',
  'test-coverage',
  'ci-cd-adoption',
  'vulnerability-count',
];

const PRESETS = {
  quality: {
    'code-review-participation': 2.0,
    'test-coverage': 2.0,
    'ci-cd-adoption': 1.5,
    'documentation-quality': 1.5,
    'security-policy': 1.5,
  },
  activity: {
    'commit-frequency': 2.0,
    'release-frequency': 2.0,
    'contributor-growth': 1.5,
    'pull-request-cycle-time': 1.5,
  },
  community: {
    'contributor-growth': 2.0,
    'issue-response-time': 2.0,
    'issue-tracker-health': 1.5,
    'code-of-conduct': 1.5,
    'contributing-guidelines': 1.5,
  },
};

export class ConfigurationManager {
  constructor() {
    this.config = this.createDefaultConfiguration();
  }

  createDefaultConfiguration() {
    const metrics = {};
    DEFAULT_METRICS.forEach((metricId) => {
      metrics[metricId] = {
        enabled: true,
        weight: 1.0,
      };
    });

    return { metrics };
  }

  getConfiguration() {
    return this.config;
  }

  setMetricWeight(metricId, weight) {
    if (!this.config.metrics[metricId]) {
      throw new Error(`Unknown metric: ${metricId}`);
    }

    if (typeof weight !== 'number' || weight < 0) {
      throw new Error('Weight must be a non-negative number');
    }

    this.config.metrics[metricId].weight = weight;
  }

  setMetricEnabled(metricId, enabled) {
    if (!this.config.metrics[metricId]) {
      throw new Error(`Unknown metric: ${metricId}`);
    }

    this.config.metrics[metricId].enabled = enabled;
  }

  getNormalizedWeights() {
    // Calculate sum of weights for enabled metrics
    const enabledMetrics = Object.entries(this.config.metrics).filter(
      ([_id, config]) => config.enabled
    );

    const totalWeight = enabledMetrics.reduce((sum, [_id, config]) => sum + config.weight, 0);

    // Normalize weights to sum to 1.0
    const normalized = {};
    Object.entries(this.config.metrics).forEach(([id, config]) => {
      normalized[id] = {
        enabled: config.enabled,
        weight: config.enabled ? config.weight / totalWeight : 0,
      };
    });

    return normalized;
  }

  calculateWeightedScore(metrics) {
    const normalized = this.getNormalizedWeights();

    let weightedSum = 0;
    let totalWeight = 0;

    metrics.forEach((metric) => {
      const metricConfig = normalized[metric.id];
      if (metricConfig && metricConfig.enabled) {
        // Use raw weight (not normalized) for proper averaging
        const weight = this.config.metrics[metric.id].weight;
        weightedSum += metric.score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  saveConfiguration() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // Silently fail - localStorage might not be available
    }
  }

  loadConfiguration() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with default to handle new metrics
        this.config = {
          metrics: { ...this.createDefaultConfiguration().metrics, ...parsed.metrics },
        };
      }
    } catch {
      // Failed to load - use default configuration
      this.config = this.createDefaultConfiguration();
    }
  }

  resetToDefault() {
    this.config = this.createDefaultConfiguration();
    this.saveConfiguration();
  }

  applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    // Reset to default first
    this.config = this.createDefaultConfiguration();

    // Apply preset weights
    Object.entries(preset).forEach(([metricId, weight]) => {
      if (this.config.metrics[metricId]) {
        this.config.metrics[metricId].weight = weight;
      }
    });
  }
}
