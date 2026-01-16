/**
 * Evaluation Orchestrator Service
 * Coordinates the entire repository evaluation process
 */

import { GitHubApiClient } from './githubApi.js';
import { MetricCalculator } from './metricCalculator.js';
import { CriterionEvaluator } from './CriterionEvaluator.js';

export class EvaluationOrchestrator {
  constructor(apiClient = null, calculator = null, criterionEvaluator = null) {
    this.apiClient = apiClient || new GitHubApiClient();
    this.calculator = calculator || new MetricCalculator();
    this.criterionEvaluator = criterionEvaluator || new CriterionEvaluator();
  }

  /**
   * Evaluate a GitHub repository
   * @param {string} owner - Repository owner
   * @param {string} name - Repository name
   * @param {Array} customCriteria - Optional custom criteria to evaluate
   * @returns {Promise<Object>} Evaluation result with metrics
   */
  async evaluate(owner, name, customCriteria = []) {
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

      // Evaluate custom criteria if provided
      let evaluatedCustomCriteria = [];
      if (customCriteria && customCriteria.length > 0) {
        const repoData = {
          language: repo.language,
          license: repo.license?.name,
          dependencies: {}, // TODO: Parse package.json for dependencies
          devDependencies: {},
          files: [], // TODO: Get file list from repo
        };

        evaluatedCustomCriteria = await Promise.all(
          customCriteria.map(async (criterion) => {
            const result = await this.criterionEvaluator.evaluate(criterion, repoData);
            return {
              ...criterion,
              ...result,
            };
          })
        );
      }

      // Return evaluation result
      return {
        repository: {
          owner,
          name,
          fullName: `${owner}/${name}`,
          url: `https://github.com/${owner}/${name}`,
        },
        metrics,
        customCriteria: evaluatedCustomCriteria,
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
