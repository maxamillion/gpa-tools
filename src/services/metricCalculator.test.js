/**
 * Metric Calculator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetricCalculator } from './metricCalculator.js';

describe('MetricCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new MetricCalculator();
  });

  describe('calculateScore', () => {
    it('should return 100 for excellent commit frequency', () => {
      const score = calculator.calculateScore('commit-frequency', 25);
      expect(score).toBe(100);
    });

    it('should return 25 for poor commit frequency', () => {
      const score = calculator.calculateScore('commit-frequency', 0.5);
      expect(score).toBe(25);
    });

    it('should interpolate for mid-range values', () => {
      const score = calculator.calculateScore('commit-frequency', 12.5);
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThan(100);
    });

    it('should handle lower-is-better metrics', () => {
      // 1 day since last activity should be excellent
      const score1 = calculator.calculateScore('last-activity', 1);
      expect(score1).toBe(100);

      // 100 days should be poor
      const score2 = calculator.calculateScore('last-activity', 100);
      expect(score2).toBe(25);
    });

    it('should return neutral score for null values', () => {
      const score = calculator.calculateScore('commit-frequency', null);
      expect(score).toBe(50);
    });

    it('should return neutral score for unknown metrics', () => {
      const score = calculator.calculateScore('unknown-metric', 50);
      expect(score).toBe(50);
    });
  });

  describe('calculateCommitFrequency', () => {
    it('should calculate commits per week', () => {
      const commits = new Array(130).fill({ commit: { author: { date: new Date().toISOString() } } });
      const result = calculator.calculateCommitFrequency(commits);

      expect(result.id).toBe('commit-frequency');
      expect(result.rawValue).toBeCloseTo(10.1, 0);
      expect(result.score).toBeGreaterThan(50);
    });

    it('should handle empty commits', () => {
      const result = calculator.calculateCommitFrequency([]);
      expect(result.rawValue).toBe(0);
      expect(result.score).toBe(25);
    });
  });

  describe('calculateBusFactor', () => {
    it('should return 1 for single contributor', () => {
      const contributors = [{ login: 'dev1', contributions: 100 }];
      const result = calculator.calculateBusFactor(contributors);

      expect(result.rawValue).toBe(1);
      expect(result.score).toBeLessThan(50);
    });

    it('should calculate correct bus factor for multiple contributors', () => {
      const contributors = [
        { login: 'dev1', contributions: 30 },
        { login: 'dev2', contributions: 30 },
        { login: 'dev3', contributions: 20 },
        { login: 'dev4', contributions: 10 },
        { login: 'dev5', contributions: 10 },
      ];
      const result = calculator.calculateBusFactor(contributors);

      // First two contributors cover 60% (>50%)
      expect(result.rawValue).toBe(2);
    });

    it('should handle empty contributors', () => {
      const result = calculator.calculateBusFactor([]);
      expect(result.rawValue).toBe(0);
      expect(result.score).toBe(0);
    });
  });

  describe('calculatePRMergeRate', () => {
    it('should calculate correct merge percentage', () => {
      const pullRequests = {
        merged: new Array(80).fill({}),
        closed: new Array(20).fill({}),
      };
      const result = calculator.calculatePRMergeRate(pullRequests);

      expect(result.rawValue).toBe(80);
      expect(result.score).toBeGreaterThan(50);
    });

    it('should handle no closed PRs', () => {
      const pullRequests = { merged: [], closed: [] };
      const result = calculator.calculatePRMergeRate(pullRequests);

      expect(result.displayValue).toBe('No closed PRs');
      expect(result.score).toBe(50);
    });
  });

  describe('calculateContributorCount', () => {
    it('should return correct count', () => {
      const contributors = new Array(25).fill({ login: 'dev' });
      const result = calculator.calculateContributorCount(contributors);

      expect(result.rawValue).toBe(25);
      expect(result.score).toBeGreaterThan(50);
    });
  });

  describe('calculateStaleIssuesRatio', () => {
    it('should calculate percentage of stale issues', () => {
      const now = new Date();
      const staleDate = new Date(now);
      staleDate.setDate(staleDate.getDate() - 100);
      const recentDate = new Date(now);
      recentDate.setDate(recentDate.getDate() - 10);

      const issues = {
        open: [
          { updated_at: staleDate.toISOString() },
          { updated_at: staleDate.toISOString() },
          { updated_at: recentDate.toISOString() },
          { updated_at: recentDate.toISOString() },
        ],
      };
      const result = calculator.calculateStaleIssuesRatio(issues);

      expect(result.rawValue).toBe(50);
    });

    it('should return 0% for no open issues', () => {
      const result = calculator.calculateStaleIssuesRatio({ open: [] });
      expect(result.rawValue).toBe(0);
      expect(result.score).toBe(100);
    });
  });

  describe('boolean metrics', () => {
    it('should return 100 for present security policy', () => {
      const communityProfile = {
        files: { security_policy: {} },
      };
      const result = calculator.calculateSecurityPolicy(communityProfile);

      expect(result.rawValue).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should return 0 for missing security policy', () => {
      const communityProfile = {
        files: { security_policy: null },
      };
      const result = calculator.calculateSecurityPolicy(communityProfile);

      expect(result.rawValue).toBe(false);
      expect(result.score).toBe(0);
    });
  });

  describe('calculateAll', () => {
    it('should return 24 metrics', () => {
      const mockData = {
        repository: {
          pushed_at: new Date().toISOString(),
          open_issues_count: 10,
          description: 'Test repo',
          license: { spdx_id: 'MIT' },
        },
        commits: [],
        contributors: [],
        issues: { open: [], closed: [] },
        pullRequests: { open: [], closed: [], merged: [], all: [] },
        releases: [],
        communityProfile: {
          health_percentage: 50,
          files: {},
        },
      };

      const metrics = calculator.calculateAll(mockData);
      expect(metrics).toHaveLength(24);
    });

    it('should include all categories', () => {
      const mockData = {
        repository: {
          pushed_at: new Date().toISOString(),
          open_issues_count: 0,
          license: null,
        },
        commits: [],
        contributors: [],
        issues: { open: [], closed: [] },
        pullRequests: { open: [], closed: [], merged: [], all: [] },
        releases: [],
        communityProfile: { files: {} },
      };

      const metrics = calculator.calculateAll(mockData);
      const categories = new Set(metrics.map(m => m.category));

      expect(categories.has('activity')).toBe(true);
      expect(categories.has('community')).toBe(true);
      expect(categories.has('responsiveness')).toBe(true);
      expect(categories.has('documentation')).toBe(true);
      expect(categories.has('security')).toBe(true);
      expect(categories.has('governance')).toBe(true);
    });
  });
});
