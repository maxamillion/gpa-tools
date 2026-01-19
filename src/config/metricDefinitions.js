/**
 * Metric Definitions
 *
 * 25 baseline metrics organized into 6 categories based on:
 * - CHAOSS (Community Health Analytics Open Source Software)
 * - OpenSSF (Open Source Security Foundation)
 * - CNCF (Cloud Native Computing Foundation)
 * - Apache Software Foundation
 * - Linux Foundation Best Practices
 */

export const METRIC_CATEGORIES = {
  activity: {
    id: 'activity',
    name: 'Activity',
    icon: '📊',
    description: 'Measures how actively the project is being developed',
    weight: 0.15,
  },
  community: {
    id: 'community',
    name: 'Community',
    icon: '👥',
    description: 'Evaluates the health and diversity of the contributor community',
    weight: 0.20,
  },
  responsiveness: {
    id: 'responsiveness',
    name: 'Responsiveness',
    icon: '⚡',
    description: 'Measures how quickly maintainers respond to issues and PRs',
    weight: 0.20,
  },
  documentation: {
    id: 'documentation',
    name: 'Documentation',
    icon: '📚',
    description: 'Evaluates the completeness and quality of project documentation',
    weight: 0.15,
  },
  security: {
    id: 'security',
    name: 'Security & Compliance',
    icon: '🔒',
    description: 'Checks for security policies and compliance with best practices',
    weight: 0.20,
  },
  governance: {
    id: 'governance',
    name: 'Governance',
    icon: '⚖️',
    description: 'Evaluates project governance and sustainability practices',
    weight: 0.10,
  },
};

