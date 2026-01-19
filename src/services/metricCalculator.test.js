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
    it('should return 25 metrics', () => {
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
        governanceFiles: null,
        openSSFBadge: null,
        foundationAffiliation: null,
      };

      const metrics = calculator.calculateAll(mockData);
      expect(metrics).toHaveLength(25);
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
        governanceFiles: null,
        openSSFBadge: null,
        foundationAffiliation: null,
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

  describe('calculateGovernanceDocs', () => {
    it('should return neutral score when no governance data', () => {
      const result = calculator.calculateGovernanceDocs(null);
      expect(result.score).toBe(50);
      expect(result.displayValue).toBe('Unknown');
    });

    it('should score 50 for main governance doc', () => {
      const governanceFiles = {
        governance: { path: 'GOVERNANCE.md', contentLength: 1000 },
        steering: null,
        tsc: null,
        owners: null,
        maintainers: null,
        codeowners: null,
      };
      const result = calculator.calculateGovernanceDocs(governanceFiles);
      // 40 base + 10 for content > 500 chars = 50
      expect(result.score).toBe(50);
      expect(result.displayValue).toBe('GOVERNANCE');
    });

    it('should score 100 for full governance structure', () => {
      const governanceFiles = {
        governance: { path: 'GOVERNANCE.md', contentLength: 1000 },
        steering: { path: 'STEERING.md', contentLength: 500 },
        tsc: null,
        owners: { path: 'OWNERS', contentLength: 200 },
        maintainers: { path: 'MAINTAINERS.md', contentLength: 300 },
        codeowners: null,
      };
      const result = calculator.calculateGovernanceDocs(governanceFiles);
      // 40 + 10 (content) + 30 (steering) + 15 (owners) + 15 (maintainers) = 110 capped at 100
      expect(result.score).toBe(100);
    });

    it('should score 30 for ownership files only', () => {
      const governanceFiles = {
        governance: null,
        steering: null,
        tsc: null,
        owners: { path: 'OWNERS', contentLength: 200 },
        maintainers: { path: 'MAINTAINERS.md', contentLength: 300 },
        codeowners: null,
      };
      const result = calculator.calculateGovernanceDocs(governanceFiles);
      // 15 (owners) + 15 (maintainers) = 30
      expect(result.score).toBe(30);
    });
  });

  describe('calculateOpenSSFBadge', () => {
    it('should return 0 for no badge', () => {
      const result = calculator.calculateOpenSSFBadge({ found: false, level: 'none' });
      expect(result.score).toBe(0);
      expect(result.displayValue).toBe('Not Found');
    });

    it('should return 25 for in-progress', () => {
      const result = calculator.calculateOpenSSFBadge({ found: true, level: 'in_progress', source: 'api' });
      expect(result.score).toBe(25);
      expect(result.displayValue).toBe('In Progress');
    });

    it('should return 50 for passing', () => {
      const result = calculator.calculateOpenSSFBadge({ found: true, level: 'passing', source: 'api' });
      expect(result.score).toBe(50);
      expect(result.displayValue).toBe('Passing');
    });

    it('should return 75 for silver', () => {
      const result = calculator.calculateOpenSSFBadge({ found: true, level: 'silver', source: 'api' });
      expect(result.score).toBe(75);
      expect(result.displayValue).toBe('Silver');
    });

    it('should return 100 for gold', () => {
      const result = calculator.calculateOpenSSFBadge({ found: true, level: 'gold', source: 'api' });
      expect(result.score).toBe(100);
      expect(result.displayValue).toBe('Gold');
    });
  });

  describe('calculateFoundationAffiliation', () => {
    it('should return 0 for no foundation', () => {
      const result = calculator.calculateFoundationAffiliation({ foundation: null }, null);
      expect(result.score).toBe(0);
      expect(result.displayValue).toBe('None');
    });

    it('should return 50 for no foundation but with governance', () => {
      const governanceFiles = {
        governance: { path: 'GOVERNANCE.md', contentLength: 1000 },
      };
      const result = calculator.calculateFoundationAffiliation({ foundation: null }, governanceFiles);
      expect(result.score).toBe(50);
      expect(result.displayValue).toBe('Independent (with governance)');
    });

    it('should return 100 for CNCF graduated', () => {
      const foundationData = {
        foundation: 'cncf',
        level: 'graduated',
        confidence: 100,
        source: 'organization',
      };
      const result = calculator.calculateFoundationAffiliation(foundationData, null);
      expect(result.score).toBe(100);
      expect(result.displayValue).toBe('CNCF (Graduated)');
    });

    it('should return 100 for Apache TLP', () => {
      const foundationData = {
        foundation: 'apache',
        level: 'tlp',
        confidence: 100,
        source: 'organization',
      };
      const result = calculator.calculateFoundationAffiliation(foundationData, null);
      expect(result.score).toBe(100);
      expect(result.displayValue).toBe('Apache (TLP)');
    });

    it('should return 100 for Linux Foundation AI & Data', () => {
      const foundationData = {
        foundation: 'linux-foundation',
        level: 'lfai-data',
        confidence: 85,
        source: 'readme',
      };
      const result = calculator.calculateFoundationAffiliation(foundationData, null);
      expect(result.score).toBe(100);
      expect(result.displayValue).toBe('Linux Foundation (LF AI & Data)');
    });

    it('should return 90 for CNCF incubating', () => {
      const foundationData = {
        foundation: 'cncf',
        level: 'incubating',
        confidence: 95,
        source: 'topic',
      };
      const result = calculator.calculateFoundationAffiliation(foundationData, null);
      expect(result.score).toBe(90);
      expect(result.displayValue).toBe('CNCF (Incubating)');
    });

    it('should return 80 for CNCF sandbox', () => {
      const foundationData = {
        foundation: 'cncf',
        level: 'sandbox',
        confidence: 95,
        source: 'topic',
      };
      const result = calculator.calculateFoundationAffiliation(foundationData, null);
      expect(result.score).toBe(80);
      expect(result.displayValue).toBe('CNCF (Sandbox)');
    });
  });
});
