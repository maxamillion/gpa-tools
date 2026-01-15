# Data Model: Open Source Project Health Analyzer

**Feature**: Open Source Project Health Analyzer
**Branch**: 001-project-health-analyzer
**Date**: 2026-01-15

## Overview

This document defines the core entities, their attributes, relationships, and validation rules for the project health analyzer application.

---

## Entity Definitions

### 1. Repository

**Purpose**: Represents an open source project being evaluated

**Attributes**:
- `owner` (string, required): Repository owner/organization name
- `name` (string, required): Repository name
- `url` (string, required): Full GitHub URL
- `description` (string, optional): Repository description
- `language` (string, optional): Primary programming language
- `stars` (number, required): Star count
- `forks` (number, required): Fork count
- `createdAt` (Date, required): Repository creation timestamp
- `updatedAt` (Date, required): Last update timestamp
- `license` (string, optional): License identifier (e.g., "MIT", "Apache-2.0")
- `isArchived` (boolean, required): Whether repository is archived
- `isPrivate` (boolean, required): Whether repository is private

**Validation Rules**:
- `owner` and `name` must match GitHub username/repo name pattern: `^[a-zA-Z0-9-_.]+$`
- `url` must be valid GitHub repository URL format
- `stars` and `forks` must be non-negative integers
- `createdAt` must be before `updatedAt`

**Derived Properties**:
- `fullName`: Computed as `${owner}/${name}`
- `age`: Computed as days since `createdAt`

**Example**:
```json
{
  "owner": "facebook",
  "name": "react",
  "url": "https://github.com/facebook/react",
  "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
  "language": "JavaScript",
  "stars": 200000,
  "forks": 42000,
  "createdAt": "2013-05-24T16:15:54Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "license": "MIT",
  "isArchived": false,
  "isPrivate": false
}
```

---

### 2. Metric

**Purpose**: Represents a single health indicator measurement

**Attributes**:
- `id` (string, required): Unique metric identifier (e.g., "commit-frequency")
- `name` (string, required): Display name (e.g., "Commit Frequency")
- `category` (string, required): Category name (see MetricCategory)
- `value` (number or boolean, required): Raw metric value
- `score` (number, required): Normalized score (0-100)
- `grade` (string, required): Letter grade (A+, A, B, C, D, F) or status (Excellent, Good, Fair, Poor)
- `explanation` (string, required): What this metric measures
- `whyItMatters` (string, required): Why this metric is important
- `threshold` (object, required): Scoring threshold definitions
- `trend` (string, optional): Trend indicator (improving, stable, declining)
- `dataSource` (string, required): Where data came from (e.g., "GitHub API: /repos/{owner}/{repo}/contributors")
- `calculatedAt` (Date, required): When metric was calculated
- `confidence` (string, required): Confidence level (high, medium, low)

**Validation Rules**:
- `score` must be between 0 and 100
- `grade` must be one of: "A+", "A", "B", "C", "D", "F" or "Excellent", "Good", "Fair", "Poor"
- `category` must be valid category from MetricCategory enum
- `confidence` must be one of: "high", "medium", "low"
- `trend` must be one of: "improving", "stable", "declining" (if present)

**Example**:
```json
{
  "id": "commit-frequency",
  "name": "Commit Frequency",
  "category": "Activity",
  "value": 15.3,
  "score": 75,
  "grade": "Good",
  "explanation": "Average commits per week over the last 90 days",
  "whyItMatters": "High commit frequency indicates active development and regular maintenance",
  "threshold": {
    "excellent": { "min": 20, "label": "Excellent" },
    "good": { "min": 5, "max": 20, "label": "Good" },
    "fair": { "min": 1, "max": 5, "label": "Fair" },
    "poor": { "max": 1, "label": "Poor" }
  },
  "trend": "stable",
  "dataSource": "GitHub API: /repos/{owner}/{repo}/commits",
  "calculatedAt": "2026-01-15T10:30:00Z",
  "confidence": "high"
}
```

---

### 3. MetricCategory

**Purpose**: Groups related metrics for organizational clarity

**Attributes**:
- `id` (string, required): Category identifier (e.g., "activity")
- `name` (string, required): Display name (e.g., "Activity Metrics")
- `description` (string, required): Category description
- `icon` (string, optional): Icon identifier for UI
- `order` (number, required): Display order (1-5)

**Enum Values**:
- `activity`: Activity Metrics (commit frequency, releases, last activity)
- `community`: Community Metrics (contributors, PR merge rate, new contributors)
- `maintenance`: Maintenance Metrics (issue ratios, response times, stale issues)
- `documentation`: Documentation Metrics (README quality, docs directory, wiki)
- `security`: Security & Governance (security policy, CoC, contributing guide, license)

**Validation Rules**:
- `order` must be between 1 and 5
- `id` must be unique across all categories

**Example**:
```json
{
  "id": "activity",
  "name": "Activity Metrics",
  "description": "Measures development activity and project momentum",
  "icon": "activity-icon",
  "order": 1
}
```

---

### 4. CustomCriterion

**Purpose**: User-defined evaluation rule for specific requirements