export const METRIC_DEFINITIONS = {
  // ============================================================================
  // ACTIVITY METRICS (4)
  // ============================================================================

  'commit-frequency': {
    id: 'commit-frequency',
    name: 'Commit Frequency',
    category: 'activity',
    description: 'Average commits per week over the last 90 days',
    calculation: 'commits / weeks (90 days)',
    type: 'numeric',
    unit: 'commits/week',
    higherIsBetter: true,
    source: 'CHAOSS',
  },

  'release-cadence': {
    id: 'release-cadence',
    name: 'Release Cadence',
    category: 'activity',
    description: 'Average days between releases',
    calculation: 'Average days between last 5 releases',
    type: 'numeric',
    unit: 'days',
    higherIsBetter: false,
    source: 'CHAOSS',
  },

  'last-activity': {
    id: 'last-activity',
    name: 'Last Activity',
    category: 'activity',
    description: 'Days since the last commit',
    calculation: 'today - last_commit_date',
    type: 'numeric',
    unit: 'days ago',
    higherIsBetter: false,
    source: 'CHAOSS',
  },

  'pr-velocity': {
    id: 'pr-velocity',
    name: 'PR Velocity',
    category: 'activity',
    description: 'Pull requests merged per month',
    calculation: 'merged_prs / months (90 days)',
    type: 'numeric',
    unit: 'PRs/month',
    higherIsBetter: true,
    source: 'CHAOSS',
  },

  // ============================================================================
  // COMMUNITY METRICS (5)
  // ============================================================================

  'contributor-count': {
    id: 'contributor-count',
    name: 'Contributor Count',
    category: 'community',
    description: 'Total unique contributors to the repository',
    calculation: 'Count of distinct authors',
    type: 'numeric',
    unit: 'contributors',
    higherIsBetter: true,
    source: 'CHAOSS',
  },

  'bus-factor': {
    id: 'bus-factor',
    name: 'Bus Factor',
    category: 'community',
    description: 'Minimum contributors responsible for 50% of commits',
    calculation: 'Top N contributors covering 50% of commits',
    type: 'numeric',
    unit: 'contributors',
    higherIsBetter: true,
    source: 'CHAOSS',
  },

  'new-contributors': {
    id: 'new-contributors',
    name: 'New Contributors',
    category: 'community',
    description: 'First-time contributors in the last 90 days',
    calculation: 'Count of new authors in 90-day period',
    type: 'numeric',
    unit: 'new contributors',
    higherIsBetter: true,
    source: 'CHAOSS',
  },

  'org-diversity': {
    id: 'org-diversity',
    name: 'Organization Diversity',
    category: 'community',
    description: 'Number of distinct organizations (email domains)',
    calculation: 'Unique email domains of contributors',
    type: 'numeric',
    unit: 'organizations',
    higherIsBetter: true,
    source: 'Apache',
  },

  'pr-merge-rate': {
    id: 'pr-merge-rate',
    name: 'PR Merge Rate',
    category: 'community',
    description: 'Percentage of pull requests that are merged',
    calculation: 'merged / (merged + closed_unmerged)',
    type: 'percentage',
    unit: '%',
    higherIsBetter: true,
    source: 'CHAOSS',
  },

  // ============================================================================
  // RESPONSIVENESS METRICS (4)
  // ============================================================================

  'issue-response-time': {
    id: 'issue-response-time',
    name: 'Issue Response Time',
    category: 'responsiveness',
    description: 'Median hours to first response on issues',
    calculation: 'Median(first_comment - issue_created)',
    type: 'numeric',
    unit: 'hours',
    higherIsBetter: false,
    source: 'CHAOSS',
  },

  'issue-close-time': {
    id: 'issue-close-time',
    name: 'Issue Close Time',
    category: 'responsiveness',
    description: 'Median days to close issues',
    calculation: 'Median(closed_at - created_at)',
    type: 'numeric',
    unit: 'days',
    higherIsBetter: false,
    source: 'CHAOSS',
  },

  'stale-issues-ratio': {
    id: 'stale-issues-ratio',
    name: 'Stale Issues Ratio',
    category: 'responsiveness',
    description: 'Percentage of open issues inactive for >90 days',
    calculation: 'stale_issues / open_issues',
    type: 'percentage',
    unit: '%',
    higherIsBetter: false,
    source: 'CHAOSS',
  },

  'open-issues-ratio': {
    id: 'open-issues-ratio',
    name: 'Open Issues Ratio',
    category: 'responsiveness',
    description: 'Percentage of all issues that are still open',
    calculation: 'open_issues / total_issues',
    type: 'percentage',
    unit: '%',
    higherIsBetter: false,
    source: 'CHAOSS',
  },

  // ============================================================================
  // DOCUMENTATION METRICS (4)
  // ============================================================================

  'readme-quality': {
    id: 'readme-quality',
    name: 'README Quality',
    category: 'documentation',
    description: 'Completeness of README file',
    calculation: 'Score based on sections, badges, examples (0-5)',
    type: 'score',
    unit: 'score',
    higherIsBetter: true,
    source: 'Linux Foundation',
  },

  'contributing-guide': {
    id: 'contributing-guide',
    name: 'Contributing Guide',
    category: 'documentation',
    description: 'Presence of CONTRIBUTING.md file',
    calculation: 'File existence check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'Linux Foundation',
  },

  'docs-directory': {
    id: 'docs-directory',
    name: 'Documentation Directory',
    category: 'documentation',
    description: 'Presence of /docs folder or wiki',
    calculation: 'Directory or wiki check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'Linux Foundation',
  },

  'changelog': {
    id: 'changelog',
    name: 'Changelog',
    category: 'documentation',
    description: 'Presence of CHANGELOG.md file',
    calculation: 'File existence check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'Keep a Changelog',
  },

  // ============================================================================
  // SECURITY & COMPLIANCE METRICS (4)
  // ============================================================================

  'security-policy': {
    id: 'security-policy',
    name: 'Security Policy',
    category: 'security',
    description: 'Presence of SECURITY.md file',
    calculation: 'File existence check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'OpenSSF',
  },

  'license': {
    id: 'license',
    name: 'License',
    category: 'security',
    description: 'Presence of recognized OSS license',
    calculation: 'License API check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'OSI',
  },

  'code-of-conduct': {
    id: 'code-of-conduct',
    name: 'Code of Conduct',
    category: 'security',
    description: 'Presence of CODE_OF_CONDUCT.md file',
    calculation: 'File existence check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'Contributor Covenant',
  },

  'vulnerability-reporting': {
    id: 'vulnerability-reporting',
    name: 'Vulnerability Reporting',
    category: 'security',
    description: 'Private security vulnerability reporting process',
    calculation: 'SECURITY.md content analysis',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'OpenSSF',
  },

  // ============================================================================
  // GOVERNANCE METRICS (3)
  // ============================================================================

  'governance-docs': {
    id: 'governance-docs',
    name: 'Governance Documentation',
    category: 'governance',
    description: 'Presence of GOVERNANCE.md or similar',
    calculation: 'File existence check',
    type: 'boolean',
    unit: 'exists',
    higherIsBetter: true,
    source: 'CNCF',
  },

  'maintainer-count': {
    id: 'maintainer-count',
    name: 'Active Maintainers',
    category: 'governance',
    description: 'Contributors with recent merge activity (90 days)',
    calculation: 'Count of contributors with merge rights',
    type: 'numeric',
    unit: 'maintainers',
    higherIsBetter: true,
    source: 'Apache',
  },

  'openssf-badge': {
    id: 'openssf-badge',
    name: 'OpenSSF Best Practices',
    category: 'governance',
    description: 'OpenSSF Best Practices badge status',
    calculation: 'Badge API or README scan',
    type: 'badge',
    unit: 'level',
    higherIsBetter: true,
    source: 'OpenSSF',
  },

  'foundation-affiliation': {
    id: 'foundation-affiliation',
    name: 'Foundation Affiliation',
    category: 'governance',
    description: 'Affiliation with major open source foundations (CNCF, Apache, Linux Foundation, etc.)',
    calculation: 'Detection from org, topics, README, and description',
    type: 'affiliation',
    unit: 'level',
    higherIsBetter: true,
    source: 'CNCF/Apache/LF',
  },
};

// Export as array for iteration
export const METRICS_LIST = Object.values(METRIC_DEFINITIONS);
