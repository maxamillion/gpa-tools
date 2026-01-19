/**
 * Scoring Thresholds
 *
 * Defines thresholds for converting raw metric values to scores.
 * Based on industry benchmarks from CHAOSS, OpenSSF, and other sources.
 */

/**
 * Threshold levels for scoring
 * Each metric maps to 4 thresholds: [Poor, Fair, Good, Excellent]
 * Score interpolates linearly between thresholds
 */
export const METRIC_THRESHOLDS = {
  // ============================================================================
  // ACTIVITY METRICS
  // ============================================================================

  'commit-frequency': {
    // Commits per week
    // <1 Poor, 1-5 Fair, 5-20 Good, >20 Excellent
    thresholds: [1, 5, 20],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  'release-cadence': {
    // Days between releases
    // >180 Poor, 90-180 Fair, 30-90 Good, <30 Excellent
    thresholds: [180, 90, 30],
    scores: [25, 50, 75, 100],
    direction: 'lower-is-better',
  },

  'last-activity': {
    // Days since last commit
    // >90 Poor, 30-90 Fair, 7-30 Good, <7 Excellent
    thresholds: [90, 30, 7],
    scores: [25, 50, 75, 100],
    direction: 'lower-is-better',
  },

  'pr-velocity': {
    // PRs merged per month
    // <2 Poor, 2-10 Fair, 10-30 Good, >30 Excellent
    thresholds: [2, 10, 30],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  // ============================================================================
  // COMMUNITY METRICS
  // ============================================================================

  'contributor-count': {
    // Total unique contributors
    // <3 Poor, 3-10 Fair, 10-50 Good, >50 Excellent
    thresholds: [3, 10, 50],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  'bus-factor': {
    // Contributors for 50% of commits
    // 1 Critical, 2 Poor, 3-4 Fair, >5 Excellent
    thresholds: [1, 2, 4, 5],
    scores: [0, 25, 50, 75, 100],
    direction: 'higher-is-better',
    isCritical: true,
  },

  'new-contributors': {
    // First-time contributors (90d)
    // 0 Poor, 1-3 Fair, 3-10 Good, >10 Excellent
    thresholds: [1, 3, 10],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  'org-diversity': {
    // Distinct organizations
    // 1 Poor, 2 Fair, 3-5 Good, >5 Excellent
    thresholds: [1, 2, 5],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  'pr-merge-rate': {
    // Percentage of PRs merged
    // <50% Poor, 50-70% Fair, 70-85% Good, >85% Excellent
    thresholds: [50, 70, 85],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  // ============================================================================
  // RESPONSIVENESS METRICS
  // ============================================================================

  'issue-response-time': {
    // Hours to first response
    // >168h Poor, 72-168h Fair, 24-72h Good, <24h Excellent
    thresholds: [168, 72, 24],
    scores: [25, 50, 75, 100],
    direction: 'lower-is-better',
  },

  'issue-close-time': {
    // Days to close issues
    // >90d Poor, 30-90d Fair, 7-30d Good, <7d Excellent
    thresholds: [90, 30, 7],
    scores: [25, 50, 75, 100],
    direction: 'lower-is-better',
  },

  'stale-issues-ratio': {
    // % issues inactive >90 days
    // >50% Poor, 25-50% Fair, 10-25% Good, <10% Excellent
    thresholds: [50, 25, 10],
    scores: [25, 50, 75, 100],
    direction: 'lower-is-better',
  },

  'open-issues-ratio': {
    // % of all issues still open
    // >70% Poor, 50-70% Fair, 30-50% Good, <30% Excellent
    thresholds: [70, 50, 30],
    scores: [25, 50, 75, 100],
    direction: 'lower-is-better',
  },

  // ============================================================================
  // DOCUMENTATION METRICS
  // ============================================================================

  'readme-quality': {
    // 0-5 score
    thresholds: [1, 2, 3, 4],
    scores: [0, 25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  'contributing-guide': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  'docs-directory': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  'changelog': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  // ============================================================================
  // SECURITY METRICS
  // ============================================================================

  'security-policy': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  'license': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  'code-of-conduct': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  'vulnerability-reporting': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  // ============================================================================
  // GOVERNANCE METRICS
  // ============================================================================

  'governance-docs': {
    // Boolean - pass/fail
    type: 'boolean',
    passScore: 100,
    failScore: 0,
  },

  'maintainer-count': {
    // Active maintainers
    // <2 Poor, 2-3 Fair, 4-6 Good, >6 Excellent
    thresholds: [2, 3, 6],
    scores: [25, 50, 75, 100],
    direction: 'higher-is-better',
  },

  'openssf-badge': {
    // Badge level: none, passing, silver, gold
    type: 'badge',
    levels: {
      'none': 0,
      'in-progress': 25,
      'passing': 50,
      'silver': 75,
      'gold': 100,
    },
  },

  'foundation-affiliation': {
    // Foundation affiliation levels
    type: 'affiliation',
    levels: {
      // Top-tier foundations - graduated/TLP status
      'cncf-graduated': 100,
      'apache-tlp': 100,
      'lf-member': 100,
      'lfai-data': 100,
      'lf-edge': 100,
      // Mid-tier - incubating or member status
      'cncf-incubating': 90,
      'eclipse-member': 85,
      'openjs-member': 85,
      'cncf-sandbox': 80,
      'cncf-member': 80,
      // No foundation but has governance
      'none-with-governance': 50,
      // No foundation affiliation
      'none': 0,
    },
  },
};

/**
 * Grade thresholds for letter grades
 */
export const GRADE_THRESHOLDS = {
  'A+': { min: 95, color: 'grade-a' },
  'A': { min: 90, color: 'grade-a' },
  'A-': { min: 85, color: 'grade-a' },
  'B+': { min: 80, color: 'grade-b' },
  'B': { min: 75, color: 'grade-b' },
  'B-': { min: 70, color: 'grade-b' },
  'C+': { min: 65, color: 'grade-c' },
  'C': { min: 60, color: 'grade-c' },
  'C-': { min: 55, color: 'grade-c' },
  'D+': { min: 50, color: 'grade-d' },
  'D': { min: 45, color: 'grade-d' },
  'D-': { min: 40, color: 'grade-d' },
  'F': { min: 0, color: 'grade-f' },
};

/**
 * Score level labels
 */
export const SCORE_LEVELS = {
  excellent: { min: 80, label: 'Excellent', class: 'score-excellent' },
  good: { min: 60, label: 'Good', class: 'score-good' },
  fair: { min: 40, label: 'Fair', class: 'score-fair' },
  poor: { min: 20, label: 'Poor', class: 'score-poor' },
  critical: { min: 0, label: 'Critical', class: 'score-critical' },
};

/**
 * Get letter grade for a score
 * @param {number} score - Score from 0-100
 * @returns {Object} Grade info { grade, color }
 */
export function getGrade(score) {
  for (const [grade, info] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= info.min) {
      return { grade, color: info.color };
    }
  }
  return { grade: 'F', color: 'grade-f' };
}

/**
 * Get score level info
 * @param {number} score - Score from 0-100
 * @returns {Object} Level info { label, class }
 */
export function getScoreLevel(score) {
  for (const info of Object.values(SCORE_LEVELS)) {
    if (score >= info.min) {
      return { label: info.label, class: info.class };
    }
  }
  return { label: 'Critical', class: 'score-critical' };
}