**Attributes**:
- `id` (string, required): Unique criterion identifier (UUID or slug)
- `name` (string, required): Display name (e.g., "Uses TypeScript")
- `description` (string, required): Detailed description of what's being evaluated
- `type` (string, required): Criterion type (technology, theme, capability, inclusion, exclusion)
- `evaluationType` (string, required): How it's evaluated (automatic, manual)
- `evaluationLogic` (string, optional): Logic for automatic evaluation (e.g., "check package.json dependencies")
- `result` (string, optional): Evaluation result (pass, fail, score)
- `resultValue` (number or boolean, optional): Numeric score or boolean pass/fail
- `confidence` (string, optional): Confidence level (definite, likely, manual-review-needed)
- `supportingEvidence` (string, optional): Evidence for the result (e.g., "Found TypeScript in package.json devDependencies")
- `createdAt` (Date, required): When criterion was created
- `evaluatedAt` (Date, optional): When criterion was last evaluated

**Validation Rules**:
- `type` must be one of: "technology", "theme", "capability", "inclusion", "exclusion"
- `evaluationType` must be one of: "automatic", "manual"
- `result` must be one of: "pass", "fail", "score" (if present)
- `confidence` must be one of: "definite", "likely", "manual-review-needed" (if present)
- If `evaluationType` is "automatic", `evaluationLogic` is required
- If `result` is present, `evaluatedAt` is required

**Example**:
```json
{
  "id": "criterion-typescript-001",
  "name": "Uses TypeScript",
  "description": "Project is written in TypeScript or has TypeScript as a dependency",
  "type": "technology",
  "evaluationType": "automatic",
  "evaluationLogic": "Check if 'language' === 'TypeScript' OR 'typescript' in dependencies",
  "result": "pass",
  "resultValue": true,
  "confidence": "definite",
  "supportingEvidence": "Primary language is TypeScript",
  "createdAt": "2026-01-15T09:00:00Z",
  "evaluatedAt": "2026-01-15T10:30:00Z"
}
```

---

### 5. EvaluationProfile

**Purpose**: Complete evaluation configuration and results for a repository

**Attributes**:
- `id` (string, required): Unique evaluation identifier (UUID)
- `repository` (Repository, required): Repository being evaluated
- `baselineMetrics` (Array<Metric>, required): All baseline metrics (18 total)
- `customCriteria` (Array<CustomCriterion>, optional): User-defined criteria
- `healthScore` (HealthScore, required): Aggregate health score
- `createdAt` (Date, required): When evaluation was created
- `evaluatedAt` (Date, required): When metrics were calculated
- `shareUrl` (string, optional): Shareable URL with encoded params
- `cacheKey` (string, required): Key for localStorage caching

**Validation Rules**:
- `baselineMetrics` must contain exactly 18 metrics
- All metrics must have same `calculatedAt` timestamp
- `healthScore` must be derived from `baselineMetrics`
- `createdAt` must be before or equal to `evaluatedAt`

**Example**:
```json
{
  "id": "eval-001-facebook-react",
  "repository": { /* Repository object */ },
  "baselineMetrics": [ /* 18 Metric objects */ ],
  "customCriteria": [ /* Array of CustomCriterion objects */ ],
  "healthScore": { /* HealthScore object */ },
  "createdAt": "2026-01-15T10:00:00Z",
  "evaluatedAt": "2026-01-15T10:30:00Z",
  "shareUrl": "https://user.github.io/gpa-tools/?repo=facebook/react",
  "cacheKey": "repo:facebook/react:eval:v1"
}
```

---

### 6. HealthScore

**Purpose**: Aggregate score summarizing overall project health

**Attributes**:
- `overallScore` (number, required): Weighted average of all baseline metrics (0-100)
- `overallGrade` (string, required): Letter grade (A+, A, B, C, D, F)
- `categoryScores` (object, required): Scores by category
  - `activity` (number, required): Activity category score (0-100)
  - `community` (number, required): Community category score (0-100)
  - `maintenance` (number, required): Maintenance category score (0-100)
  - `documentation` (number, required): Documentation category score (0-100)
  - `security` (number, required): Security category score (0-100)
- `trend` (string, optional): Overall trend (improving, stable, declining)
- `calculatedAt` (Date, required): When score was calculated

**Validation Rules**:
- `overallScore` must be between 0 and 100
- `overallGrade` must be one of: "A+", "A", "B", "C", "D", "F"
- All `categoryScores` values must be between 0 and 100
- `trend` must be one of: "improving", "stable", "declining" (if present)

**Grading Scale**:
- A+: 97-100
- A: 90-96
- B: 80-89
- C: 70-79
- D: 60-69
- F: 0-59

**Example**:
```json
{
  "overallScore": 85,
  "overallGrade": "B",
  "categoryScores": {
    "activity": 90,
    "community": 85,
    "maintenance": 80,
    "documentation": 88,
    "security": 82
  },
  "trend": "stable",
  "calculatedAt": "2026-01-15T10:30:00Z"
}
```

---

## Entity Relationships

