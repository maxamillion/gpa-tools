/**
 * Unit tests for Health Score Calculator
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HealthScoreCalculator } from '../../src/services/healthScoreCalculator.js';
import { ConfigurationManager } from '../../src/services/configurationManager.js';
import { Metric } from '../../src/models/Metric.js';

describe('HealthScoreCalculator', () => {
  let calculator;
  let testMetrics;

  beforeEach(() => {
    calculator = new HealthScoreCalculator();

    testMetrics = [
      // Activity (3 metrics)
      new Metric({
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'activity',
        value: 12,
        score: 85,
        grade: 'A',
        explanation: '',
        whyItMatters: '',
        threshold: {},
        dataSource: '',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
      new Metric({
        id: 'release-cadence',
        name: 'Release Cadence',
        category: 'activity',
        value: 14,
        score: 90,
        grade: 'A',
        explanation: '',
        whyItMatters: '',
        threshold: {},
        dataSource: '',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
      new Metric({
        id: 'last-activity',
        name: 'Last Activity',
        category: 'activity',
        value: 1,
        score: 95,
        grade: 'A',
        explanation: '',
        whyItMatters: '',
        threshold: {},
        dataSource: '',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
      // Community (2 metrics)
      new Metric({
        id: 'contributor-count',
        name: 'Contributor Count',
        category: 'community',
        value: 50,
        score: 80,
        grade: 'B',
        explanation: '',
        whyItMatters: '',
        threshold: {},
        dataSource: '',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
      new Metric({
        id: 'new-contributors',
        name: 'New Contributors',
        category: 'community',
        value: 5,
        score: 70,
        grade: 'C',
        explanation: '',
        whyItMatters: '',
        threshold: {},
        dataSource: '',
        calculatedAt: new Date(),
        confidence: 'medium',
      }),
    ];
  });

  describe('calculateOverallScore', () => {
    it('should calculate overall score from all metrics', () => {
      const result = calculator.calculateOverallScore(testMetrics);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('overallGrade');
      expect(result).toHaveProperty('categoryBreakdown');
    });

    it('should calculate simple average when all metrics have same weight', () => {
      const metrics = [
        new Metric({
          id: 'test1',
          name: 'Test 1',
          category: 'activity',
          value: 0,
          score: 80,
          grade: 'B',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'test2',
          name: 'Test 2',
          category: 'activity',
          value: 0,
          score: 90,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ];

      const result = calculator.calculateOverallScore(metrics);
      expect(result.overallScore).toBe(85); // (80 + 90) / 2
    });

    it('should handle empty metrics array', () => {
      const result = calculator.calculateOverallScore([]);
      expect(result.overallScore).toBe(0);
      expect(result.overallGrade).toBe('F');
    });

    it('should round overall score to integer', () => {
      const metrics = [
        new Metric({
          id: 'test1',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 85,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'test2',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 88,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ];

      const result = calculator.calculateOverallScore(metrics);
      expect(result.overallScore).toBe(87); // Math.round((85 + 88) / 2) = 87
    });
  });

  describe('calculateOverallGrade', () => {
    it('should assign A+ for score >= 97', () => {
      const result = calculator.calculateOverallScore([
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 98,
          grade: 'A+',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ]);
      expect(result.overallGrade).toBe('A+');
    });

    it('should assign A for score >= 90', () => {
      const result = calculator.calculateOverallScore([
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 92,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ]);
      expect(result.overallGrade).toBe('A');
    });

    it('should assign B for score >= 80', () => {
      const result = calculator.calculateOverallScore([
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 85,
          grade: 'B',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ]);
      expect(result.overallGrade).toBe('B');
    });

    it('should assign C for score >= 70', () => {
      const result = calculator.calculateOverallScore([
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 75,
          grade: 'C',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ]);
      expect(result.overallGrade).toBe('C');
    });

    it('should assign D for score >= 60', () => {
      const result = calculator.calculateOverallScore([
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 65,
          grade: 'D',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ]);
      expect(result.overallGrade).toBe('D');
    });

    it('should assign F for score < 60', () => {
      const result = calculator.calculateOverallScore([
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 45,
          grade: 'F',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ]);
      expect(result.overallGrade).toBe('F');
    });
  });

  describe('calculateCategoryBreakdown', () => {
    it('should group metrics by category', () => {
      const result = calculator.calculateOverallScore(testMetrics);

      expect(result.categoryBreakdown).toHaveProperty('activity');
      expect(result.categoryBreakdown).toHaveProperty('community');
      expect(result.categoryBreakdown.activity).toHaveProperty('score');
      expect(result.categoryBreakdown.activity).toHaveProperty('grade');
    });

    it('should calculate average score per category', () => {
      const result = calculator.calculateOverallScore(testMetrics);

      // Activity: (85 + 90 + 95) / 3 = 90
      expect(result.categoryBreakdown.activity.score).toBe(90);

      // Community: (80 + 70) / 2 = 75
      expect(result.categoryBreakdown.community.score).toBe(75);
    });

    it('should assign grade to each category', () => {
      const result = calculator.calculateOverallScore(testMetrics);

      expect(result.categoryBreakdown.activity.grade).toBe('A');
      expect(result.categoryBreakdown.community.grade).toBe('C');
    });

    it('should handle categories with single metric', () => {
      const singleMetric = [testMetrics[0]]; // Only activity metric (score: 85)
      const result = calculator.calculateOverallScore(singleMetric);

      expect(result.categoryBreakdown.activity.score).toBe(85);
      expect(result.categoryBreakdown.activity.grade).toBe('B'); // 85 is grade B (80-89)
    });
  });

  describe('Custom Weighting with ConfigurationManager', () => {
    let configManager;

    beforeEach(() => {
      configManager = new ConfigurationManager();
      calculator = new HealthScoreCalculator(configManager);
    });

    it('should use equal weights when no custom config provided', () => {
      const metrics = [
        new Metric({
          id: 'commit-frequency',
          name: 'Commit Frequency',
          category: 'activity',
          value: 0,
          score: 80,
          grade: 'B',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'code-review-participation',
          name: 'Code Review',
          category: 'activity',
          value: 0,
          score: 90,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ];

      const result = calculator.calculateOverallScore(metrics);
      expect(result.overallScore).toBe(85); // (80 + 90) / 2
    });

    it('should apply custom weights when config has non-equal weights', () => {
      configManager.setMetricWeight('commit-frequency', 2.0);
      configManager.setMetricWeight('code-review-participation', 1.0);

      const metrics = [
        new Metric({
          id: 'commit-frequency',
          name: 'Commit Frequency',
          category: 'activity',
          value: 0,
          score: 80,
          grade: 'B',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'code-review-participation',
          name: 'Code Review',
          category: 'activity',
          value: 0,
          score: 90,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ];

      const result = calculator.calculateOverallScore(metrics);
      expect(result.overallScore).toBe(83); // (80*2 + 90*1) / 3 = 250/3 = 83.33 → 83
    });

    it('should exclude disabled metrics from calculation', () => {
      configManager.setMetricEnabled('commit-frequency', false);

      const metrics = [
        new Metric({
          id: 'commit-frequency',
          name: 'Commit Frequency',
          category: 'activity',
          value: 0,
          score: 80,
          grade: 'B',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'code-review-participation',
          name: 'Code Review',
          category: 'activity',
          value: 0,
          score: 90,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ];

      const result = calculator.calculateOverallScore(metrics);
      expect(result.overallScore).toBe(90); // Only code-review-participation counts
    });

    it('should work with quality preset', () => {
      configManager.applyPreset('quality');

      const metrics = [
        new Metric({
          id: 'code-review-participation',
          name: 'Code Review',
          category: 'maintenance',
          value: 0,
          score: 80,
          grade: 'B',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'test-coverage',
          name: 'Test Coverage',
          category: 'maintenance',
          value: 0,
          score: 90,
          grade: 'A',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
        new Metric({
          id: 'commit-frequency',
          name: 'Commit Frequency',
          category: 'activity',
          value: 0,
          score: 70,
          grade: 'C',
          explanation: '',
          whyItMatters: '',
          threshold: {},
          dataSource: '',
          calculatedAt: new Date(),
          confidence: 'high',
        }),
      ];

      const result = calculator.calculateOverallScore(metrics);
      // Quality metrics (code-review, test-coverage) should be weighted higher
      // code-review: 80*2, test-coverage: 90*2, commit-frequency: 70*1
      // (160 + 180 + 70) / 5 = 410/5 = 82
      expect(result.overallScore).toBe(82);
    });
  });
});
