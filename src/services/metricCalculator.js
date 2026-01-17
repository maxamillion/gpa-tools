/**
 * Metric Calculator Service
 * Implements calculation logic for all 18 baseline metrics
 * Per contracts/metrics-schema.md
 */

import { Metric } from '../models/Metric.js';
import { getMetricDefinition } from '../config/metricDefinitions.js';
import { getThreshold } from '../config/thresholds.js';
import {
  scoreCommitFrequency,
  scoreReleaseCadence,
  scoreLastActivity,
  scoreContributorCount,
  scoreNewContributors,
  scorePRMergeRate,
  scoreOpenIssuesRatio,
  scoreIssueResponseTime,
  scoreStaleIssuesPercentage,
  scoreAverageTimeToClose,
  scoreREADMEQuality,
  scoreBusFactor,
} from '../utils/scoring.js';

export class MetricCalculator {
  calculateCommitFrequency(commits) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentCommits = commits.filter((c) => {
      const commitDate = new Date(c.commit.author.date);
      return commitDate >= ninetyDaysAgo;
    });

    const weeks = 90 / 7;
    const value = recentCommits.length / weeks;
    const { score, grade } = scoreCommitFrequency(value);

    const def = getMetricDefinition('commit-frequency');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: Number(value.toFixed(2)),
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateReleaseCadence(releases) {
    if (releases.length < 2) {
      const def = getMetricDefinition('release-cadence');
      const { score, grade } = scoreReleaseCadence(null);
      return new Metric({
        id: def.id,
        name: def.name,
        category: def.category,
        value: null,
        score,
        grade,
        explanation: def.explanation,
        whyItMatters: def.whyItMatters,
        threshold: getThreshold(def.id),
        dataSource: def.dataSource,
        calculatedAt: new Date(),
        confidence: 'low',
      });
    }

    const recentReleases = releases.slice(0, Math.min(5, releases.length));
    const intervals = [];

    for (let i = 0; i < recentReleases.length - 1; i++) {
      const current = new Date(recentReleases[i].published_at);
      const next = new Date(recentReleases[i + 1].published_at);
      const daysDiff = (current - next) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }

    const value = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const { score, grade } = scoreReleaseCadence(value);

    const def = getMetricDefinition('release-cadence');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: Number(value.toFixed(2)),
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateLastActivity(repo) {
    const lastPush = new Date(repo.pushed_at);
    const now = new Date();
    const value = Math.floor((now - lastPush) / (1000 * 60 * 60 * 24));

    const { score, grade } = scoreLastActivity(value);

    const def = getMetricDefinition('last-activity');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateContributorCount(contributors) {
    const value = contributors.length;
    const { score, grade } = scoreContributorCount(value);

    const def = getMetricDefinition('contributor-count');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateNewContributors(commits) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const authorFirstCommit = {};

    commits.forEach((commit) => {
      const author = commit.author?.login;
      if (!author) return;

      const date = new Date(commit.commit.author.date);
      if (!authorFirstCommit[author] || date < authorFirstCommit[author]) {
        authorFirstCommit[author] = date;
      }
    });

    const value = Object.values(authorFirstCommit).filter((date) => date >= ninetyDaysAgo).length;

    const { score, grade } = scoreNewContributors(value);

    const def = getMetricDefinition('new-contributors');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'medium',
    });
  }

