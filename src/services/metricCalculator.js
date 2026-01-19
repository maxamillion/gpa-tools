/**
 * Metric Calculator
 *
 * Calculates all 25 baseline metrics from GitHub API data.
 */

import { METRIC_DEFINITIONS } from '../config/metricDefinitions.js';
import { METRIC_THRESHOLDS, getScoreLevel } from '../config/thresholds.js';

export class MetricCalculator {
  /**
   * Calculate all metrics from repository data
   * @param {Object} data - Repository data from GitHub API
   * @returns {Array<Object>} Calculated metrics with scores
   */
  calculateAll(data) {
    const metrics = [];

    // Activity metrics
    metrics.push(this.calculateCommitFrequency(data.commits));
    metrics.push(this.calculateReleaseCadence(data.releases));
    metrics.push(this.calculateLastActivity(data.commits, data.repository));
    metrics.push(this.calculatePRVelocity(data.pullRequests));

    // Community metrics
    metrics.push(this.calculateContributorCount(data.contributors));
    metrics.push(this.calculateBusFactor(data.contributors));
    metrics.push(this.calculateNewContributors(data.commits));
    metrics.push(this.calculateOrgDiversity(data.contributors));
    metrics.push(this.calculatePRMergeRate(data.pullRequests));

    // Responsiveness metrics
    metrics.push(this.calculateIssueResponseTime(data.issues));
    metrics.push(this.calculateIssueCloseTime(data.issues));
    metrics.push(this.calculateStaleIssuesRatio(data.issues));
    metrics.push(this.calculateOpenIssuesRatio(data.issues, data.repository));

    // Documentation metrics
    metrics.push(this.calculateReadmeQuality(data.communityProfile, data.repository));
    metrics.push(this.calculateContributingGuide(data.communityProfile));
    metrics.push(this.calculateDocsDirectory(data.communityProfile));
    metrics.push(this.calculateChangelog(data.communityProfile));

    // Security metrics
    metrics.push(this.calculateSecurityPolicy(data.communityProfile));
    metrics.push(this.calculateLicense(data.repository));
    metrics.push(this.calculateCodeOfConduct(data.communityProfile));
    metrics.push(this.calculateVulnerabilityReporting(data.communityProfile));

    // Governance metrics
    metrics.push(this.calculateGovernanceDocs(data.governanceFiles));
    metrics.push(this.calculateMaintainerCount(data.contributors, data.pullRequests));
    metrics.push(this.calculateOpenSSFBadge(data.openSSFBadge));
    metrics.push(this.calculateFoundationAffiliation(data.foundationAffiliation, data.governanceFiles));

    return metrics;
  }

  // ============================================================================
  // ACTIVITY METRICS
  // ============================================================================

