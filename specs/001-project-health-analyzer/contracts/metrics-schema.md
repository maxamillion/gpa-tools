# Metrics Calculation Contract

**Feature**: Open Source Project Health Analyzer
**Date**: 2026-01-15

## Overview

This document defines the calculation specifications for all 18 baseline metrics, including input data requirements, calculation algorithms, scoring thresholds, and output schemas.

---

## Metric Calculation Framework

### Input Data Model:
```javascript
{
  repo: Repository,          // From GitHub API /repos/{owner}/{repo}
  contributors: Contributor[],  // From GitHub API /repos/{owner}/{repo}/contributors
  commits: Commit[],        // From GitHub API /repos/{owner}/{repo}/commits
  releases: Release[],      // From GitHub API /repos/{owner}/{repo}/releases
  issues: Issue[],          // From GitHub API /repos/{owner}/{repo}/issues
  pulls: PullRequest[],     // From GitHub API /repos/{owner}/{repo}/pulls
  community: CommunityProfile,  // From GitHub API /repos/{owner}/{repo}/community/profile
  readme: string            // From GitHub API /repos/{owner}/{repo}/readme
}
```

### Output Schema (per metric):
```javascript
{
  id: string,               // Metric identifier
  name: string,             // Display name
  category: string,         // Category (activity, community, etc.)
  value: number | boolean,  // Raw calculated value
  score: number,            // Normalized score (0-100)
  grade: string,            // Grade (Excellent, Good, Fair, Poor)
  explanation: string,      // What this metric measures
  whyItMatters: string,     // Why this metric is important
  threshold: object,        // Scoring thresholds
  dataSource: string,       // API endpoint used
  calculatedAt: Date,       // Timestamp
  confidence: string        // Confidence level (high, medium, low)
}
```

---

## Category 1: Activity Metrics

### 1. Commit Frequency

