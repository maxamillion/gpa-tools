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
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.repos.get({ owner, repo });
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getContributors(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'contributors');
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.repos.listContributors({
      owner,
      repo,
      per_page: 100,
    });
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getCommits(owner, repo, since = null) {
    const cacheKey = this.buildCacheKey(owner, repo, `commits:${since || 'all'}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const params = { owner, repo, per_page: 100 };
    if (since) params.since = since;

    const { data } = await this.octokit.repos.listCommits(params);
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getReleases(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'releases');
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.repos.listReleases({
      owner,
      repo,
      per_page: 10,
    });
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getIssues(owner, repo, state = 'all') {
    const cacheKey = this.buildCacheKey(owner, repo, `issues:${state}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100,
    });
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getPullRequests(owner, repo, state = 'all') {
    const cacheKey = this.buildCacheKey(owner, repo, `pulls:${state}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: 100,
    });
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getCommunityProfile(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'community');
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.repos.getCommunityProfileMetrics({ owner, repo });
    await this.cache.set(cacheKey, data);
    return data;
  }

  async getReadme(owner, repo) {
    const cacheKey = this.buildCacheKey(owner, repo, 'readme');
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await this.octokit.repos.getReadme({
        owner,
        repo,
        mediaType: { format: 'raw' },
      });
      await this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async getDirectoryContents(owner, repo, path = '') {
    const cacheKey = this.buildCacheKey(owner, repo, `contents:${path || 'root'}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      await this.cache.set(cacheKey, data);
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