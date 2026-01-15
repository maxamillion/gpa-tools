/**
 * Unit tests for ConfigurationManager
 * Manages custom metric selection and weighting
 */

/* global global */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigurationManager } from '../../src/services/configurationManager.js';

describe('ConfigurationManager', () => {
  let manager;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
      removeItem(key) {
        delete this.data[key];
      },
      clear() {
        this.data = {};
      },
    };
    global.localStorage = mockLocalStorage;

    manager = new ConfigurationManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Default Configuration', () => {
    it('should have default configuration with all metrics enabled', () => {
      const config = manager.getConfiguration();
      expect(config.metrics).toBeDefined();
      expect(Object.keys(config.metrics).length).toBeGreaterThan(0);
    });

    it('should have equal weights for all metrics by default', () => {
      const config = manager.getConfiguration();
      const weights = Object.values(config.metrics);
      const allEqual = weights.every((w) => w.enabled && w.weight === 1.0);
      expect(allEqual).toBe(true);
    });

    it('should include all 18 baseline metrics', () => {
      const config = manager.getConfiguration();
      expect(Object.keys(config.metrics).length).toBe(18);
    });
  });

  describe('Custom Weights', () => {
    it('should allow setting custom weight for a metric', () => {
      manager.setMetricWeight('commit-frequency', 2.0);
      const config = manager.getConfiguration();
      expect(config.metrics['commit-frequency'].weight).toBe(2.0);
    });

    it('should allow disabling a metric', () => {
      manager.setMetricEnabled('commit-frequency', false);
      const config = manager.getConfiguration();
      expect(config.metrics['commit-frequency'].enabled).toBe(false);
    });

    it('should normalize weights to sum to 1.0', () => {
      manager.setMetricWeight('commit-frequency', 2.0);
      manager.setMetricWeight('code-review-participation', 3.0);
      const normalized = manager.getNormalizedWeights();

      const sum = Object.values(normalized)
        .filter((m) => m.enabled)
        .reduce((total, m) => total + m.weight, 0);

      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    });

    it('should throw error for invalid weight', () => {
      expect(() => manager.setMetricWeight('commit-frequency', -1)).toThrow();
      expect(() => manager.setMetricWeight('commit-frequency', 'invalid')).toThrow();
    });

    it('should throw error for unknown metric', () => {
      expect(() => manager.setMetricWeight('unknown-metric', 1.0)).toThrow();
    });
  });

  describe('Weighted Score Calculation', () => {
    it('should calculate weighted score with default weights', () => {
      const metrics = [
        { id: 'commit-frequency', score: 80 },
        { id: 'code-review-participation', score: 90 },
        { id: 'issue-response-time', score: 70 },
      ];

      const weightedScore = manager.calculateWeightedScore(metrics);
      expect(weightedScore).toBe(80); // Simple average with equal weights
    });

    it('should calculate weighted score with custom weights', () => {
      manager.setMetricWeight('commit-frequency', 2.0);
      manager.setMetricWeight('code-review-participation', 1.0);
      manager.setMetricWeight('issue-response-time', 1.0);

      const metrics = [
        { id: 'commit-frequency', score: 80 },
        { id: 'code-review-participation', score: 90 },
        { id: 'issue-response-time', score: 70 },
      ];

      const weightedScore = manager.calculateWeightedScore(metrics);
      expect(weightedScore).toBe(80); // (80*2 + 90*1 + 70*1) / 4 = 320/4 = 80
    });

    it('should exclude disabled metrics from weighted score', () => {
      manager.setMetricEnabled('issue-response-time', false);

      const metrics = [
        { id: 'commit-frequency', score: 80 },
        { id: 'code-review-participation', score: 90 },
        { id: 'issue-response-time', score: 70 },
      ];

      const weightedScore = manager.calculateWeightedScore(metrics);
      expect(weightedScore).toBe(85); // (80 + 90) / 2 = 85
    });

    it('should handle metrics with only some enabled', () => {
      manager.setMetricEnabled('commit-frequency', false);
      manager.setMetricEnabled('code-review-participation', true);

      const metrics = [
        { id: 'commit-frequency', score: 80 },
        { id: 'code-review-participation', score: 90 },
      ];

      const weightedScore = manager.calculateWeightedScore(metrics);
      expect(weightedScore).toBe(90); // Only code-review-participation enabled
    });
  });

  describe('Persistence', () => {
    it('should save configuration to localStorage', () => {
      manager.setMetricWeight('commit-frequency', 2.0);
      manager.saveConfiguration();

      const saved = JSON.parse(mockLocalStorage.getItem('gpa-config'));
      expect(saved.metrics['commit-frequency'].weight).toBe(2.0);
    });

    it('should load configuration from localStorage', () => {
      const config = {
        metrics: {
          'commit-frequency': { enabled: true, weight: 2.0 },
          'code-review-participation': { enabled: false, weight: 1.0 },
        },
      };
      mockLocalStorage.setItem('gpa-config', JSON.stringify(config));

      manager.loadConfiguration();
      const loaded = manager.getConfiguration();
      expect(loaded.metrics['commit-frequency'].weight).toBe(2.0);
      expect(loaded.metrics['code-review-participation'].enabled).toBe(false);
    });

    it('should use default config if localStorage is empty', () => {
      manager.loadConfiguration();
      const config = manager.getConfiguration();
      expect(Object.keys(config.metrics).length).toBe(18);
    });

    it('should reset to default configuration', () => {
      manager.setMetricWeight('commit-frequency', 2.0);
      manager.resetToDefault();

      const config = manager.getConfiguration();
      expect(config.metrics['commit-frequency'].weight).toBe(1.0);
    });
  });

  describe('Presets', () => {
    it('should have quality-focused preset', () => {
      manager.applyPreset('quality');
      const config = manager.getConfiguration();

      // Quality metrics should have higher weight
      expect(config.metrics['code-review-participation'].weight).toBeGreaterThan(1.0);
      expect(config.metrics['test-coverage'].weight).toBeGreaterThan(1.0);
    });

    it('should have activity-focused preset', () => {
      manager.applyPreset('activity');
      const config = manager.getConfiguration();

      // Activity metrics should have higher weight
      expect(config.metrics['commit-frequency'].weight).toBeGreaterThan(1.0);
      expect(config.metrics['release-frequency'].weight).toBeGreaterThan(1.0);
    });

    it('should have community-focused preset', () => {
      manager.applyPreset('community');
      const config = manager.getConfiguration();

      // Community metrics should have higher weight
      expect(config.metrics['contributor-growth'].weight).toBeGreaterThan(1.0);
      expect(config.metrics['issue-response-time'].weight).toBeGreaterThan(1.0);
    });

    it('should throw error for unknown preset', () => {
      expect(() => manager.applyPreset('unknown')).toThrow();
    });
  });
});