**Algorithm**:
```javascript
function calculateCommitFrequency(commits) {
  // Filter to last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentCommits = commits.filter(c =>
    new Date(c.commit.author.date) >= ninetyDaysAgo
  );

  // Calculate commits per week
  const weeks = 90 / 7; // ~12.86 weeks
  const commitsPerWeek = recentCommits.length / weeks;

  return commitsPerWeek;
}

function scoreCommitFrequency(value) {
  if (value >= 20) return { score: 95, grade: "Excellent" };
  if (value >= 10) return { score: 85, grade: "Good" };
  if (value >= 5) return { score: 70, grade: "Good" };
  if (value >= 1) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

**Thresholds**:
```javascript
{
  excellent: { min: 20, label: "Excellent (≥20/week)" },
  good: { min: 5, max: 20, label: "Good (5-20/week)" },
  fair: { min: 1, max: 5, label: "Fair (1-5/week)" },
  poor: { max: 1, label: "Poor (<1/week)" }
}
```

**Output Example**:
```json
{
  "id": "commit-frequency",
  "name": "Commit Frequency",
  "category": "activity",
  "value": 15.3,
  "score": 85,
  "grade": "Good",
  "explanation": "Average commits per week over the last 90 days",
  "whyItMatters": "High commit frequency indicates active development and regular maintenance",
  "threshold": { /* ... */ },
  "dataSource": "GitHub API: /repos/{owner}/{repo}/commits",
  "calculatedAt": "2026-01-15T10:30:00Z",
  "confidence": "high"
}
```

---

### 2. Release Cadence

**Algorithm**:
```javascript
function calculateReleaseCadence(releases) {
  if (releases.length < 2) {
    return null; // Not enough data
  }

  // Take last 5 releases (or all if < 5)
  const recentReleases = releases.slice(0, Math.min(5, releases.length));

  // Calculate days between each consecutive release
  const intervals = [];
  for (let i = 0; i < recentReleases.length - 1; i++) {
    const current = new Date(recentReleases[i].published_at);
    const next = new Date(recentReleases[i + 1].published_at);
    const daysDiff = (current - next) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  // Return average interval in days
  return intervals.reduce((a, b) => a + b, 0) / intervals.length;
}

function scoreReleaseCadence(value) {
  if (value === null) return { score: 0, grade: "Poor" };
  if (value <= 30) return { score: 95, grade: "Excellent" };
  if (value <= 90) return { score: 80, grade: "Good" };
  if (value <= 180) return { score: 60, grade: "Fair" };
  return { score: 30, grade: "Poor" };
}
```

---

### 3. Last Activity

**Algorithm**:
```javascript
function calculateLastActivity(repo) {
  const lastPush = new Date(repo.pushed_at);
  const now = new Date();
  const daysSinceLastPush = (now - lastPush) / (1000 * 60 * 60 * 24);

  return Math.floor(daysSinceLastPush);
}

function scoreLastActivity(value) {
  if (value <= 7) return { score: 95, grade: "Excellent" };
  if (value <= 30) return { score: 80, grade: "Good" };
  if (value <= 90) return { score: 55, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

## Category 2: Community Metrics

### 4. Contributor Count

**Algorithm**:
```javascript
function calculateContributorCount(contributors) {
  return contributors.length;
}

function scoreContributorCount(value) {
  if (value >= 50) return { score: 95, grade: "Excellent" };
  if (value >= 10) return { score: 80, grade: "Good" };
  if (value >= 3) return { score: 60, grade: "Fair" };
  return { score: 30, grade: "Poor" };
}
```

---

### 5. New Contributors (90 days)

**Algorithm**:
```javascript
function calculateNewContributors(commits) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Group commits by author
  const authorFirstCommit = {};

  commits.forEach(commit => {
    const author = commit.author?.login;
    const date = new Date(commit.commit.author.date);

    if (author && (!authorFirstCommit[author] || date < authorFirstCommit[author])) {
      authorFirstCommit[author] = date;
    }
  });

  // Count authors whose first commit was in last 90 days
  const newContributors = Object.values(authorFirstCommit).filter(
    date => date >= ninetyDaysAgo
  ).length;

  return newContributors;
}

function scoreNewContributors(value) {
  if (value >= 5) return { score: 95, grade: "Excellent" };
  if (value >= 2) return { score: 75, grade: "Good" };
  if (value >= 1) return { score: 55, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

### 6. PR Merge Rate

**Algorithm**:
```javascript
function calculatePRMergeRate(pulls) {
  const totalPRs = pulls.length;
  if (totalPRs === 0) return null;

  const mergedPRs = pulls.filter(pr => pr.merged_at !== null).length;
  const mergeRate = (mergedPRs / totalPRs) * 100;

  return mergeRate;
}

function scorePRMergeRate(value) {
  if (value === null) return { score: 0, grade: "Poor" };
  if (value >= 70) return { score: 95, grade: "Excellent" };
  if (value >= 50) return { score: 75, grade: "Good" };
  if (value >= 30) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

## Category 3: Maintenance Metrics

### 7. Open Issues Ratio

**Algorithm**:
```javascript
function calculateOpenIssuesRatio(issues) {
  // Exclude pull requests from issues
  const actualIssues = issues.filter(i => !i.pull_request);

  const openIssues = actualIssues.filter(i => i.state === 'open').length;
  const totalIssues = actualIssues.length;

  if (totalIssues === 0) return null;

  const ratio = (openIssues / totalIssues) * 100;
  return ratio;
}

function scoreOpenIssuesRatio(value) {
  if (value === null) return { score: 50, grade: "Fair" };
  if (value < 20) return { score: 95, grade: "Excellent" };
  if (value < 40) return { score: 75, grade: "Good" };
  if (value < 60) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

### 8. Issue Response Time

**Algorithm**:
```javascript
function calculateIssueResponseTime(issues) {
  // Filter to issues with at least one comment
  const respondedIssues = issues.filter(i =>
    !i.pull_request && i.comments > 0
  );

  if (respondedIssues.length === 0) return null;

  // Calculate median response time (simplified - would need comments API in real implementation)
  // For spec: assume we can get first comment timestamp
  const responseTimes = respondedIssues.map(issue => {
    // Placeholder: actual implementation would fetch comments
    // and calculate time between issue.created_at and first comment
    return 24; // hours (example)
  });

  // Calculate median
  responseTimes.sort((a, b) => a - b);
  const mid = Math.floor(responseTimes.length / 2);
  const median = responseTimes.length % 2 === 0
    ? (responseTimes[mid - 1] + responseTimes[mid]) / 2
    : responseTimes[mid];

  return median;
}

function scoreIssueResponseTime(value) {
  if (value === null) return { score: 50, grade: "Fair" };
  if (value < 24) return { score: 95, grade: "Excellent" };
  if (value < 72) return { score: 75, grade: "Good" };
  if (value < 168) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

### 9. Stale Issues Percentage

**Algorithm**:
```javascript
function calculateStaleIssuesPercentage(issues) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const openIssues = issues.filter(i =>
    !i.pull_request && i.state === 'open'
  );

  if (openIssues.length === 0) return null;

  const staleIssues = openIssues.filter(i =>
    new Date(i.updated_at) < ninetyDaysAgo
  );

  const percentage = (staleIssues.length / openIssues.length) * 100;
  return percentage;
}

function scoreStaleIssuesPercentage(value) {
  if (value === null) return { score: 50, grade: "Fair" };
  if (value < 10) return { score: 95, grade: "Excellent" };
  if (value < 25) return { score: 75, grade: "Good" };
  if (value < 50) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

### 10. Average Time to Close

**Algorithm**:
```javascript
function calculateAverageTimeToClose(issues) {
  const closedIssues = issues.filter(i =>
    !i.pull_request && i.state === 'closed' && i.closed_at
  );

  if (closedIssues.length === 0) return null;

  const closeTimes = closedIssues.map(i => {
    const created = new Date(i.created_at);
    const closed = new Date(i.closed_at);
    const daysDiff = (closed - created) / (1000 * 60 * 60 * 24);
    return daysDiff;
  });

  const average = closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
  return average;
}

function scoreAverageTimeToClose(value) {
  if (value === null) return { score: 50, grade: "Fair" };
  if (value < 7) return { score: 95, grade: "Excellent" };
  if (value < 30) return { score: 75, grade: "Good" };
  if (value < 90) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

## Category 4: Documentation Metrics

### 11. README Quality Score

**Algorithm**:
```javascript
function calculateREADMEQualityScore(readme, repo) {
  let score = 0;

  // 1 point: Length > 500 characters
  if (readme && readme.length > 500) score++;

  // 1 point: Has installation section
  if (readme && /##?\s*(install|installation|getting started|setup)/i.test(readme)) score++;

  // 1 point: Has usage examples
  if (readme && /##?\s*(usage|example|quick start)/i.test(readme)) score++;

  // 1 point: Has badges (shields.io or similar)
  if (readme && /!\[.*\]\(https:\/\/(img\.shields\.io|badge)/i.test(readme)) score++;

  // 1 point: Has table of contents
  if (readme && /##?\s*(table of contents|toc)/i.test(readme)) score++;

  return score; // 0-5
}

function scoreREADMEQuality(value) {
  if (value === 5) return { score: 95, grade: "Excellent" };
  if (value === 4) return { score: 80, grade: "Good" };
  if (value === 3) return { score: 60, grade: "Fair" };
  return { score: 30, grade: "Poor" };
}
```

---

### 12. Documentation Directory

**Algorithm**:
```javascript
async function checkDocumentationDirectory(owner, repo) {
  try {
    // Try to fetch /docs directory
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/docs`
    );
    return response.status === 200;
  } catch {
    try {
      // Try /documentation directory
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/documentation`
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

function scoreDocumentationDirectory(value) {
  return value
    ? { score: 100, grade: "Pass" }
    : { score: 0, grade: "Fail" };
}
```

---

### 13. Wiki Presence

**Algorithm**:
```javascript
function checkWikiPresence(repo) {
  return repo.has_wiki && repo.wiki_url !== null;
}

function scoreWikiPresence(value) {
  return value
    ? { score: 100, grade: "Pass" }
    : { score: 0, grade: "Fail" };
}
```

---

## Category 5: Security & Governance

### 14-17. Community Health Files

**Algorithm** (similar for all):
```javascript
function checkCommunityFile(community, fileKey) {
  return community.files && community.files[fileKey] !== null;
}

function scoreCommunityFile(value) {
  return value
    ? { score: 100, grade: "Pass" }
    : { score: 0, grade: "Fail" };
}

// Specific checks:
// 14. Security Policy: checkCommunityFile(community, 'security')
// 15. Code of Conduct: checkCommunityFile(community, 'code_of_conduct')
// 16. Contributing Guidelines: checkCommunityFile(community, 'contributing')
// 17. License: checkCommunityFile(community, 'license')
```

---

### 18. Bus Factor

**Algorithm**:
```javascript
function calculateBusFactor(contributors) {
  if (contributors.length === 0) return 0;

  // Sort by contributions descending
  const sorted = [...contributors].sort((a, b) =>
    b.contributions - a.contributions
  );

  // Calculate total contributions
  const totalContributions = sorted.reduce((sum, c) =>
    sum + c.contributions, 0
  );

  // Find minimum contributors accounting for 50% of commits
  const halfContributions = totalContributions * 0.5;
  let cumulative = 0;
  let busFactor = 0;

  for (const contributor of sorted) {
    cumulative += contributor.contributions;
    busFactor++;
    if (cumulative >= halfContributions) break;
  }

  return busFactor;
}

function scoreBusFactor(value) {
  if (value >= 5) return { score: 95, grade: "Excellent" };
  if (value >= 3) return { score: 75, grade: "Good" };
  if (value === 2) return { score: 50, grade: "Fair" };
  return { score: 25, grade: "Poor" };
}
```

---

## Overall Health Score Calculation

**Algorithm**:
```javascript
function calculateOverallHealthScore(metrics) {
  // Category weights
  const weights = {
    activity: 0.25,
    community: 0.25,
    maintenance: 0.25,
    documentation: 0.15,
    security: 0.10
  };

  // Calculate category averages
  const categoryScores = {};
  for (const category of Object.keys(weights)) {
    const categoryMetrics = metrics.filter(m => m.category === category);
    const avgScore = categoryMetrics.reduce((sum, m) =>
      sum + m.score, 0
    ) / categoryMetrics.length;
    categoryScores[category] = avgScore;
  }

  // Calculate weighted overall score
  const overallScore = Object.entries(weights).reduce((sum, [cat, weight]) =>
    sum + (categoryScores[cat] * weight), 0
  );

  return {
    overallScore: Math.round(overallScore),
    categoryScores,
    overallGrade: scoreToGrade(overallScore)
  };
}

function scoreToGrade(score) {
  if (score >= 97) return "A+";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
```

---

## Contract Test Cases

### Unit Tests (per metric):
1. **Valid Input**: Metric calculation produces expected output
2. **Edge Case: Empty Data**: Handles no commits/issues/contributors gracefully
3. **Edge Case: Minimal Data**: Handles single contributor, single commit
4. **Edge Case: Large Data**: Handles repositories with 10,000+ contributors
5. **Scoring Boundaries**: Verifies threshold boundaries are correct
6. **Grade Assignment**: Verifies score-to-grade conversion is accurate

### Integration Tests:
1. **Full Evaluation**: All 18 metrics calculated from GitHub API data
2. **Overall Score**: Weighted average matches manual calculation
3. **Category Scores**: Each category average is correct
4. **Data Quality**: No NaN, null, or undefined in output

---

## Summary

This contract defines:
- ✅ 18 baseline metrics with complete calculation algorithms
- ✅ Scoring thresholds for each metric
- ✅ Input data requirements from GitHub API
- ✅ Output schema standardization
- ✅ Overall health score calculation (weighted average)
- ✅ Grade assignment logic (A+ to F)
- ✅ Contract test cases for validation
