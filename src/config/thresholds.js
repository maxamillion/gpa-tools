/**
 * Scoring Thresholds Configuration
 * Defines the threshold values for scoring each metric
 * Per contracts/metrics-schema.md
 */

export const THRESHOLDS = {
  'commit-frequency': {
    excellent: { min: 20, label: 'Excellent (≥20/week)' },
    good: { min: 5, max: 20, label: 'Good (5-20/week)' },
    fair: { min: 1, max: 5, label: 'Fair (1-5/week)' },
    poor: { max: 1, label: 'Poor (<1/week)' },
  },

  'release-cadence': {
    excellent: { max: 30, label: 'Excellent (≤30 days)' },
    good: { min: 30, max: 90, label: 'Good (30-90 days)' },
    fair: { min: 90, max: 180, label: 'Fair (90-180 days)' },
    poor: { min: 180, label: 'Poor (>180 days)' },
  },

  'last-activity': {
    excellent: { max: 7, label: 'Excellent (≤7 days)' },
    good: { min: 7, max: 30, label: 'Good (7-30 days)' },
    fair: { min: 30, max: 90, label: 'Fair (30-90 days)' },
    poor: { min: 90, label: 'Poor (>90 days)' },
  },

  'contributor-count': {
    excellent: { min: 50, label: 'Excellent (≥50)' },
    good: { min: 10, max: 50, label: 'Good (10-50)' },
    fair: { min: 3, max: 10, label: 'Fair (3-10)' },
    poor: { max: 3, label: 'Poor (<3)' },
  },

  'new-contributors': {
    excellent: { min: 5, label: 'Excellent (≥5)' },
    good: { min: 2, max: 5, label: 'Good (2-5)' },
    fair: { min: 1, max: 2, label: 'Fair (1)' },
    poor: { max: 1, label: 'Poor (0)' },
  },

  'pr-merge-rate': {
    excellent: { min: 70, label: 'Excellent (≥70%)' },
    good: { min: 50, max: 70, label: 'Good (50-70%)' },
    fair: { min: 30, max: 50, label: 'Fair (30-50%)' },
    poor: { max: 30, label: 'Poor (<30%)' },
  },

  'open-issues-ratio': {
    excellent: { max: 20, label: 'Excellent (<20%)' },
    good: { min: 20, max: 40, label: 'Good (20-40%)' },
    fair: { min: 40, max: 60, label: 'Fair (40-60%)' },
    poor: { min: 60, label: 'Poor (≥60%)' },
  },

  'issue-response-time': {
    excellent: { max: 24, label: 'Excellent (<24 hours)' },
    good: { min: 24, max: 72, label: 'Good (1-3 days)' },
    fair: { min: 72, max: 168, label: 'Fair (3-7 days)' },
    poor: { min: 168, label: 'Poor (>7 days)' },
  },

  'stale-issues-percentage': {
    excellent: { max: 10, label: 'Excellent (<10%)' },
    good: { min: 10, max: 25, label: 'Good (10-25%)' },
    fair: { min: 25, max: 50, label: 'Fair (25-50%)' },
    poor: { min: 50, label: 'Poor (≥50%)' },
  },

  'average-time-to-close': {
    excellent: { max: 7, label: 'Excellent (<7 days)' },
    good: { min: 7, max: 30, label: 'Good (7-30 days)' },
    fair: { min: 30, max: 90, label: 'Fair (30-90 days)' },
    poor: { min: 90, label: 'Poor (>90 days)' },
  },

  'readme-quality': {
    excellent: { value: 5, label: 'Excellent (5/5)' },
    good: { value: 4, label: 'Good (4/5)' },
    fair: { value: 3, label: 'Fair (3/5)' },
    poor: { max: 3, label: 'Poor (<3/5)' },
  },

  'documentation-directory': {
    pass: { label: 'Present' },
    fail: { label: 'Missing' },
  },

  'wiki-presence': {
    pass: { label: 'Enabled' },
    fail: { label: 'Disabled' },
  },

  'security-policy': {
    pass: { label: 'Present' },
    fail: { label: 'Missing' },
  },

  'code-of-conduct': {
    pass: { label: 'Present' },
    fail: { label: 'Missing' },
  },

  'contributing-guidelines': {
    pass: { label: 'Present' },
    fail: { label: 'Missing' },
  },

  license: {
    pass: { label: 'Present' },
    fail: { label: 'Missing' },
  },

  'bus-factor': {
    excellent: { min: 5, label: 'Excellent (≥5)' },
    good: { min: 3, max: 5, label: 'Good (3-5)' },
    fair: { value: 2, label: 'Fair (2)' },
    poor: { max: 2, label: 'Poor (1)' },
  },
};

export function getThreshold(metricId) {
  return THRESHOLDS[metricId];
}