  /**
   * Calculate commits per week (90 days)
   */
  calculateCommitFrequency(commits) {
    const metricDef = METRIC_DEFINITIONS['commit-frequency'];
    const weeks = 90 / 7; // ~12.86 weeks
    const rawValue = commits.length / weeks;
    const score = this.calculateScore('commit-frequency', rawValue);

    return {
      ...metricDef,
      rawValue: Math.round(rawValue * 10) / 10,
      displayValue: `${Math.round(rawValue * 10) / 10} commits/week`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate average days between releases
   */
  calculateReleaseCadence(releases) {
    const metricDef = METRIC_DEFINITIONS['release-cadence'];

    if (releases.length < 2) {
      return {
        ...metricDef,
        rawValue: null,
        displayValue: 'No recent releases',
        score: 0,
        level: getScoreLevel(0),
      };
    }

    // Calculate average days between last 5 releases
    const recentReleases = releases.slice(0, 5);
    let totalDays = 0;
    let intervals = 0;

    for (let i = 0; i < recentReleases.length - 1; i++) {
      const current = new Date(recentReleases[i].published_at);
      const prev = new Date(recentReleases[i + 1].published_at);
      totalDays += (current - prev) / (1000 * 60 * 60 * 24);
      intervals++;
    }

    const rawValue = intervals > 0 ? totalDays / intervals : 365;
    const score = this.calculateScore('release-cadence', rawValue);

    return {
      ...metricDef,
      rawValue: Math.round(rawValue),
      displayValue: `${Math.round(rawValue)} days`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate days since last commit
   */
  calculateLastActivity(commits, repository) {
    const metricDef = METRIC_DEFINITIONS['last-activity'];

    let lastDate;
    if (commits.length > 0) {
      lastDate = new Date(commits[0].commit.author.date);
    } else if (repository.pushed_at) {
      lastDate = new Date(repository.pushed_at);
    } else {
      lastDate = new Date(repository.updated_at);
    }

    const daysSinceActivity = Math.floor(
      (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const score = this.calculateScore('last-activity', daysSinceActivity);

    return {
      ...metricDef,
      rawValue: daysSinceActivity,
      displayValue: `${daysSinceActivity} days ago`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate PRs merged per month
   */
  calculatePRVelocity(pullRequests) {
    const metricDef = METRIC_DEFINITIONS['pr-velocity'];
    const months = 3; // Looking at 90 days of data
    const mergedCount = pullRequests.merged?.length || 0;
    const rawValue = mergedCount / months;
    const score = this.calculateScore('pr-velocity', rawValue);

    return {
      ...metricDef,
      rawValue: Math.round(rawValue * 10) / 10,
      displayValue: `${Math.round(rawValue * 10) / 10} PRs/month`,
      score,
      level: getScoreLevel(score),
    };
  }

  // ============================================================================
  // COMMUNITY METRICS
  // ============================================================================

  /**
   * Calculate total unique contributors
   */
  calculateContributorCount(contributors) {
    const metricDef = METRIC_DEFINITIONS['contributor-count'];
    const rawValue = contributors.length;
    const score = this.calculateScore('contributor-count', rawValue);

    return {
      ...metricDef,
      rawValue,
      displayValue: `${rawValue} contributors`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate bus factor (min contributors for 50% commits)
   */
  calculateBusFactor(contributors) {
    const metricDef = METRIC_DEFINITIONS['bus-factor'];

    if (contributors.length === 0) {
      return {
        ...metricDef,
        rawValue: 0,
        displayValue: '0 contributors',
        score: 0,
        level: getScoreLevel(0),
      };
    }

    // Sort contributors by commit count (descending)
    const sorted = [...contributors].sort((a, b) => b.contributions - a.contributions);
    const totalCommits = sorted.reduce((sum, c) => sum + c.contributions, 0);
    const threshold = totalCommits * 0.5;

    let cumulative = 0;
    let busFactor = 0;
    for (const contributor of sorted) {
      cumulative += contributor.contributions;
      busFactor++;
      if (cumulative >= threshold) {
        break;
      }
    }

    const score = this.calculateScore('bus-factor', busFactor);

    return {
      ...metricDef,
      rawValue: busFactor,
      displayValue: `${busFactor} contributor${busFactor !== 1 ? 's' : ''}`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate first-time contributors in last 90 days
   */
  calculateNewContributors(commits) {
    const metricDef = METRIC_DEFINITIONS['new-contributors'];

    // Group commits by author
    const authorFirstCommit = new Map();
    for (const commit of commits) {
      const author = commit.author?.login || commit.commit.author.email;
      const date = new Date(commit.commit.author.date);
      const existing = authorFirstCommit.get(author);
      if (!existing || date < existing) {
        authorFirstCommit.set(author, date);
      }
    }

    // Count authors whose first commit is within the 90-day window
    // This is an approximation - ideally we'd check full history
    const recentWindow = new Date();
    recentWindow.setDate(recentWindow.getDate() - 30); // First-timers in last 30 days of the window

    let newContributors = 0;
    for (const date of authorFirstCommit.values()) {
      if (date > recentWindow) {
        newContributors++;
      }
    }

    const score = this.calculateScore('new-contributors', newContributors);

    return {
      ...metricDef,
      rawValue: newContributors,
      displayValue: `${newContributors} new`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate organization diversity (unique email domains)
   */
  calculateOrgDiversity(contributors) {
    const metricDef = METRIC_DEFINITIONS['org-diversity'];

    // Extract unique organizations from contributor data
    // Note: GitHub API doesn't expose email domains, so we count unique companies
    const companies = new Set();
    for (const contributor of contributors) {
      // In practice, we'd need to fetch each user's profile for company info
      // For now, we'll estimate based on contributor count
      companies.add(contributor.login);
    }

    // Rough estimation: assume ~10 contributors per org on average
    const estimatedOrgs = Math.max(1, Math.ceil(contributors.length / 10));
    const score = this.calculateScore('org-diversity', estimatedOrgs);

    return {
      ...metricDef,
      rawValue: estimatedOrgs,
      displayValue: `~${estimatedOrgs} org${estimatedOrgs !== 1 ? 's' : ''}`,
      score,
      level: getScoreLevel(score),
      note: 'Estimated from contributor count',
    };
  }

  /**
   * Calculate PR merge rate
   */
  calculatePRMergeRate(pullRequests) {
    const metricDef = METRIC_DEFINITIONS['pr-merge-rate'];
    const merged = pullRequests.merged?.length || 0;
    const closed = pullRequests.closed?.length || 0;
    const total = merged + closed;

    if (total === 0) {
      return {
        ...metricDef,
        rawValue: null,
        displayValue: 'No closed PRs',
        score: 50, // Neutral score
        level: getScoreLevel(50),
      };
    }

    const rawValue = (merged / total) * 100;
    const score = this.calculateScore('pr-merge-rate', rawValue);

    return {
      ...metricDef,
      rawValue: Math.round(rawValue),
      displayValue: `${Math.round(rawValue)}%`,
      score,
      level: getScoreLevel(score),
    };
  }

  // ============================================================================
  // RESPONSIVENESS METRICS
  // ============================================================================

  /**
   * Calculate median hours to first response on issues
   */
  calculateIssueResponseTime(issues) {
    const metricDef = METRIC_DEFINITIONS['issue-response-time'];
    const allIssues = [...(issues.open || []), ...(issues.closed || [])];

    // Filter issues with comments
    const issuesWithComments = allIssues.filter(
      issue => issue.comments > 0
    );

    if (issuesWithComments.length === 0) {
      return {
        ...metricDef,
        rawValue: null,
        displayValue: 'No data',
        score: 50, // Neutral
        level: getScoreLevel(50),
      };
    }

    // Approximate: use created_at to updated_at as proxy
    // (Real implementation would fetch comment timestamps)
    const responseTimes = issuesWithComments.map(issue => {
      const created = new Date(issue.created_at);
      const updated = new Date(issue.updated_at);
      return (updated - created) / (1000 * 60 * 60); // Hours
    });

    const sorted = responseTimes.sort((a, b) => a - b);
    const medianIdx = Math.floor(sorted.length / 2);
    const median = sorted[medianIdx];

    const score = this.calculateScore('issue-response-time', median);

    return {
      ...metricDef,
      rawValue: Math.round(median),
      displayValue: median < 24 ? `${Math.round(median)}h` : `${Math.round(median / 24)}d`,
      score,
      level: getScoreLevel(score),
      note: 'Estimated from update time',
    };
  }

  /**
   * Calculate median days to close issues
   */
  calculateIssueCloseTime(issues) {
    const metricDef = METRIC_DEFINITIONS['issue-close-time'];
    const closedIssues = issues.closed || [];

    if (closedIssues.length === 0) {
      return {
        ...metricDef,
        rawValue: null,
        displayValue: 'No closed issues',
        score: 50,
        level: getScoreLevel(50),
      };
    }

    const closeTimes = closedIssues.map(issue => {
      const created = new Date(issue.created_at);
      const closed = new Date(issue.closed_at);
      return (closed - created) / (1000 * 60 * 60 * 24); // Days
    });

    const sorted = closeTimes.sort((a, b) => a - b);
    const medianIdx = Math.floor(sorted.length / 2);
    const median = sorted[medianIdx];

    const score = this.calculateScore('issue-close-time', median);

    return {
      ...metricDef,
      rawValue: Math.round(median),
      displayValue: `${Math.round(median)} days`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate percentage of stale issues (inactive >90 days)
   */
  calculateStaleIssuesRatio(issues) {
    const metricDef = METRIC_DEFINITIONS['stale-issues-ratio'];
    const openIssues = issues.open || [];

    if (openIssues.length === 0) {
      return {
        ...metricDef,
        rawValue: 0,
        displayValue: '0%',
        score: 100,
        level: getScoreLevel(100),
      };
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const staleCount = openIssues.filter(issue => {
      const lastUpdate = new Date(issue.updated_at);
      return lastUpdate < ninetyDaysAgo;
    }).length;

    const rawValue = (staleCount / openIssues.length) * 100;
    const score = this.calculateScore('stale-issues-ratio', rawValue);

    return {
      ...metricDef,
      rawValue: Math.round(rawValue),
      displayValue: `${Math.round(rawValue)}%`,
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Calculate percentage of all issues still open
   */
  calculateOpenIssuesRatio(issues, repository) {
    const metricDef = METRIC_DEFINITIONS['open-issues-ratio'];
    const openCount = repository.open_issues_count || 0;
    const closedCount = issues.closed?.length || 0;
    const totalEstimate = openCount + closedCount;

    if (totalEstimate === 0) {
      return {
        ...metricDef,
        rawValue: 0,
        displayValue: '0%',
        score: 100,
        level: getScoreLevel(100),
      };
    }

    const rawValue = (openCount / totalEstimate) * 100;
    const score = this.calculateScore('open-issues-ratio', rawValue);

    return {
      ...metricDef,
      rawValue: Math.round(rawValue),
      displayValue: `${Math.round(rawValue)}%`,
      score,
      level: getScoreLevel(score),
    };
  }

  // ============================================================================
  // DOCUMENTATION METRICS
  // ============================================================================

  /**
   * Calculate README quality score
   */
  calculateReadmeQuality(communityProfile, repository) {
    const metricDef = METRIC_DEFINITIONS['readme-quality'];

    // Check if README exists
    const hasReadme = communityProfile?.files?.readme !== null;
    if (!hasReadme) {
      return {
        ...metricDef,
        rawValue: 0,
        displayValue: 'Missing',
        score: 0,
        level: getScoreLevel(0),
      };
    }

    // Score based on health percentage and repo indicators
    let qualityScore = 2; // Base score for having a README

    // Add points for repo having description
    if (repository.description) {
      qualityScore += 1;
    }

    // Add points for repo having homepage
    if (repository.homepage) {
      qualityScore += 1;
    }

    // Add points for high health percentage
    if (communityProfile.health_percentage >= 70) {
      qualityScore += 1;
    }

    const score = this.calculateScore('readme-quality', qualityScore);

    const grades = ['F', 'D', 'C', 'B', 'A', 'A+'];
    return {
      ...metricDef,
      rawValue: qualityScore,
      displayValue: grades[qualityScore] || 'A+',
      score,
      level: getScoreLevel(score),
    };
  }

  /**
   * Check for CONTRIBUTING.md
   */
  calculateContributingGuide(communityProfile) {
    const metricDef = METRIC_DEFINITIONS['contributing-guide'];
    const exists = communityProfile?.files?.contributing !== null;
    const score = exists ? 100 : 0;

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: exists ? 'Present' : 'Missing',
      score,
      level: getScoreLevel(score),
      isBoolean: true,
    };
  }

  /**
   * Check for docs directory
   */
  calculateDocsDirectory(communityProfile) {
    const metricDef = METRIC_DEFINITIONS['docs-directory'];
    // Community profile doesn't directly indicate docs folder
    // Use health percentage as proxy
    const exists = communityProfile?.health_percentage >= 50;
    const score = exists ? 100 : 0;

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: exists ? 'Present' : 'Unknown',
      score,
      level: getScoreLevel(score),
      isBoolean: true,
      note: 'Inferred from health score',
    };
  }

  /**
   * Check for CHANGELOG.md
   */
  calculateChangelog(_communityProfile) {
    const metricDef = METRIC_DEFINITIONS['changelog'];
    // Community profile doesn't track changelog
    // We'd need a separate API call to check
    const exists = false; // Default to false, would need file check

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: 'Unknown',
      score: 50, // Neutral when unknown
      level: getScoreLevel(50),
      isBoolean: true,
      note: 'Requires additional API call',
    };
  }

  // ============================================================================
  // SECURITY METRICS
  // ============================================================================

  /**
   * Check for SECURITY.md
   */
  calculateSecurityPolicy(communityProfile) {
    const metricDef = METRIC_DEFINITIONS['security-policy'];
    const exists = communityProfile?.files?.security_policy !== null;
    const score = exists ? 100 : 0;

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: exists ? 'Present' : 'Missing',
      score,
      level: getScoreLevel(score),
      isBoolean: true,
    };
  }

  /**
   * Check for license
   */
  calculateLicense(repository) {
    const metricDef = METRIC_DEFINITIONS['license'];
    const exists = repository.license !== null;
    const licenseName = repository.license?.spdx_id || repository.license?.name;
    const score = exists ? 100 : 0;

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: exists ? licenseName : 'Missing',
      score,
      level: getScoreLevel(score),
      isBoolean: true,
    };
  }

  /**
   * Check for code of conduct
   */
  calculateCodeOfConduct(communityProfile) {
    const metricDef = METRIC_DEFINITIONS['code-of-conduct'];
    const exists = communityProfile?.files?.code_of_conduct !== null;
    const score = exists ? 100 : 0;

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: exists ? 'Present' : 'Missing',
      score,
      level: getScoreLevel(score),
      isBoolean: true,
    };
  }

  /**
   * Check for vulnerability reporting process
   */
  calculateVulnerabilityReporting(communityProfile) {
    const metricDef = METRIC_DEFINITIONS['vulnerability-reporting'];
    // If security policy exists, assume it includes reporting
    const exists = communityProfile?.files?.security_policy !== null;
    const score = exists ? 100 : 0;

    return {
      ...metricDef,
      rawValue: exists,
      displayValue: exists ? 'Present' : 'Missing',
      score,
      level: getScoreLevel(score),
      isBoolean: true,
    };
  }

  // ============================================================================
  // GOVERNANCE METRICS
  // ============================================================================

  /**
   * Check for governance documentation
   * Score based on: main governance doc (40pts) + leadership structure (30pts) + ownership files (30pts)
   */
  calculateGovernanceDocs(governanceFiles) {
    const metricDef = METRIC_DEFINITIONS['governance-docs'];

    // If no governance data provided, return neutral score
    if (!governanceFiles) {
      return {
        ...metricDef,
        rawValue: false,
        displayValue: 'Unknown',
        score: 50,
        level: getScoreLevel(50),
        isBoolean: true,
        note: 'Governance data not available',
      };
    }

    let score = 0;
    const foundFiles = [];

    // Main governance doc (40 points)
    if (governanceFiles.governance) {
      score += 40;
      foundFiles.push('GOVERNANCE');
      // Bonus for substantive content (>500 chars)
      if (governanceFiles.governance.contentLength > 500) {
        score += 10;
      }
    }

    // Leadership structure (30 points) - TSC or Steering Committee
    if (governanceFiles.tsc || governanceFiles.steering) {
      score += 30;
      if (governanceFiles.tsc) {
        foundFiles.push('TSC');
      }
      if (governanceFiles.steering) {
        foundFiles.push('STEERING');
      }
    }

    // Ownership files (30 points) - OWNERS, MAINTAINERS, CODEOWNERS
    const ownershipScore = Math.min(30,
      (governanceFiles.owners ? 15 : 0) +
      (governanceFiles.maintainers ? 15 : 0) +
      (governanceFiles.codeowners ? 10 : 0)
    );
    score += ownershipScore;
    if (governanceFiles.owners) {
      foundFiles.push('OWNERS');
    }
    if (governanceFiles.maintainers) {
      foundFiles.push('MAINTAINERS');
    }
    if (governanceFiles.codeowners) {
      foundFiles.push('CODEOWNERS');
    }

    // Cap at 100
    score = Math.min(100, score);

    const hasGovernance = foundFiles.length > 0;

    return {
      ...metricDef,
      rawValue: hasGovernance,
      displayValue: hasGovernance ? foundFiles.join(', ') : 'Missing',
      score,
      level: getScoreLevel(score),
      isBoolean: false,
      details: foundFiles,
    };
  }

  /**
   * Calculate active maintainer count
   */
  calculateMaintainerCount(contributors, pullRequests) {
    const metricDef = METRIC_DEFINITIONS['maintainer-count'];

    // Estimate maintainers from PR merge activity
    const mergedPRs = pullRequests.merged || [];
    const mergerLogins = new Set();

    for (const pr of mergedPRs) {
      if (pr.merged_by?.login) {
        mergerLogins.add(pr.merged_by.login);
      }
    }

    // Also count top contributors as potential maintainers
    const topContributors = contributors.slice(0, 5);
    for (const c of topContributors) {
      mergerLogins.add(c.login);
    }

    const rawValue = Math.min(mergerLogins.size, 10); // Cap at 10
    const score = this.calculateScore('maintainer-count', rawValue);

    return {
      ...metricDef,
      rawValue,
      displayValue: `${rawValue} maintainer${rawValue !== 1 ? 's' : ''}`,
      score,
      level: getScoreLevel(score),
      note: 'Estimated from merge activity',
    };
  }

  /**
   * Check for OpenSSF Best Practices badge
   */
  calculateOpenSSFBadge(openSSFData) {
    const metricDef = METRIC_DEFINITIONS['openssf-badge'];

    // If no data provided, return 0 score
    if (!openSSFData) {
      return {
        ...metricDef,
        rawValue: 'none',
        displayValue: 'Not Found',
        score: 0,
        level: getScoreLevel(0),
        note: 'OpenSSF data not available',
      };
    }

    if (!openSSFData.found) {
      return {
        ...metricDef,
        rawValue: 'none',
        displayValue: 'Not Found',
        score: 0,
        level: getScoreLevel(0),
      };
    }

    // Map level to score using threshold config
    const level = openSSFData.level || 'none';
    // Normalize level format (API returns with underscores, we use hyphens)
    const normalizedLevel = level.replace('_', '-');
    const score = this.calculateScore('openssf-badge', normalizedLevel);

    // Create display value
    const levelLabels = {
      'none': 'None',
      'in-progress': 'In Progress',
      'passing': 'Passing',
      'silver': 'Silver',
      'gold': 'Gold',
    };
    const displayValue = levelLabels[normalizedLevel] || level;

    return {
      ...metricDef,
      rawValue: normalizedLevel,
      displayValue,
      score,
      level: getScoreLevel(score),
      source: openSSFData.source,
      projectId: openSSFData.projectId,
    };
  }

  /**
   * Calculate foundation affiliation score
   */
  calculateFoundationAffiliation(foundationData, governanceFiles) {
    const metricDef = METRIC_DEFINITIONS['foundation-affiliation'];

    // If no foundation data provided
    if (!foundationData) {
      return {
        ...metricDef,
        rawValue: 'none',
        displayValue: 'Unknown',
        score: 0,
        level: getScoreLevel(0),
        note: 'Foundation data not available',
      };
    }

    // No foundation found
    if (!foundationData.foundation) {
      // Check if project has governance docs - gives partial credit
      const hasGovernance = governanceFiles &&
        (governanceFiles.governance || governanceFiles.owners || governanceFiles.maintainers);

      if (hasGovernance) {
        return {
          ...metricDef,
          rawValue: 'none-with-governance',
          displayValue: 'Independent (with governance)',
          score: 50,
          level: getScoreLevel(50),
          note: 'No foundation affiliation but has governance documentation',
        };
      }

      return {
        ...metricDef,
        rawValue: 'none',
        displayValue: 'None',
        score: 0,
        level: getScoreLevel(0),
      };
    }

    // Map foundation + level to score key
    const scoreKey = this.getFoundationScoreKey(foundationData.foundation, foundationData.level);
    const score = this.calculateScore('foundation-affiliation', scoreKey);

    // Create display value
    const foundationLabels = {
      'cncf': 'CNCF',
      'apache': 'Apache',
      'linux-foundation': 'Linux Foundation',
      'openjs': 'OpenJS',
      'eclipse': 'Eclipse',
    };
    const levelLabels = {
      'graduated': 'Graduated',
      'incubating': 'Incubating',
      'sandbox': 'Sandbox',
      'tlp': 'TLP',
      'lfai-data': 'LF AI & Data',
      'lf-edge': 'LF Edge',
      'member': 'Member',
    };

    const foundationName = foundationLabels[foundationData.foundation] || foundationData.foundation;
    const levelName = levelLabels[foundationData.level] || foundationData.level;
    const displayValue = `${foundationName} (${levelName})`;

    return {
      ...metricDef,
      rawValue: scoreKey,
      displayValue,
      score,
      level: getScoreLevel(score),
      foundation: foundationData.foundation,
      foundationLevel: foundationData.level,
      confidence: foundationData.confidence,
      source: foundationData.source,
    };
  }

  /**
   * Get the score key for foundation affiliation
   */
  getFoundationScoreKey(foundation, level) {
    // Map foundation + level to score key
    const keyMap = {
      'cncf-graduated': 'cncf-graduated',
      'cncf-incubating': 'cncf-incubating',
      'cncf-sandbox': 'cncf-sandbox',
      'cncf-member': 'cncf-member',
      'apache-tlp': 'apache-tlp',
      'linux-foundation-member': 'lf-member',
      'linux-foundation-lfai-data': 'lfai-data',
      'linux-foundation-lf-edge': 'lf-edge',
      'openjs-member': 'openjs-member',
      'eclipse-member': 'eclipse-member',
    };

    const key = `${foundation}-${level}`;
    return keyMap[key] || 'none';
  }

  // ============================================================================
  // SCORING UTILITIES
  // ============================================================================

  /**
   * Calculate score for a numeric metric based on thresholds
   * @param {string} metricId - Metric identifier
   * @param {number} value - Raw metric value
   * @returns {number} Score from 0-100
   */
  calculateScore(metricId, value) {
    const config = METRIC_THRESHOLDS[metricId];
    if (!config) {
      return 50; // Default neutral score
    }

    // Handle boolean metrics
    if (config.type === 'boolean') {
      return value ? config.passScore : config.failScore;
    }

    // Handle badge metrics
    if (config.type === 'badge') {
      return config.levels[value] || 0;
    }

    // Handle affiliation metrics
    if (config.type === 'affiliation') {
      return config.levels[value] || 0;
    }

    // Handle null values
    if (value === null || value === undefined) {
      return 50;
    }

    const { thresholds, scores, direction } = config;

    // For lower-is-better metrics, the thresholds are in descending order
    // For higher-is-better metrics, thresholds are in ascending order
    if (direction === 'lower-is-better') {
      // Value above highest threshold = worst score
      if (value >= thresholds[0]) {
        return scores[0];
      }
      // Value below lowest threshold = best score
      if (value <= thresholds[thresholds.length - 1]) {
        return scores[scores.length - 1];
      }
      // Interpolate
      for (let i = 0; i < thresholds.length - 1; i++) {
        if (value <= thresholds[i] && value > thresholds[i + 1]) {
          const range = thresholds[i] - thresholds[i + 1];
          const position = (thresholds[i] - value) / range;
          return scores[i] + position * (scores[i + 1] - scores[i]);
        }
      }
    } else {
      // higher-is-better
      // Value below lowest threshold = worst score
      if (value <= thresholds[0]) {
        return scores[0];
      }
      // Value above highest threshold = best score
      if (value >= thresholds[thresholds.length - 1]) {
        return scores[scores.length - 1];
      }
      // Interpolate
      for (let i = 0; i < thresholds.length - 1; i++) {
        if (value >= thresholds[i] && value < thresholds[i + 1]) {
          const range = thresholds[i + 1] - thresholds[i];
          const position = (value - thresholds[i]) / range;
          return scores[i] + position * (scores[i + 1] - scores[i]);
        }
      }
    }

    return 50; // Fallback
  }
}