  calculatePRMergeRate(pulls) {
    if (pulls.length === 0) {
      const def = getMetricDefinition('pr-merge-rate');
      const { score, grade } = scorePRMergeRate(null);
      return new Metric({
        id: def.id,
        name: def.name,
        category: def.category,
        value: null,
        score,
        grade,
        explanation: def.explanation,
        whyItMatters: def.whyItMatters,
        threshold: getThreshold(def.id),
        dataSource: def.dataSource,
        calculatedAt: new Date(),
        confidence: 'low',
      });
    }

    const mergedCount = pulls.filter((pr) => pr.merged_at !== null).length;
    const value = (mergedCount / pulls.length) * 100;
    const { score, grade } = scorePRMergeRate(value);

    const def = getMetricDefinition('pr-merge-rate');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: Number(value.toFixed(2)),
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateOpenIssuesRatio(issues) {
    const actualIssues = issues.filter((i) => !i.pull_request);

    if (actualIssues.length === 0) {
      const def = getMetricDefinition('open-issues-ratio');
      const { score, grade } = scoreOpenIssuesRatio(null);
      return new Metric({
        id: def.id,
        name: def.name,
        category: def.category,
        value: null,
        score,
        grade,
        explanation: def.explanation,
        whyItMatters: def.whyItMatters,
        threshold: getThreshold(def.id),
        dataSource: def.dataSource,
        calculatedAt: new Date(),
        confidence: 'low',
      });
    }

    const openCount = actualIssues.filter((i) => i.state === 'open').length;
    const value = (openCount / actualIssues.length) * 100;
    const { score, grade } = scoreOpenIssuesRatio(value);

    const def = getMetricDefinition('open-issues-ratio');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: Number(value.toFixed(2)),
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateIssueResponseTime(_issues) {
    // Simplified - would need comments API in real implementation
    const def = getMetricDefinition('issue-response-time');
    const { score, grade } = scoreIssueResponseTime(null);
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: null,
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'low',
    });
  }

  calculateStaleIssuesPercentage(issues) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const openIssues = issues.filter((i) => !i.pull_request && i.state === 'open');

    if (openIssues.length === 0) {
      const def = getMetricDefinition('stale-issues-percentage');
      const { score, grade } = scoreStaleIssuesPercentage(null);
      return new Metric({
        id: def.id,
        name: def.name,
        category: def.category,
        value: null,
        score,
        grade,
        explanation: def.explanation,
        whyItMatters: def.whyItMatters,
        threshold: getThreshold(def.id),
        dataSource: def.dataSource,
        calculatedAt: new Date(),
        confidence: 'low',
      });
    }

    const staleCount = openIssues.filter((i) => new Date(i.updated_at) < ninetyDaysAgo).length;

    const value = (staleCount / openIssues.length) * 100;
    const { score, grade } = scoreStaleIssuesPercentage(value);

