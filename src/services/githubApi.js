/**
 * GitHub API Client Service
 * Handles all GitHub REST API interactions with rate limiting and caching
 */

import { Octokit } from '@octokit/rest';
import { CacheManager } from './cacheManager.js';

export class GitHubApiClient {
  constructor(token = null) {
    this.octokit = new Octokit(token ? { auth: token } : {});
    this.cache = new CacheManager('gpa');
    this.etagCache = new Map(); // Store ETags for conditional requests
    this.retryQueue = [];
    this.maxRetryDelay = 60000; // 60 seconds max
    this.baseRetryDelay = 1000; // 1 second base
  }

  /**
   * Exponential backoff with jitter
   * FR-034: Retry failed requests with exponential backoff (1s → 60s max)
   */
  async retryWithBackoff(fn, attempt = 0, maxAttempts = 5) {
    try {
      return await fn();
    } catch (error) {
      // Check if error is retryable (rate limit, network error, server error)
      const isRetryable =
        error.status === 429 || // Rate limit
        error.status >= 500 || // Server error
        error.code === 'ECONNRESET' || // Network error
        error.code === 'ETIMEDOUT';

      if (!isRetryable || attempt >= maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(
        this.baseRetryDelay * Math.pow(2, attempt),
        this.maxRetryDelay
      );
      const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
      const delay = exponentialDelay + jitter;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry with incremented attempt
      return this.retryWithBackoff(fn, attempt + 1, maxAttempts);
    }
  }

  /**
   * Make request with ETag support for conditional requests
   * Reduces API calls by checking If-None-Match header
   */
  async requestWithETag(endpoint, params) {
    const cacheKey = JSON.stringify({ endpoint, params });
    const cachedETag = this.etagCache.get(cacheKey);

    const headers = {};
    if (cachedETag) {
      headers['If-None-Match'] = cachedETag;
    }

    try {
      const response = await this.octokit.request(endpoint, {
        ...params,
        headers,
      });

      // Store new ETag if present
      if (response.headers.etag) {
        this.etagCache.set(cacheKey, response.headers.etag);
      }

      return response;
    } catch (error) {
      // 304 Not Modified - return cached data
      if (error.status === 304) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return { data: cached, fromCache: true };
        }
      }
      throw error;
    }
  }

  parseRepoUrl(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'github.com') {
        throw new Error('Not a GitHub URL');
      }

      const pathParts = urlObj.pathname.split('/').filter((p) => p);
      if (pathParts.length < 2) {
        throw new Error('Invalid repository URL');
      }

      const [owner, repo] = pathParts;
      return { owner, repo };
    } catch (error) {
      throw new Error(`Invalid GitHub URL: ${error.message}`);
    }
  }

  buildCacheKey(owner, repo, type) {
    return `repo:${owner}/${repo}:${type}`;
  }

  async getRepository(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'info');
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.retryWithBackoff(async () => {
      const response = await this.octokit.repos.get({ owner, repo });
      return response.data;
    });

    this.cache.set(cacheKey, data);
    return data;
  }

  async getContributors(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'contributors');
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.retryWithBackoff(async () => {
      const response = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100,
      });
      return response.data;
    });

    this.cache.set(cacheKey, data);
    return data;
  }

  async getCommits(owner, repo, since = null) {
    const cacheKey = this.buildCacheKey(owner, repo, `commits:${since || 'all'}`);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const params = { owner, repo, per_page: 100 };
    if (since) params.since = since;

    const data = await this.retryWithBackoff(async () => {
      const response = await this.octokit.repos.listCommits(params);
      return response.data;
    });

    this.cache.set(cacheKey, data);
    return data;
  }

  async getReleases(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'releases');
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.repos.listReleases({
      owner,
      repo,
      per_page: 10,
    });
    this.cache.set(cacheKey, data);
    return data;
  }

  async getIssues(owner, repo, state = 'all') {
    const cacheKey = this.buildCacheKey(owner, repo, `issues:${state}`);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100,
    });
    this.cache.set(cacheKey, data);
    return data;
  }

  async getPullRequests(owner, repo, state = 'all') {
    const cacheKey = this.buildCacheKey(owner, repo, `pulls:${state}`);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: 100,
    });
    this.cache.set(cacheKey, data);
    return data;
  }

  async getCommunityProfile(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'community');
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.repos.getCommunityProfileMetrics({ owner, repo });
    this.cache.set(cacheKey, data);
    return data;
  }

  async getReadme(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'readme');
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await this.octokit.repos.getReadme({
        owner,
        repo,
        mediaType: { format: 'raw' },
      });
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async checkRateLimit() {
    const { data } = await this.octokit.rateLimit.get();
    return data.rate;
  }
}
