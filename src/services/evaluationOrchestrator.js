/**
 * Evaluation Orchestrator Service
 * Coordinates the entire repository evaluation process
 */

import { GitHubApiClient } from './githubApi.js';
import { MetricCalculator } from './metricCalculator.js';

export class EvaluationOrchestrator {
  constructor(apiClient = null, calculator = null) {
    this.apiClient = apiClient || new GitHubApiClient();
    this.calculator = calculator || new MetricCalculator();
  }

  /**
   * Evaluate a GitHub repository
   * @param {string} owner - Repository owner
   * @param {string} name - Repository name
   * @returns {Promise<Object>} Evaluation result with metrics
   */
  async evaluate(owner, name) {
    try {
      // Calculate date for commits filter (90 days ago)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const since = ninetyDaysAgo.toISOString().split('T')[0];

      // Fetch all required data from GitHub API
      const [repo, contributors, commits, releases, issues, pulls, community, readme] =
        await Promise.all([
          this.apiClient.getRepository(owner, name),
          this.apiClient.getContributors(owner, name),
          this.apiClient.getCommits(owner, name, since),
          this.apiClient.getReleases(owner, name),
          this.apiClient.getIssues(owner, name, 'all'),
          this.apiClient.getPullRequests(owner, name, 'all'),
          this.apiClient.getCommunityProfile(owner, name),
          this.apiClient.getReadme(owner, name),
        ]);

      // Calculate all metrics
      const metrics = await this.calculator.calculateAllMetrics({
        repo,
        contributors,
        commits,
        releases,
        issues,
        pulls,
        community,
        readme,
      });

      // Return evaluation result
      return {
        repository: {
          owner,
          name,
          fullName: `${owner}/${name}`,
          url: `https://github.com/${owner}/${name}`,
        },
        metrics,
        evaluatedAt: new Date().toISOString(),
      };
    } catch (error) {
      // Handle rate limiting errors
      if (error.status === 403 && error.message) {
        throw new Error(
          `GitHub API rate limit exceeded. Please try again later or provide authentication.`
        );
      }

      // Re-throw other errors
      throw error;
    }
  }
}