    const def = getMetricDefinition('stale-issues-percentage');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: Number(value.toFixed(2)),
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateAverageTimeToClose(issues) {
    const closedIssues = issues.filter(
      (i) => !i.pull_request && i.state === 'closed' && i.closed_at
    );

    if (closedIssues.length === 0) {
      const def = getMetricDefinition('average-time-to-close');
      const { score, grade } = scoreAverageTimeToClose(null);
      return new Metric({
        id: def.id,
        name: def.name,
        category: def.category,
        value: null,
        score,
        grade,
        explanation: def.explanation,
        whyItMatters: def.whyItMatters,
        threshold: getThreshold(def.id),
        dataSource: def.dataSource,
        calculatedAt: new Date(),
        confidence: 'low',
      });
    }

    const closeTimes = closedIssues.map((i) => {
      const created = new Date(i.created_at);
      const closed = new Date(i.closed_at);
      return (closed - created) / (1000 * 60 * 60 * 24);
    });

    const value = closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
    const { score, grade } = scoreAverageTimeToClose(value);

    const def = getMetricDefinition('average-time-to-close');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: Number(value.toFixed(2)),
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateREADMEQuality(readme) {
    let value = 0;

    if (!readme) {
      value = 0;
    } else {
      if (readme.length > 500) value++;
      if (/##?\s*(install|installation|getting started|setup)/i.test(readme)) value++;
      if (/##?\s*(usage|example|quick start)/i.test(readme)) value++;
      if (/!\[.*\]\(https:\/\/(img\.shields\.io|badge)/i.test(readme)) value++;
      if (/##?\s*(table of contents|toc)/i.test(readme)) value++;
    }

    const { score, grade } = scoreREADMEQuality(value);

    const def = getMetricDefinition('readme-quality');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateDocumentationDirectory(rootContents) {
    let hasDocsDir = false;

    if (Array.isArray(rootContents)) {
      hasDocsDir = rootContents.some(
        (item) =>
          item.type === 'dir' && ['docs', 'doc', 'documentation'].includes(item.name.toLowerCase())
      );
    }

    const def = getMetricDefinition('documentation-directory');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value: hasDocsDir,
      score: hasDocsDir ? 100 : 0,
      grade: hasDocsDir ? 'Pass' : 'Fail',
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateWikiPresence(repo) {
    const value = repo.has_wiki && repo.wiki_url !== null;
    const def = getMetricDefinition('wiki-presence');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score: value ? 100 : 0,
      grade: value ? 'Pass' : 'Fail',
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateSecurityPolicy(community) {
    const value = Boolean(community.files?.security);
    const def = getMetricDefinition('security-policy');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score: value ? 100 : 0,
      grade: value ? 'Pass' : 'Fail',
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateCodeOfConduct(community) {
    const value = Boolean(community.files?.code_of_conduct);
    const def = getMetricDefinition('code-of-conduct');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score: value ? 100 : 0,
      grade: value ? 'Pass' : 'Fail',
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateContributingGuidelines(community) {
    const value = Boolean(community.files?.contributing);
    const def = getMetricDefinition('contributing-guidelines');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score: value ? 100 : 0,
      grade: value ? 'Pass' : 'Fail',
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateLicense(community) {
    const value = Boolean(community.files?.license);
    const def = getMetricDefinition('license');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score: value ? 100 : 0,
      grade: value ? 'Pass' : 'Fail',
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  calculateBusFactor(contributors) {
    if (contributors.length === 0) {
      const def = getMetricDefinition('bus-factor');
      const { score, grade } = scoreBusFactor(0);
      return new Metric({
        id: def.id,
        name: def.name,
        category: def.category,
        value: 0,
        score,
        grade,
        explanation: def.explanation,
        whyItMatters: def.whyItMatters,
        threshold: getThreshold(def.id),
        dataSource: def.dataSource,
        calculatedAt: new Date(),
        confidence: 'high',
      });
    }

    const sorted = [...contributors].sort((a, b) => b.contributions - a.contributions);
    const totalContributions = sorted.reduce((sum, c) => sum + c.contributions, 0);
    const halfContributions = totalContributions * 0.5;

    let cumulative = 0;
    let value = 0;

    for (const contributor of sorted) {
      cumulative += contributor.contributions;
      value++;
      if (cumulative >= halfContributions) break;
    }

    const { score, grade } = scoreBusFactor(value);

    const def = getMetricDefinition('bus-factor');
    return new Metric({
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      score,
      grade,
      explanation: def.explanation,
      whyItMatters: def.whyItMatters,
      threshold: getThreshold(def.id),
      dataSource: def.dataSource,
      calculatedAt: new Date(),
      confidence: 'high',
    });
  }

  async calculateAllMetrics(data) {
    const metrics = [
      // Activity (3)
      this.calculateCommitFrequency(data.commits),
      this.calculateReleaseCadence(data.releases),
      this.calculateLastActivity(data.repo),

      // Community (3)
      this.calculateContributorCount(data.contributors),
      this.calculateNewContributors(data.commits),
      this.calculatePRMergeRate(data.pulls),

      // Maintenance (4)
      this.calculateOpenIssuesRatio(data.issues),
      this.calculateIssueResponseTime(data.issues),
      this.calculateStaleIssuesPercentage(data.issues),
      this.calculateAverageTimeToClose(data.issues),

      // Documentation (3)
      this.calculateREADMEQuality(data.readme),
      this.calculateDocumentationDirectory(data.rootContents),
      this.calculateWikiPresence(data.repo),

      // Security & Governance (5)
      this.calculateSecurityPolicy(data.community),
      this.calculateCodeOfConduct(data.community),
      this.calculateContributingGuidelines(data.community),
      this.calculateLicense(data.community),
      this.calculateBusFactor(data.contributors),
    ];

    return metrics;
  }
}
