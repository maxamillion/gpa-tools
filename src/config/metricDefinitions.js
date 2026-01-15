/**
 * Metric Definitions Configuration
 * Defines all 18 baseline metrics across 5 categories
 * Per contracts/metrics-schema.md
 */

export const BASELINE_METRICS = [
  // Activity Metrics (3)
  {
    id: 'commit-frequency',
    name: 'Commit Frequency',
    category: 'activity',
    explanation: 'Average commits per week over the last 90 days',
    whyItMatters: 'High commit frequency indicates active development and regular maintenance',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/commits',
  },
  {
    id: 'release-cadence',
    name: 'Release Cadence',
    category: 'activity',
    explanation: 'Average days between releases (last 5 releases)',
    whyItMatters: 'Regular releases indicate mature release processes and active development',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/releases',
  },
  {
    id: 'last-activity',
    name: 'Last Activity',
    category: 'activity',
    explanation: 'Days since last commit to default branch',
    whyItMatters: 'Recent activity indicates the project is actively maintained',
    dataSource: 'GitHub API: /repos/{owner}/{repo} (pushed_at)',
  },

  // Community Metrics (3)
  {
    id: 'contributor-count',
    name: 'Contributor Count',
    category: 'community',
    explanation: 'Total number of unique contributors',
    whyItMatters: 'More contributors indicates a healthy, diverse community',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/contributors',
  },
  {
    id: 'new-contributors',
    name: 'New Contributors (90 days)',
    category: 'community',
    explanation: 'Number of first-time contributors in last 90 days',
    whyItMatters: 'New contributors indicate growing community and welcoming environment',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/commits',
  },
  {
    id: 'pr-merge-rate',
    name: 'PR Merge Rate',
    category: 'community',
    explanation: 'Percentage of pull requests that get merged',
    whyItMatters: 'High merge rate indicates active maintainers and welcoming contribution process',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/pulls',
  },

  // Maintenance Metrics (4)
  {
    id: 'open-issues-ratio',
    name: 'Open Issues Ratio',
    category: 'maintenance',
    explanation: 'Percentage of issues currently open',
    whyItMatters: 'Lower ratio indicates good issue management and responsiveness',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/issues',
  },
  {
    id: 'issue-response-time',
    name: 'Issue Response Time',
    category: 'maintenance',
    explanation: 'Median hours until first response on issues',
    whyItMatters: 'Fast response times indicate active maintainers and good support',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/issues/comments',
  },
  {
    id: 'stale-issues-percentage',
    name: 'Stale Issues Percentage',
    category: 'maintenance',
    explanation: 'Percentage of open issues with no activity in 90+ days',
    whyItMatters: 'Lower percentage indicates active issue triage and maintenance',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/issues',
  },
  {
    id: 'average-time-to-close',
    name: 'Average Time to Close',
    category: 'maintenance',
    explanation: 'Average days to close issues',
    whyItMatters: 'Faster closure indicates efficient issue resolution',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/issues',
  },

  // Documentation Metrics (3)
  {
    id: 'readme-quality',
    name: 'README Quality Score',
    category: 'documentation',
    explanation: 'Score based on README completeness (0-5 points)',
    whyItMatters: 'Quality README helps users understand and adopt the project',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/readme',
  },
  {
    id: 'documentation-directory',
    name: 'Documentation Directory',
    category: 'documentation',
    explanation: 'Presence of /docs or /documentation directory',
    whyItMatters: 'Dedicated docs indicate comprehensive documentation beyond README',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/contents/docs',
  },
  {
    id: 'wiki-presence',
    name: 'Wiki Presence',
    category: 'documentation',
    explanation: 'Whether repository has wiki enabled',
    whyItMatters: 'Wiki provides additional documentation and community knowledge',
    dataSource: 'GitHub API: /repos/{owner}/{repo} (has_wiki)',
  },

  // Security & Governance Metrics (5)
  {
    id: 'security-policy',
    name: 'Security Policy',
    category: 'security',
    explanation: 'Presence of SECURITY.md file',
    whyItMatters: 'Security policy shows commitment to handling vulnerabilities responsibly',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/community/profile',
  },
  {
    id: 'code-of-conduct',
    name: 'Code of Conduct',
    category: 'security',
    explanation: 'Presence of CODE_OF_CONDUCT.md file',
    whyItMatters: 'Code of conduct indicates welcoming and inclusive community',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/community/profile',
  },
  {
    id: 'contributing-guidelines',
    name: 'Contributing Guidelines',
    category: 'security',
    explanation: 'Presence of CONTRIBUTING.md file',
    whyItMatters: 'Contributing guidelines help new contributors get started',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/community/profile',
  },
  {
    id: 'license',
    name: 'License',
    category: 'security',
    explanation: 'Presence of LICENSE file',
    whyItMatters: 'License clarifies usage rights and protects contributors',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/community/profile',
  },
  {
    id: 'bus-factor',
    name: 'Bus Factor',
    category: 'security',
    explanation: 'Number of contributors accounting for 50% of commits',
    whyItMatters: 'Higher bus factor reduces risk of project abandonment',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/contributors',
  },
];

export function getMetricDefinition(id) {
  return BASELINE_METRICS.find((m) => m.id === id);
}

export function getMetricsByCategory(category) {
  return BASELINE_METRICS.filter((m) => m.category === category);
}
