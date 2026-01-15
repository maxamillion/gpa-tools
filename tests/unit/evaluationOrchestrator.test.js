/**
 * Unit tests for Evaluation Orchestrator Service
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvaluationOrchestrator } from '../../src/services/evaluationOrchestrator.js';

describe('EvaluationOrchestrator', () => {
  let orchestrator;
  let mockApiClient;
  let mockCalculator;

  beforeEach(() => {
    mockApiClient = {
      getRepository: vi.fn(),
      getContributors: vi.fn(),
      getCommits: vi.fn(),
      getReleases: vi.fn(),
      getIssues: vi.fn(),
      getPullRequests: vi.fn(),
      getCommunityProfile: vi.fn(),
      getReadme: vi.fn(),
    };

    mockCalculator = {
      calculateAllMetrics: vi.fn(),
    };

    orchestrator = new EvaluationOrchestrator(mockApiClient, mockCalculator);
  });

  describe('Constructor', () => {
    it('should create orchestrator with API client and calculator', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.apiClient).toBe(mockApiClient);
      expect(orchestrator.calculator).toBe(mockCalculator);
    });

    it('should create default API client if none provided', () => {
      const orchWithDefaults = new EvaluationOrchestrator();
      expect(orchWithDefaults.apiClient).toBeDefined();
      expect(orchWithDefaults.calculator).toBeDefined();
    });
  });

  describe('evaluate', () => {
    const mockRepoData = { full_name: 'facebook/react', pushed_at: new Date().toISOString() };
    const mockContributors = [{ login: 'user1', contributions: 100 }];
    const mockCommits = [{ commit: { author: { date: new Date().toISOString() } } }];
    const mockReleases = [{ published_at: new Date().toISOString() }];
    const mockIssues = [{ state: 'open', pull_request: null }];
    const mockPulls = [{ merged_at: new Date().toISOString() }];
    const mockCommunity = { files: { license: true } };
    const mockReadme = '# Test README';

    beforeEach(() => {
      mockApiClient.getRepository.mockResolvedValue(mockRepoData);
      mockApiClient.getContributors.mockResolvedValue(mockContributors);
      mockApiClient.getCommits.mockResolvedValue(mockCommits);
      mockApiClient.getReleases.mockResolvedValue(mockReleases);
      mockApiClient.getIssues.mockResolvedValue(mockIssues);
      mockApiClient.getPullRequests.mockResolvedValue(mockPulls);
      mockApiClient.getCommunityProfile.mockResolvedValue(mockCommunity);
      mockApiClient.getReadme.mockResolvedValue(mockReadme);
      mockCalculator.calculateAllMetrics.mockReturnValue([{ id: 'test-metric', score: 85 }]);
    });

    it('should fetch all required data from GitHub API', async () => {
      await orchestrator.evaluate('facebook', 'react');

      expect(mockApiClient.getRepository).toHaveBeenCalledWith('facebook', 'react');
      expect(mockApiClient.getContributors).toHaveBeenCalledWith('facebook', 'react');
      expect(mockApiClient.getCommits).toHaveBeenCalledWith('facebook', 'react', expect.any(String));
      expect(mockApiClient.getReleases).toHaveBeenCalledWith('facebook', 'react');
      expect(mockApiClient.getIssues).toHaveBeenCalledWith('facebook', 'react', 'all');
      expect(mockApiClient.getPullRequests).toHaveBeenCalledWith('facebook', 'react', 'all');
      expect(mockApiClient.getCommunityProfile).toHaveBeenCalledWith('facebook', 'react');
      expect(mockApiClient.getReadme).toHaveBeenCalledWith('facebook', 'react');
    });

    it('should calculate all metrics with fetched data', async () => {
      await orchestrator.evaluate('facebook', 'react');

      expect(mockCalculator.calculateAllMetrics).toHaveBeenCalledWith({
        repo: mockRepoData,
        contributors: mockContributors,
        commits: mockCommits,
        releases: mockReleases,
        issues: mockIssues,
        pulls: mockPulls,
        community: mockCommunity,
        readme: mockReadme,
      });
    });

    it('should return evaluation result with metrics', async () => {
      const result = await orchestrator.evaluate('facebook', 'react');

      expect(result).toHaveProperty('repository');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('evaluatedAt');
      expect(result.repository).toHaveProperty('owner', 'facebook');
      expect(result.repository).toHaveProperty('name', 'react');
      expect(result.metrics).toBeInstanceOf(Array);
    });

    it('should include evaluation timestamp', async () => {
      const beforeEval = new Date();
      const result = await orchestrator.evaluate('facebook', 'react');
      const afterEval = new Date();

      expect(result.evaluatedAt).toBeDefined();
      const evalTime = new Date(result.evaluatedAt);
      expect(evalTime.getTime()).toBeGreaterThanOrEqual(beforeEval.getTime());
      expect(evalTime.getTime()).toBeLessThanOrEqual(afterEval.getTime());
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.getRepository.mockRejectedValue(new Error('Repository not found'));

      await expect(orchestrator.evaluate('invalid', 'repo')).rejects.toThrow('Repository not found');
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('API rate limit exceeded');
      rateLimitError.status = 403;
      mockApiClient.getRepository.mockRejectedValue(rateLimitError);

      await expect(orchestrator.evaluate('facebook', 'react')).rejects.toThrow('rate limit');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch commits from last 90 days', async () => {
      mockApiClient.getRepository.mockResolvedValue({ pushed_at: new Date().toISOString() });
      mockApiClient.getContributors.mockResolvedValue([]);
      mockApiClient.getCommits.mockResolvedValue([]);
      mockApiClient.getReleases.mockResolvedValue([]);
      mockApiClient.getIssues.mockResolvedValue([]);
      mockApiClient.getPullRequests.mockResolvedValue([]);
      mockApiClient.getCommunityProfile.mockResolvedValue({ files: {} });
      mockApiClient.getReadme.mockResolvedValue('');
      mockCalculator.calculateAllMetrics.mockReturnValue([]);

      await orchestrator.evaluate('facebook', 'react');

      const sinceArg = mockApiClient.getCommits.mock.calls[0][2];
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const sinceDate = new Date(sinceArg);
      const expectedDate = new Date(ninetyDaysAgo.toISOString().split('T')[0]);

      expect(sinceDate.toISOString().split('T')[0]).toBe(expectedDate.toISOString().split('T')[0]);
    });

    it('should fetch all issues (open and closed)', async () => {
      mockApiClient.getRepository.mockResolvedValue({ pushed_at: new Date().toISOString() });
      mockApiClient.getContributors.mockResolvedValue([]);
      mockApiClient.getCommits.mockResolvedValue([]);
      mockApiClient.getReleases.mockResolvedValue([]);
      mockApiClient.getIssues.mockResolvedValue([]);
      mockApiClient.getPullRequests.mockResolvedValue([]);
      mockApiClient.getCommunityProfile.mockResolvedValue({ files: {} });
      mockApiClient.getReadme.mockResolvedValue('');
      mockCalculator.calculateAllMetrics.mockReturnValue([]);

      await orchestrator.evaluate('facebook', 'react');

      expect(mockApiClient.getIssues).toHaveBeenCalledWith('facebook', 'react', 'all');
    });
  });
});
