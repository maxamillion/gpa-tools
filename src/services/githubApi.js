/**
 * GitHub API Service
 *
 * Wrapper around Octokit for GitHub API interactions.
 * Handles rate limiting, pagination, and error handling.
 */

import { Octokit } from '@octokit/rest';

export class GitHubApiService {
  /**
   * @param {string|null} token - Optional GitHub Personal Access Token
   */
  constructor(token = null) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'oss-health-analyzer/1.0',
    });
    this.token = token;
  }

  /**
   * Get repository metadata
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Repository data
   */
  async getRepository(owner, repo) {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return data;
  }

  /**
   * Get commits from the last N days
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} List of commits
   */
  async getCommits(owner, repo, days = 90) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const commits = await this.octokit.paginate(
        this.octokit.repos.listCommits,
        {
          owner,
          repo,
          since: since.toISOString(),
          per_page: 100,
        },
        response => response.data
      );
      return commits;
    } catch (error) {
      // Handle empty repositories
      if (error.status === 409) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get repository contributors
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} List of contributors
   */
  async getContributors(owner, repo) {
    try {
      const contributors = await this.octokit.paginate(
        this.octokit.repos.listContributors,
        {
          owner,
          repo,
          per_page: 100,
        },
        response => response.data
      );
      return contributors;
    } catch (error) {
      // Handle repositories with no contributors
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get repository issues (open and closed)
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} limit - Maximum number of issues to fetch per state
   * @returns {Promise<Object>} Issues data { open, closed, all }
   */
  async getIssues(owner, repo, limit = 100) {
    // Fetch open issues
    const openIssues = await this.octokit.paginate(
      this.octokit.issues.listForRepo,
      {
        owner,
        repo,
        state: 'open',
        per_page: 100,
      },
      (response, done) => {
        const issues = response.data.filter(issue => !issue.pull_request);
        if (issues.length >= limit) {
          done();
        }
        return issues;
      }
    );

    // Fetch recently closed issues (last 90 days)
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const closedIssues = await this.octokit.paginate(
      this.octokit.issues.listForRepo,
      {
        owner,
        repo,
        state: 'closed',
        since: since.toISOString(),
        per_page: 100,
      },
      (response, done) => {
        const issues = response.data.filter(issue => !issue.pull_request);
        if (issues.length >= limit) {
          done();
        }
        return issues;
      }
    );

    return {
      open: openIssues.slice(0, limit),
      closed: closedIssues.slice(0, limit),
      all: [...openIssues.slice(0, limit), ...closedIssues.slice(0, limit)],
    };
  }

  /**
   * Get repository pull requests
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} limit - Maximum number of PRs to fetch per state
   * @returns {Promise<Object>} Pull requests data { open, closed, merged }
   */
  async getPullRequests(owner, repo, limit = 100) {
    // Fetch all PRs (closed includes merged)
    const prs = await this.octokit.paginate(
      this.octokit.pulls.list,
      {
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      },
      (response, done) => {
        if (response.data.length >= limit) {
          done();
        }
        return response.data;
      }
    );

    const limitedPrs = prs.slice(0, limit);

    return {
      open: limitedPrs.filter(pr => pr.state === 'open'),
      closed: limitedPrs.filter(pr => pr.state === 'closed' && !pr.merged_at),
      merged: limitedPrs.filter(pr => pr.merged_at),
      all: limitedPrs,
    };
  }

  /**
   * Get repository releases
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} limit - Maximum number of releases to fetch
   * @returns {Promise<Array>} List of releases
   */
  async getReleases(owner, repo, limit = 20) {
    try {
      const { data } = await this.octokit.repos.listReleases({
        owner,
        repo,
        per_page: limit,
      });
      return data;
    } catch (error) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get community profile (health files)
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Community profile data
   */
  async getCommunityProfile(owner, repo) {
    try {
      const { data } = await this.octokit.repos.getCommunityProfileMetrics({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      // Some repos may not have this endpoint available
      if (error.status === 404) {
        return {
          health_percentage: 0,
          files: {},
        };
      }
      throw error;
    }
  }

  /**
   * Check if a file exists in the repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(owner, repo, path) {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file content
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @returns {Promise<string|null>} File content or null if not found
   */
  async getFileContent(owner, repo, path) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (data.type === 'file' && data.content) {
        return atob(data.content);
      }
      return null;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get rate limit status
   * @returns {Promise<Object>} Rate limit information
   */
  async getRateLimit() {
    const { data } = await this.octokit.rateLimit.get();
    return data.resources.core;
  }
}