```
EvaluationProfile
├── 1:1 Repository (has one)
├── 1:N Metric (has many - exactly 18 baseline metrics)
├── 1:N CustomCriterion (has many - 0 to unlimited)
└── 1:1 HealthScore (has one)

HealthScore
└── derived from → Metric[] (calculated from baseline metrics)

Metric
└── belongs to → MetricCategory (categorized by)

CustomCriterion
└── independent (no foreign key relationships)
```

### Relationship Rules:

**EvaluationProfile ↔ Repository**:
- One-to-one relationship
- Repository is embedded within EvaluationProfile
- No separate repository storage needed (stateless application)

**EvaluationProfile ↔ Metric**:
- One-to-many relationship
- Exactly 18 baseline metrics per evaluation (validated)
- Metrics are recalculated for each evaluation (not cached independently)

**EvaluationProfile ↔ CustomCriterion**:
- One-to-many relationship
- Zero to unlimited custom criteria
- Custom criteria can be reused across evaluations (stored in user preferences)

**EvaluationProfile ↔ HealthScore**:
- One-to-one relationship
- HealthScore is derived/calculated from baseline metrics
- Not stored separately, computed on-demand

---

## State Transitions

### EvaluationProfile Lifecycle:

```
[Created] → [Fetching Data] → [Calculating Metrics] → [Complete] → [Cached]
                ↓                       ↓
           [Error: API Failure]  [Error: Calculation Failure]
```

**States**:
1. **Created**: Profile initialized, awaiting data fetch
2. **Fetching Data**: GitHub API calls in progress
3. **Calculating Metrics**: Data fetched, computing metrics
4. **Complete**: All metrics calculated, ready for display
5. **Cached**: Evaluation stored in localStorage
6. **Error**: API or calculation failure (with error details)

### CustomCriterion Lifecycle:

```
[Defined] → [Evaluating] → [Evaluated] → [Cached]
                ↓
           [Manual Review Needed]
```

**States**:
1. **Defined**: Criterion created by user
2. **Evaluating**: Automatic evaluation in progress
3. **Evaluated**: Result determined (pass/fail/score)
4. **Manual Review Needed**: Cannot be automatically evaluated
5. **Cached**: Criterion definition stored in localStorage

---

## Data Validation Functions

### Repository Validation:
```javascript
function validateRepository(repo) {
  const errors = [];

  if (!repo.owner || !/^[a-zA-Z0-9-_.]+$/.test(repo.owner)) {
    errors.push("Invalid owner name");
  }

  if (!repo.name || !/^[a-zA-Z0-9-_.]+$/.test(repo.name)) {
    errors.push("Invalid repository name");
  }

  if (!repo.url || !repo.url.startsWith('https://github.com/')) {
    errors.push("Invalid GitHub URL");
  }

  if (repo.stars < 0 || repo.forks < 0) {
    errors.push("Stars and forks must be non-negative");
  }

  if (new Date(repo.createdAt) > new Date(repo.updatedAt)) {
    errors.push("Created date must be before updated date");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
```

### Metric Validation:
```javascript
function validateMetric(metric) {
  const errors = [];

  if (metric.score < 0 || metric.score > 100) {
    errors.push("Score must be between 0 and 100");
  }

  const validGrades = ["A+", "A", "B", "C", "D", "F", "Excellent", "Good", "Fair", "Poor"];
  if (!validGrades.includes(metric.grade)) {
    errors.push("Invalid grade");
  }

  const validCategories = ["activity", "community", "maintenance", "documentation", "security"];
  if (!validCategories.includes(metric.category)) {
    errors.push("Invalid category");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
```

---

## Storage Schema (localStorage)

### Key Structure:
```
gpa:repo:{owner}/{name}:eval:v1         # Cached evaluation
gpa:preferences:user                     # User preferences
gpa:criteria:definitions                 # Custom criteria definitions
gpa:history:recent                       # Recent evaluations
```

### Example localStorage Content:
```javascript
{
  // Cached evaluation
  "gpa:repo:facebook/react:eval:v1": {
    "data": { /* EvaluationProfile */ },
    "timestamp": "2026-01-15T10:30:00Z",
    "ttl": 3600000 // 1 hour in milliseconds
  },

  // User preferences
  "gpa:preferences:user": {
    "theme": "light",
    "defaultMetrics": ["activity", "community"],
    "encryptedToken": "..."
  },

  // Custom criteria
  "gpa:criteria:definitions": [
    { /* CustomCriterion */ },
    { /* CustomCriterion */ }
  ],

  // Recent evaluations
  "gpa:history:recent": [
    "facebook/react",
    "vuejs/vue",
    "angular/angular"
  ]
}
```

---

## Summary

This data model supports:
- ✅ All 33 functional requirements from spec
- ✅ 18 baseline metrics across 5 categories
- ✅ User-defined custom criteria with automatic evaluation
- ✅ localStorage persistence and caching
- ✅ URL parameter sharing
- ✅ Export to JSON/CSV
- ✅ Comprehensive validation
- ✅ Clear entity relationships and lifecycle management

Next: Generate API contracts (contracts/ directory)
