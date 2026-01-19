/**
 * Health Score Calculator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HealthScoreCalculator } from './healthScoreCalculator.js';

describe('HealthScoreCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new HealthScoreCalculator();
  });

  describe('calculateCategoryScore', () => {
    it('should average metric scores', () => {
      const metrics = [
        { score: 80 },
        { score: 60 },
        { score: 100 },
      ];
      const score = calculator.calculateCategoryScore(metrics);
      expect(score).toBe(80);
    });

    it('should return 0 for empty metrics', () => {
      const score = calculator.calculateCategoryScore([]);
      expect(score).toBe(0);
    });
  });

  describe('calculate', () => {
    it('should calculate overall score from metrics', () => {
      const metrics = [
        // Activity metrics (15% weight)
        { category: 'activity', score: 80 },
        { category: 'activity', score: 60 },
        // Community metrics (20% weight)
        { category: 'community', score: 70 },
        { category: 'community', score: 90 },
        // Responsiveness (20% weight)
        { category: 'responsiveness', score: 50 },
        // Documentation (15% weight)
        { category: 'documentation', score: 100 },
        // Security (20% weight)
        { category: 'security', score: 75 },
        // Governance (10% weight)
        { category: 'governance', score: 60 },
      ];

      const result = calculator.calculate(metrics);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(result.categories).toBeDefined();
      expect(Object.keys(result.categories)).toHaveLength(6);
    });

    it('should assign correct grades based on score', () => {
      const highScoreMetrics = Array(24).fill(null).map((_, i) => ({
        category: ['activity', 'community', 'responsiveness', 'documentation', 'security', 'governance'][i % 6],
        score: 98,
      }));

      const result = calculator.calculate(highScoreMetrics);
      expect(result.grade).toMatch(/^A/); // A+, A, or A-
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('should generate summary with strengths and improvements', () => {
      const mixedMetrics = [
        { category: 'activity', score: 90 },
        { category: 'activity', score: 85 },
        { category: 'community', score: 30 },
        { category: 'community', score: 25 },
        { category: 'responsiveness', score: 60 },
        { category: 'documentation', score: 70 },
        { category: 'security', score: 80 },
        { category: 'governance', score: 40 },
      ];

      const result = calculator.calculate(mixedMetrics);

      expect(result.summary).toBeDefined();
      expect(result.summary.strengths.length).toBeGreaterThan(0);
      expect(result.summary.improvements.length).toBeGreaterThan(0);
    });

    it('should include category weights in output', () => {
      const metrics = [
        { category: 'activity', score: 50 },
        { category: 'community', score: 50 },
        { category: 'responsiveness', score: 50 },
        { category: 'documentation', score: 50 },
        { category: 'security', score: 50 },
        { category: 'governance', score: 50 },
      ];

      const result = calculator.calculate(metrics);

      expect(result.categories.activity.weight).toBe(0.15);
      expect(result.categories.community.weight).toBe(0.20);
      expect(result.categories.responsiveness.weight).toBe(0.20);
      expect(result.categories.documentation.weight).toBe(0.15);
      expect(result.categories.security.weight).toBe(0.20);
      expect(result.categories.governance.weight).toBe(0.10);
    });
  });

  describe('generateSummary', () => {
    it('should generate positive text for high scores', () => {
      const categories = {
        activity: { name: 'Activity', score: 90, icon: '📊' },
        community: { name: 'Community', score: 85, icon: '👥' },
      };

      const summary = calculator.generateSummary(categories, 88);

      expect(summary.text).toContain('excellent');
      expect(summary.strengths.length).toBe(2);
    });

    it('should generate improvement text for low scores', () => {
      const categories = {
        activity: { name: 'Activity', score: 30, icon: '📊' },
        community: { name: 'Community', score: 25, icon: '👥' },
      };

      const summary = calculator.generateSummary(categories, 28);

      expect(summary.text).toContain('benefit');
      expect(summary.improvements.length).toBe(2);
    });
  });
});
