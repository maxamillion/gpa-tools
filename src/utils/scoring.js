/**
 * Scoring Algorithms
 * Implements threshold-based scoring for all metrics
 * Per contracts/metrics-schema.md
 */

export function scoreCommitFrequency(value) {
  if (value >= 20) return { score: 95, grade: 'Excellent' };
  if (value >= 10) return { score: 85, grade: 'Good' };
  if (value >= 5) return { score: 70, grade: 'Good' };
  if (value >= 1) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreReleaseCadence(value) {
  if (value === null) return { score: 0, grade: 'Poor' };
  if (value <= 30) return { score: 95, grade: 'Excellent' };
  if (value <= 90) return { score: 80, grade: 'Good' };
  if (value <= 180) return { score: 60, grade: 'Fair' };
  return { score: 30, grade: 'Poor' };
}

export function scoreLastActivity(value) {
  if (value <= 7) return { score: 95, grade: 'Excellent' };
  if (value <= 30) return { score: 80, grade: 'Good' };
  if (value <= 90) return { score: 55, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreContributorCount(value) {
  if (value >= 50) return { score: 95, grade: 'Excellent' };
  if (value >= 10) return { score: 80, grade: 'Good' };
  if (value >= 3) return { score: 60, grade: 'Fair' };
  return { score: 30, grade: 'Poor' };
}

export function scoreNewContributors(value) {
  if (value >= 5) return { score: 95, grade: 'Excellent' };
  if (value >= 2) return { score: 75, grade: 'Good' };
  if (value >= 1) return { score: 55, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scorePRMergeRate(value) {
  if (value === null) return { score: 0, grade: 'Poor' };
  if (value >= 70) return { score: 95, grade: 'Excellent' };
  if (value >= 50) return { score: 75, grade: 'Good' };
  if (value >= 30) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreOpenIssuesRatio(value) {
  if (value === null) return { score: 50, grade: 'Fair' };
  if (value < 20) return { score: 95, grade: 'Excellent' };
  if (value < 40) return { score: 75, grade: 'Good' };
  if (value < 60) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreIssueResponseTime(value) {
  if (value === null) return { score: 50, grade: 'Fair' };
  if (value < 24) return { score: 95, grade: 'Excellent' };
  if (value < 72) return { score: 75, grade: 'Good' };
  if (value < 168) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreStaleIssuesPercentage(value) {
  if (value === null) return { score: 50, grade: 'Fair' };
  if (value < 10) return { score: 95, grade: 'Excellent' };
  if (value < 25) return { score: 75, grade: 'Good' };
  if (value < 50) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreAverageTimeToClose(value) {
  if (value === null) return { score: 50, grade: 'Fair' };
  if (value < 7) return { score: 95, grade: 'Excellent' };
  if (value < 30) return { score: 75, grade: 'Good' };
  if (value < 90) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreREADMEQuality(value) {
  if (value === 5) return { score: 95, grade: 'Excellent' };
  if (value === 4) return { score: 80, grade: 'Good' };
  if (value === 3) return { score: 60, grade: 'Fair' };
  return { score: 30, grade: 'Poor' };
}

export function scoreBusFactor(value) {
  if (value >= 5) return { score: 95, grade: 'Excellent' };
  if (value >= 3) return { score: 75, grade: 'Good' };
  if (value === 2) return { score: 50, grade: 'Fair' };
  return { score: 25, grade: 'Poor' };
}

export function scoreToGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
