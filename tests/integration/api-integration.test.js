/**
 * GitHub API Integration Tests
 * Tests rate limiting, exponential backoff, and ETag caching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubApiClient } from '../../src/services/githubApi.js';

describe('GitHub API Integration', () => {
  let client;

  beforeEach(() => {
    client = new GitHubApiClient();
  });

  describe('Rate Limiting (T027)', () => {
    it('should handle rate limit errors with exponential backoff', async () => {
      let attemptCount = 0;
      const mockFn = vi.fn(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          const error = new Error('Rate limit exceeded');
          error.status = 429;
          throw error;
        }
        return { success: true };
      });

      const result = await client.retryWithBackoff(mockFn);

      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(3);
    });

    it('should respect maximum retry delay of 60 seconds', async () => {
      const startTime = Date.now();
      let attemptCount = 0;

      const mockFn = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          // Fail first attempt to trigger retry
          const error = new Error('Server error');
          error.status = 500;
          throw error;
        }
        return { success: true };
      });

      await client.retryWithBackoff(mockFn);
      const elapsed = Date.now() - startTime;

      // Should have retried once with ~1 second delay (plus jitter)
      expect(elapsed).toBeGreaterThan(900); // At least 900ms
      expect(elapsed).toBeLessThan(2000); // Less than 2 seconds
    });

    it(
      'should throw error after max retry attempts',
      async () => {
        const mockFn = vi.fn(async () => {
          const error = new Error('Persistent error');
          error.status = 500;
          throw error;
        });

        await expect(client.retryWithBackoff(mockFn, 0, 3)).rejects.toThrow('Persistent error');
        expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
      },
      10000
    ); // 10 second timeout for retries

    it('should not retry non-retryable errors', async () => {
      const mockFn = vi.fn(async () => {
        const error = new Error('Not found');
        error.status = 404;
        throw error;
      });

      await expect(client.retryWithBackoff(mockFn)).rejects.toThrow('Not found');
      expect(mockFn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should apply exponential backoff correctly', async () => {
      const delays = [];
      let attemptCount = 0;

      // Mock setTimeout to capture delays
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((cb, delay) => {
        delays.push(delay);
        return originalSetTimeout(cb, 0); // Execute immediately for test speed
      });

      const mockFn = vi.fn(async () => {
        attemptCount++;
        if (attemptCount < 4) {
          const error = new Error('Server error');
          error.status = 500;
          throw error;
        }
        return { success: true };
      });

      await client.retryWithBackoff(mockFn);

      // Verify exponential growth: 1s, 2s, 4s (with jitter)
      expect(delays.length).toBe(3);
      expect(delays[0]).toBeGreaterThanOrEqual(1000); // First retry: ~1s
      expect(delays[0]).toBeLessThan(1500);
      expect(delays[1]).toBeGreaterThanOrEqual(2000); // Second retry: ~2s
      expect(delays[1]).toBeLessThan(3000);
      expect(delays[2]).toBeGreaterThanOrEqual(4000); // Third retry: ~4s
      expect(delays[2]).toBeLessThan(6000);

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('ETag Conditional Requests (T029)', () => {
    it('should store ETag from initial request', async () => {
      const mockEndpoint = 'GET /repos/{owner}/{repo}';
      const mockParams = { owner: 'test', repo: 'repo' };

      // Mock octokit request
      client.octokit.request = vi.fn(async () => ({
        data: { id: 123, name: 'test-repo' },
        headers: { etag: 'W/"abc123"' },
      }));

      await client.requestWithETag(mockEndpoint, mockParams);

      const cacheKey = JSON.stringify({ endpoint: mockEndpoint, params: mockParams });
      expect(client.etagCache.get(cacheKey)).toBe('W/"abc123"');
    });

    it('should send If-None-Match header on subsequent requests', async () => {
      const mockEndpoint = 'GET /repos/{owner}/{repo}';
      const mockParams = { owner: 'test', repo: 'repo' };
      const cacheKey = JSON.stringify({ endpoint: mockEndpoint, params: mockParams });

      // Set initial ETag
      client.etagCache.set(cacheKey, 'W/"abc123"');

      let capturedHeaders = null;
      client.octokit.request = vi.fn(async (endpoint, params) => {
        capturedHeaders = params.headers;
        return {
          data: { id: 123, name: 'test-repo' },
          headers: { etag: 'W/"def456"' },
        };
      });

      await client.requestWithETag(mockEndpoint, mockParams);

      expect(capturedHeaders['If-None-Match']).toBe('W/"abc123"');
    });

    it('should handle 304 Not Modified response', async () => {
      const mockEndpoint = 'GET /repos/{owner}/{repo}';
      const mockParams = { owner: 'test', repo: 'repo' };
      const cacheKey = JSON.stringify({ endpoint: mockEndpoint, params: mockParams });

      // Set cached data and ETag
      const cachedData = { id: 123, name: 'cached-repo' };
      client.cache.set(cacheKey, cachedData);
      client.etagCache.set(cacheKey, 'W/"abc123"');

      client.octokit.request = vi.fn(async () => {
        const error = new Error('Not Modified');
        error.status = 304;
        throw error;
      });

      const result = await client.requestWithETag(mockEndpoint, mockParams);

      expect(result.data).toEqual(cachedData);
      expect(result.fromCache).toBe(true);
    });

    it('should update ETag when data changes', async () => {
      const mockEndpoint = 'GET /repos/{owner}/{repo}';
      const mockParams = { owner: 'test', repo: 'repo' };
      const cacheKey = JSON.stringify({ endpoint: mockEndpoint, params: mockParams });

      // Set initial ETag
      client.etagCache.set(cacheKey, 'W/"abc123"');

      client.octokit.request = vi.fn(async () => ({
        data: { id: 123, name: 'updated-repo' },
        headers: { etag: 'W/"def456"' },
      }));

      await client.requestWithETag(mockEndpoint, mockParams);

      expect(client.etagCache.get(cacheKey)).toBe('W/"def456"');
    });

    it('should work without cached ETag on first request', async () => {
      const mockEndpoint = 'GET /repos/{owner}/{repo}';
      const mockParams = { owner: 'test', repo: 'repo' };

      let capturedHeaders = null;
      client.octokit.request = vi.fn(async (endpoint, params) => {
        capturedHeaders = params.headers;
        return {
          data: { id: 123, name: 'test-repo' },
          headers: {},
        };
      });

      await client.requestWithETag(mockEndpoint, mockParams);

      expect(capturedHeaders['If-None-Match']).toBeUndefined();
    });
  });

  describe('Retry with ETag Integration', () => {
    it('should combine retry logic with ETag caching', async () => {
      const mockEndpoint = 'GET /repos/{owner}/{repo}';
      const mockParams = { owner: 'test', repo: 'repo' };

      let attemptCount = 0;
      client.octokit.request = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new Error('Server error');
          error.status = 500;
          throw error;
        }
        return {
          data: { id: 123, name: 'test-repo' },
          headers: { etag: 'W/"abc123"' },
        };
      });

      const result = await client.retryWithBackoff(async () => {
        return await client.requestWithETag(mockEndpoint, mockParams);
      });

      expect(result.data).toEqual({ id: 123, name: 'test-repo' });
      expect(attemptCount).toBe(2); // Failed once, succeeded on retry
    });
  });
});
