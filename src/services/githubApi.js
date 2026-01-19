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

  /**
   * Get governance-related files from repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Governance files data
   */
  async getGovernanceFiles(owner, repo) {
    const governanceFiles = {
      governance: null,
      steering: null,
      tsc: null,
      owners: null,
      maintainers: null,
      codeowners: null,
    };

    // Files to check with their possible locations
    const fileChecks = [
      { key: 'governance', paths: ['GOVERNANCE.md', 'governance.md', 'docs/GOVERNANCE.md', '.github/GOVERNANCE.md'] },
      { key: 'steering', paths: ['STEERING.md', 'STEERING-COMMITTEE.md', 'docs/governance/STEERING.md'] },
      { key: 'tsc', paths: ['TSC.md', 'docs/TSC.md', 'TECHNICAL-STEERING-COMMITTEE.md'] },
      { key: 'owners', paths: ['OWNERS', 'OWNERS.md', 'docs/OWNERS'] },
      { key: 'maintainers', paths: ['MAINTAINERS', 'MAINTAINERS.md', 'docs/MAINTAINERS.md'] },
      { key: 'codeowners', paths: ['CODEOWNERS', '.github/CODEOWNERS', 'docs/CODEOWNERS'] },
    ];

    // Check files in parallel
    const checkPromises = fileChecks.map(async ({ key, paths }) => {
      for (const path of paths) {
        const exists = await this.fileExists(owner, repo, path);
        if (exists) {
          // Try to get content for quality assessment
          const content = await this.getFileContent(owner, repo, path);
          return { key, path, exists: true, contentLength: content?.length || 0 };
        }
      }
      return { key, path: null, exists: false, contentLength: 0 };
    });

    const results = await Promise.all(checkPromises);
    for (const result of results) {
      if (result.exists) {
        governanceFiles[result.key] = {
          path: result.path,
          contentLength: result.contentLength,
        };
      }
    }

    return governanceFiles;
  }

  /**
   * Get OpenSSF Best Practices badge status
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} OpenSSF badge data
   */
  async getOpenSSFBadge(owner, repo) {
    const repoUrl = `https://github.com/${owner}/${repo}`;

    // Try OpenSSF API first
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://www.bestpractices.dev/projects.json?url=${encodeURIComponent(repoUrl)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const project = data[0];
          // Map badge_level to our levels
          // OpenSSF returns: in_progress, passing, silver, gold
          const level = project.badge_level || 'in_progress';
          return {
            found: true,
            source: 'api',
            level: level,
            projectId: project.id,
            percentComplete: project.badge_percentage_0 || 0,
          };
        }
      }
    } catch {
      // API failed or timed out, fall back to README
    }

    // Fallback: Check README for badge
    try {
      const readme = await this.getFileContent(owner, repo, 'README.md');
      if (readme) {
        // Check for OpenSSF badge patterns
        const badgePatterns = [
          /bestpractices\.dev\/projects\/(\d+)\/badge/,
          /cii-best-practices-badge.*?(\d+)/,
          /openssf.*?badge/i,
        ];

        for (const pattern of badgePatterns) {
          const match = readme.match(pattern);
          if (match) {
            // Try to determine level from badge URL or surrounding text
            if (readme.includes('gold')) {
              return { found: true, source: 'readme', level: 'gold' };
            } else if (readme.includes('silver')) {
              return { found: true, source: 'readme', level: 'silver' };
            } else if (readme.includes('passing')) {
              return { found: true, source: 'readme', level: 'passing' };
            }
            return { found: true, source: 'readme', level: 'in_progress' };
          }
        }
      }
    } catch {
      // README check failed
    }

    return { found: false, source: null, level: 'none' };
  }

  /**
   * Detect foundation affiliation for the repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} repository - Repository data (already fetched)
   * @returns {Promise<Object>} Foundation affiliation data
   */
  async detectFoundationAffiliation(owner, repo, repository = null) {
    const result = {
      foundation: null,
      level: null,
      confidence: 0,
      source: null,
    };

    // 1. Check GitHub organization (highest confidence)
    const orgAffiliations = {
      'apache': { foundation: 'apache', level: 'tlp', confidence: 100 },
      'kubernetes': { foundation: 'cncf', level: 'graduated', confidence: 100 },
      'cncf': { foundation: 'cncf', level: 'member', confidence: 95 },
      'linux-foundation': { foundation: 'linux-foundation', level: 'member', confidence: 100 },
      'lfai': { foundation: 'linux-foundation', level: 'lfai-data', confidence: 100 },
      'lf-edge': { foundation: 'linux-foundation', level: 'lf-edge', confidence: 100 },
      'openjs-foundation': { foundation: 'openjs', level: 'member', confidence: 100 },
      'eclipse': { foundation: 'eclipse', level: 'member', confidence: 100 },
      'eclipse-ee4j': { foundation: 'eclipse', level: 'member', confidence: 100 },
    };

    const ownerLower = owner.toLowerCase();
    if (orgAffiliations[ownerLower]) {
      return {
        ...orgAffiliations[ownerLower],
        source: 'organization',
      };
    }

    // 2. Check repository topics (high confidence)
    const repoData = repository || await this.getRepository(owner, repo);
    const topics = repoData.topics || [];

    const topicMappings = {
      'cncf-graduated': { foundation: 'cncf', level: 'graduated', confidence: 95 },
      'cncf-incubating': { foundation: 'cncf', level: 'incubating', confidence: 95 },
      'cncf-sandbox': { foundation: 'cncf', level: 'sandbox', confidence: 95 },
      'linux-foundation': { foundation: 'linux-foundation', level: 'member', confidence: 90 },
      'lfai': { foundation: 'linux-foundation', level: 'lfai-data', confidence: 90 },
      'apache': { foundation: 'apache', level: 'tlp', confidence: 85 },
      'openjs': { foundation: 'openjs', level: 'member', confidence: 85 },
      'eclipse': { foundation: 'eclipse', level: 'member', confidence: 85 },
    };

    for (const topic of topics) {
      const topicLower = topic.toLowerCase();
      if (topicMappings[topicLower]) {
        return {
          ...topicMappings[topicLower],
          source: 'topic',
        };
      }
    }

    // 3. Check README for foundation mentions (moderate confidence)
    try {
      const readme = await this.getFileContent(owner, repo, 'README.md');
      if (readme) {
        const readmePatterns = [
          { pattern: /linux foundation ai|lfai|lf ai & data/i, foundation: 'linux-foundation', level: 'lfai-data', confidence: 85 },
          { pattern: /cloud native computing foundation|cncf/i, foundation: 'cncf', level: 'member', confidence: 80 },
          { pattern: /apache software foundation/i, foundation: 'apache', level: 'tlp', confidence: 80 },
          { pattern: /linux foundation/i, foundation: 'linux-foundation', level: 'member', confidence: 75 },
          { pattern: /openjs foundation/i, foundation: 'openjs', level: 'member', confidence: 80 },
          { pattern: /eclipse foundation/i, foundation: 'eclipse', level: 'member', confidence: 80 },
        ];

        // Also check for CNCF badge images
        if (readme.includes('cncf.io') || readme.includes('landscapeapp.io')) {
          const cncfMatch = readme.match(/cncf.*?(graduated|incubating|sandbox)/i);
          if (cncfMatch) {
            return {
              foundation: 'cncf',
              level: cncfMatch[1].toLowerCase(),
              confidence: 85,
              source: 'readme_badge',
            };
          }
        }

        for (const { pattern, foundation, level, confidence } of readmePatterns) {
          if (pattern.test(readme)) {
            return { foundation, level, confidence, source: 'readme' };
          }
        }
      }
    } catch {
      // README check failed
    }

    // 4. Check description and homepage (lower confidence)
    if (repoData.description) {
      const descLower = repoData.description.toLowerCase();
      if (descLower.includes('cncf') || descLower.includes('cloud native')) {
        return { foundation: 'cncf', level: 'member', confidence: 70, source: 'description' };
      }
      if (descLower.includes('apache')) {
        return { foundation: 'apache', level: 'tlp', confidence: 70, source: 'description' };
      }
      if (descLower.includes('linux foundation') || descLower.includes('lfai')) {
        return { foundation: 'linux-foundation', level: 'member', confidence: 70, source: 'description' };
      }
    }

    return result;
  }
}
