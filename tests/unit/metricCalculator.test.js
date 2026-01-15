/**
 * Unit tests for metric calculator service
 * Following TDD: Write tests FIRST for all 18 baseline metrics
 */

import { describe, it, expect } from 'vitest';
import { MetricCalculator } from '../../src/services/metricCalculator.js';

describe('MetricCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new MetricCalculator();
  });

  describe('calculateCommitFrequency', () => {
    it('should calculate commits per week for last 90 days', () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const commits = [
        { commit: { author: { date: new Date().toISOString() } } },
        { commit: { author: { date: new Date().toISOString() } } },
        { commit: { author: { date: ninetyDaysAgo.toISOString() } } },
      ];

      const result = calculator.calculateCommitFrequency(commits);
      expect(result.value).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
    });

    it('should ignore commits older than 90 days', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      const commits = [{ commit: { author: { date: oldDate.toISOString() } } }];

      const result = calculator.calculateCommitFrequency(commits);
      expect(result.value).toBe(0);
    });
  });

  describe('calculateReleaseCadence', () => {
    it('should calculate average days between releases', () => {
      const releases = [
        { published_at: '2026-01-15T00:00:00Z' },
        { published_at: '2026-01-01T00:00:00Z' },
        { published_at: '2025-12-15T00:00:00Z' },
      ];

      const result = calculator.calculateReleaseCadence(releases);
      expect(result.value).toBeGreaterThan(0);
      expect(result.score).toBeDefined();
    });

    it('should return null for < 2 releases', () => {
      const result = calculator.calculateReleaseCadence([{ published_at: '2026-01-15T00:00:00Z' }]);
      expect(result.value).toBeNull();
    });
  });

  describe('calculateLastActivity', () => {
    it('should calculate days since last push', () => {
      const repo = { pushed_at: new Date().toISOString() };
      const result = calculator.calculateLastActivity(repo);
      expect(result.value).toBeLessThan(1);
    });

    it('should handle old repositories', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);
      const repo = { pushed_at: oldDate.toISOString() };

      const result = calculator.calculateLastActivity(repo);
      expect(result.value).toBeGreaterThan(90);
    });
  });

  describe('calculateContributorCount', () => {
    it('should count total contributors', () => {
      const contributors = [
        { login: 'user1', contributions: 100 },
        { login: 'user2', contributions: 50 },
        { login: 'user3', contributions: 25 },
      ];

      const result = calculator.calculateContributorCount(contributors);
      expect(result.value).toBe(3);
    });
  });

  describe('calculateNewContributors', () => {
    it('should count contributors with first commit in last 90 days', () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const commits = [
        { author: { login: 'user1' }, commit: { author: { date: new Date().toISOString() } } },
        { author: { login: 'user2' }, commit: { author: { date: new Date().toISOString() } } },
        {
          author: { login: 'user3' },
          commit: { author: { date: ninetyDaysAgo.toISOString() } },
        },
      ];

      const result = calculator.calculateNewContributors(commits);
      expect(result.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePRMergeRate', () => {
    it('should calculate percentage of merged PRs', () => {
      const pulls = [
        { merged_at: '2026-01-15T00:00:00Z' },
        { merged_at: '2026-01-14T00:00:00Z' },
        { merged_at: null },
        { merged_at: null },
      ];

      const result = calculator.calculatePRMergeRate(pulls);
      expect(result.value).toBe(50);
    });

    it('should return null for no PRs', () => {
      const result = calculator.calculatePRMergeRate([]);
      expect(result.value).toBeNull();
    });
  });

  describe('calculateOpenIssuesRatio', () => {
    it('should calculate percentage of open issues', () => {
      const issues = [
        { state: 'open', pull_request: null },
        { state: 'open', pull_request: null },
        { state: 'closed', pull_request: null },
        { state: 'closed', pull_request: null },
      ];

      const result = calculator.calculateOpenIssuesRatio(issues);
      expect(result.value).toBe(50);
    });

    it('should exclude pull requests', () => {
      const issues = [
        { state: 'open', pull_request: { url: 'pr-url' } },
        { state: 'open', pull_request: null },
      ];

      const result = calculator.calculateOpenIssuesRatio(issues);
      expect(result.value).toBe(100);
    });
  });

  describe('calculateStaleIssuesPercentage', () => {
    it('should calculate percentage of stale open issues', () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 91);

      const issues = [
        { state: 'open', pull_request: null, updated_at: new Date().toISOString() },
        { state: 'open', pull_request: null, updated_at: ninetyDaysAgo.toISOString() },
        { state: 'open', pull_request: null, updated_at: ninetyDaysAgo.toISOString() },
      ];

      const result = calculator.calculateStaleIssuesPercentage(issues);
      expect(result.value).toBeCloseTo(66.67, 1);
    });
  });

  describe('calculateAverageTimeToClose', () => {
    it('should calculate average days to close issues', () => {
      const issues = [
        {
          state: 'closed',
          pull_request: null,
          created_at: '2026-01-01T00:00:00Z',
          closed_at: '2026-01-08T00:00:00Z',
        },
        {
          state: 'closed',
          pull_request: null,
          created_at: '2026-01-01T00:00:00Z',
          closed_at: '2026-01-15T00:00:00Z',
        },
      ];

      const result = calculator.calculateAverageTimeToClose(issues);
      expect(result.value).toBeCloseTo(10.5, 1);
    });

    it('should return null for no closed issues', () => {
      const issues = [{ state: 'open', pull_request: null }];
      const result = calculator.calculateAverageTimeToClose(issues);
      expect(result.value).toBeNull();
    });
  });

  describe('calculateREADMEQuality', () => {
    it('should score README with all features as 5/5', () => {
      const readme = `
# Project Name

A comprehensive open source project with excellent documentation and community support.
This project provides a robust solution for managing complex workflows with ease.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install this project, run the following command:

\`\`\`bash
npm install
\`\`\`

## Usage

Here's a quick example of how to use this project:

\`\`\`javascript
const example = require('example');
example.doSomething();
\`\`\`

## Features

- Feature 1: Comprehensive documentation
- Feature 2: Active community support
- Feature 3: Regular updates and maintenance

![Build Status](https://img.shields.io/badge/build-passing-green)
      `;

      const result = calculator.calculateREADMEQuality(readme);
      expect(result.value).toBe(5);
    });

    it('should score empty README as 0/5', () => {
      const result = calculator.calculateREADMEQuality('');
      expect(result.value).toBe(0);
    });
  });

  describe('calculateBusFactor', () => {
    it('should calculate minimum contributors for 50% of commits', () => {
      const contributors = [
        { login: 'user1', contributions: 50 },
        { login: 'user2', contributions: 30 },
        { login: 'user3', contributions: 20 },
      ];

      const result = calculator.calculateBusFactor(contributors);
      expect(result.value).toBeGreaterThanOrEqual(1);
    });

    it('should handle single contributor', () => {
      const contributors = [{ login: 'user1', contributions: 100 }];
      const result = calculator.calculateBusFactor(contributors);
      expect(result.value).toBe(1);
    });
  });

  describe('calculateAllMetrics', () => {
    it('should calculate all 18 baseline metrics', async () => {
      const mockData = {
        repo: { pushed_at: new Date().toISOString() },
        contributors: [{ login: 'user1', contributions: 100 }],
        commits: [{ commit: { author: { date: new Date().toISOString() } } }],
        releases: [],
        issues: [],
        pulls: [],
        readme: '# Test',
        community: { files: {} },
      };

      const metrics = await calculator.calculateAllMetrics(mockData);
      expect(metrics).toHaveLength(18);
      metrics.forEach((metric) => {
        expect(metric.id).toBeDefined();
        expect(metric.score).toBeGreaterThanOrEqual(0);
        expect(metric.score).toBeLessThanOrEqual(100);
      });
    });
  });
});
