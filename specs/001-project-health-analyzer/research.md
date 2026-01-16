# Research Document: Open Source Project Health Analyzer

**Feature Branch**: `001-project-health-analyzer`
**Created**: 2026-01-15
**Updated**: 2026-01-16
**Status**: Complete
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document contains comprehensive research findings and technology decisions for the Open Source Project Health Analyzer. Each decision is supported by evidence from industry standards, performance data, maintainability considerations, and current best practices as of January 2026.

---

## 1. GitHub API Integration

### Decision: REST API v3 with Conditional Requests

**Selected Technology**: GitHub REST API v3 with Octokit.js client library

**Rationale**:

1. **Rate Limit Efficiency**: REST API provides 5,000 requests per hour with authentication vs GraphQL's point-based system (5,000 points per hour). For single repository evaluation, REST's per-endpoint limits are more predictable and easier to manage. Both APIs share secondary rate limits: no more than 900 points per minute for REST and 2,000 points per minute for GraphQL.

2. **Conditional Requests Support**: REST API supports ETag headers for conditional requests (`If-None-Match`), which GraphQL does not support. This allows fetching data only when it has changed, crucial for our 24-hour cache strategy and minimizing unnecessary API consumption.

3. **Simpler Implementation**: REST endpoints map directly to our metric calculation needs (commits, issues, contributors, releases) without requiring complex query construction. You can utilize ETag headers to fetch data only if it has changed and avoid unnecessary requests by caching frequent API responses.

4. **Better Documentation and Best Practices**: REST API has more comprehensive documentation and established patterns for client-side applications. Industry best practices recommend monitoring rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) to adjust requests dynamically and spreading requests out with throttling.

**Alternatives Considered**:

- **GraphQL API**:
  - *Pros*: Can accomplish the equivalent of multiple REST API requests in a single GraphQL request, making it appealing for mobile applications. Returns exactly the data requested in a pre-known structure based on your request.
  - *Cons*: No conditional request support (no ETag headers), point-based rate limiting is harder to predict and manage, more complex error handling, shared secondary rate limits with REST.
  - *Rejected because*: Lack of ETag support breaks our caching strategy, and for single repository evaluation, the efficiency gains are minimal compared to the added complexity.

- **Native fetch() without library**:
  - *Pros*: Zero dependencies, full control over requests
  - *Cons*: Must implement pagination, rate limit handling, error parsing, retries, and authentication manually
  - *Rejected because*: Octokit.js provides battle-tested implementations of these concerns (~15KB overhead is acceptable)

**Implementation Notes**:

**API Endpoints Required**:
- `GET /repos/{owner}/{repo}` - Repository metadata
- `GET /repos/{owner}/{repo}/commits` - Commit history (pagination)
- `GET /repos/{owner}/{repo}/contributors` - Contributor list
- `GET /repos/{owner}/{repo}/releases` - Release history
- `GET /repos/{owner}/{repo}/issues` - Issue list (with PR filtering)
- `GET /repos/{owner}/{repo}/pulls` - Pull request list
- `GET /repos/{owner}/{repo}/readme` - README content
- `GET /repos/{owner}/{repo}/community/profile` - Community health files
- `GET /rate_limit` - Check remaining quota

**Rate Limit Management Pattern**:

```javascript
import { Octokit } from '@octokit/rest';

class GitHubApiClient {
  constructor(token = null) {
    this.octokit = new Octokit({ auth: token });
    this.rateLimitQueue = [];
  }

  async fetchWithRateLimit(endpoint, params) {
    // Monitor rate limit headers
    const { data: rateLimit } = await this.octokit.rateLimit.get();

    if (rateLimit.rate.remaining < 10) {
      // Queue request for exponential backoff
      return this.queueRequest(endpoint, params);
    }

    // Use ETag for conditional requests
    const cacheKey = `etag:${endpoint}:${JSON.stringify(params)}`;
    const cachedETag = localStorage.getItem(cacheKey);

    try {
      const response = await this.octokit.request(endpoint, {
        ...params,
        headers: cachedETag ? { 'If-None-Match': cachedETag } : {}
      });

      // Store ETag for future requests
      if (response.headers.etag) {
        localStorage.setItem(cacheKey, response.headers.etag);
      }

      return response.data;
    } catch (error) {
      if (error.status === 304) {
        // Not modified - use cached data
        return this.getCachedData(endpoint, params);
      }
      throw error;
    }
  }

  async queueRequest(endpoint, params) {
    // Exponential backoff: 1s → 2s → 4s → 8s → 16s → 32s → 60s (max)
    // Back off and retry after reset time when limits exceeded
    const delay = Math.min(1000 * Math.pow(2, this.rateLimitQueue.length), 60000);
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.fetchWithRateLimit(endpoint, params);
  }
}
```

**Key Optimization Strategies**:

1. **Exponential Backoff with Jitter**: Implement exponential backoff with jitter when limits are hit to prevent thundering herd problem
2. **Proactive Rate Limit Monitoring**: Check remaining quota before making requests, display warnings to users
3. **Conditional Requests**: Use ETag headers to avoid re-fetching unchanged data
4. **Request Batching**: For REST endpoints with pagination, set maximum results per page (often 100 instead of default 30) to reduce number of requests needed
5. **Token Rotation**: For high-volume scenarios, rotate between multiple OAuth tokens (not needed for this application)

**Sources**:
- [Understanding GitHub API Rate Limits: REST, GraphQL, and Beyond](https://github.com/orgs/community/discussions/163553)
- [Rate limits for the REST API - GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [Best Practices for Handling GitHub API Rate Limits](https://github.com/orgs/community/discussions/151675)
- [Comparing GitHub's REST and GraphQL APIs](https://www.stevemar.net/github-graphql-vs-rest/)
- [Making the most of GitHub rate limits](https://jamiemagee.co.uk/blog/making-the-most-of-github-rate-limits/)

---

## 2. Metric Calculation Algorithms

### Decision: CHAOSS Framework with Adaptive Thresholds

**Selected Approach**: Implementation based on CHAOSS (Community Health Analytics in Open Source Software) metrics with project-specific scoring algorithms

**Rationale**:

1. **Industry Standard**: CHAOSS is a Linux Foundation project focused on creating metrics, metrics models, and software to better understand open source community health on a global scale. The project aims to establish standard implementation-agnostic metrics for measuring community activity, contributions, and health, which are objective and repeatable.

2. **ISO Standards Development**: CHAOSS is actively working to formalize their metrics as ISO standards. ISO standards ensure interoperability and aid in establishing credible industry practices, particularly focusing on security and community activity.

3. **Comprehensive Coverage**: CHAOSS provides metrics across all our required categories (Activity, Community, Maintenance, Documentation, Security), helping open source projects monitor their health by analyzing data and metrics.

4. **Flexible Starter Model**: The CHAOSS Metrics Model: Starter Project Health provides four basic measurements as a way to quickly assess project health at a very basic level, with the expectation that individual projects should develop additional metrics to better understand other aspects important for their specific needs.

**Alternatives Considered**:

- **Custom Metric System from Scratch**:
  - *Pros*: Full control over definitions and scoring
  - *Cons*: Lack of industry validation, harder to justify to users, no community support
  - *Rejected because*: Reinventing established standards reduces credibility and wastes effort

- **GitHub's Community Standards Check**:
  - *Pros*: Official GitHub metrics, easy to implement via API
  - *Cons*: Limited to basic health files (README, LICENSE, etc.), doesn't measure activity or community engagement depth
  - *Rejected because*: Too limited for comprehensive health analysis beyond documentation presence

**Implementation Notes**:

**18 Baseline Metrics Across 5 Categories**:

```javascript
// Based on CHAOSS metrics with custom scoring
const CATEGORY_WEIGHTS = {
  security: 0.25,      // Highest priority - security vulnerabilities impact all users
  maintenance: 0.25,   // High priority - abandoned projects are risky
  community: 0.20,     // Important - healthy community ensures longevity
  activity: 0.15,      // Moderate - high activity indicates momentum
  documentation: 0.15  // Moderate - good docs improve adoption
};

const BASELINE_METRICS = {
  activity: [
    'commitFrequency',      // CHAOSS: Activity Metrics - Code Development Activity
    'releaseCadence',       // CHAOSS: Activity Metrics - Release Frequency
    'timeSinceLastCommit',  // Custom metric based on CHAOSS activity patterns
  ],
  community: [
    'contributorCount',     // CHAOSS: Community Growth - Contributors
    'issueResponseTime',    // CHAOSS: Community Responsiveness - Issue Response Time
    'prMergeRate',          // CHAOSS: Code Development - Change Request Acceptance Ratio
    'busFactor'             // CHAOSS: Risk - Elephant Factor (contributor concentration)
  ],
  maintenance: [
    'openClosedIssueRatio', // CHAOSS: Issue Resolution - Issue Resolution Efficiency
    'staleIssuePercentage', // Custom metric based on CHAOSS issue metrics
    'avgTimeToCloseIssues'  // CHAOSS: Issue Resolution - Time to Close
  ],
  documentation: [
    'hasReadme',            // CHAOSS: Documentation - Presence
    'hasContributing',      // CHAOSS: Documentation - Contributing Guide
    'hasCodeOfConduct',     // CHAOSS: Documentation - Code of Conduct
    'documentationCoverage' // Custom metric for docs directory
  ],
  security: [
    'hasSecurityPolicy',    // CHAOSS: Security - Security Policy
    'hasDependabot',        // Best practice for dependency management
    'vulnerabilityCount',   // CHAOSS: Security - Vulnerability Disclosures
    'licensePresence'       // CHAOSS: Legal - License Declared
  ]
};
```

**Adaptive Thresholds Based on Repository Size**:

```javascript
// Thresholds vary by repository size (contributor count)
function calculateMetricScore(metricId, rawValue, repoContext) {
  const thresholds = getThresholdsForRepoSize(metricId, repoContext.contributorCount);

  // Example: Commit frequency scoring
  if (metricId === 'commitFrequency') {
    // rawValue = commits per month
    if (rawValue >= thresholds.excellent) return { score: 100, grade: 'A' };
    if (rawValue >= thresholds.good) return { score: 80, grade: 'B' };
    if (rawValue >= thresholds.fair) return { score: 60, grade: 'C' };
    if (rawValue >= thresholds.poor) return { score: 40, grade: 'D' };
    return { score: 20, grade: 'F' };
  }

  // Handle missing data gracefully (FR-037 requirement)
  if (rawValue === null || rawValue === undefined) {
    return {
      score: null,
      grade: 'N/A',
      reason: 'Data unavailable - metric calculation requires information not present in this repository'
    };
  }
}

// Adaptive thresholds based on project size
function getThresholdsForRepoSize(metricId, contributorCount) {
  // Small projects (1-10 contributors)
  if (contributorCount <= 10) {
    return {
      commitFrequency: { excellent: 20, good: 10, fair: 5, poor: 1 }
    };
  }
  // Medium projects (11-100 contributors)
  else if (contributorCount <= 100) {
    return {
      commitFrequency: { excellent: 100, good: 50, fair: 20, poor: 5 }
    };
  }
  // Large projects (100+ contributors)
  else {
    return {
      commitFrequency: { excellent: 500, good: 200, fair: 50, poor: 10 }
    };
  }
}
```

**Handling Missing/Incomplete Data** (FR-037 requirement):

```javascript
// Category score calculation with N/A handling
function calculateCategoryScore(metrics) {
  const validMetrics = metrics.filter(m => m.score !== null);

  if (validMetrics.length === 0) {
    return {
      score: null,
      grade: 'N/A',
      reason: 'No data available for this category'
    };
  }

  // Calculate weighted average of available metrics only
  const totalScore = validMetrics.reduce((sum, m) => sum + m.score, 0);
  const avgScore = totalScore / validMetrics.length;

  return {
    score: Math.round(avgScore),
    grade: scoreToGrade(avgScore),
    availableMetrics: validMetrics.length,
    totalMetrics: metrics.length,
    completeness: (validMetrics.length / metrics.length) * 100
  };
}

// Overall health score excludes N/A categories (FR-037 requirement)
function calculateOverallHealthScore(categoryScores) {
  const validCategories = Object.entries(categoryScores)
    .filter(([_, score]) => score.score !== null);

  if (validCategories.length === 0) {
    return {
      score: null,
      grade: 'N/A',
      reason: 'Insufficient data to calculate overall health score'
    };
  }

  // Recalculate weights for available categories only
  const totalWeight = validCategories.reduce(
    (sum, [category]) => sum + CATEGORY_WEIGHTS[category],
    0
  );

  const weightedScore = validCategories.reduce(
    (sum, [category, score]) => {
      const adjustedWeight = CATEGORY_WEIGHTS[category] / totalWeight;
      return sum + (score.score * adjustedWeight);
    },
    0
  );

  return {
    score: Math.round(weightedScore),
    grade: scoreToGrade(weightedScore),
    categoriesEvaluated: validCategories.length,
    totalCategories: Object.keys(CATEGORY_WEIGHTS).length,
    completeness: (validCategories.length / Object.keys(CATEGORY_WEIGHTS).length) * 100
  };
}
```

**Detailed Metric Definitions**:

**Activity Category** (CHAOSS: Activity Metrics):
1. **Commit Frequency**: Commits per month (last 90 days average)
   - Excellent > 100/month, Good 50-100, Fair 20-50, Poor < 20 (for medium projects)
   - Why it matters: Indicates active development and project momentum

2. **Release Cadence**: Days between releases (last 5 releases average)
   - Excellent < 30 days, Good 30-90, Fair 90-180, Poor > 180
   - Why it matters: Shows maintenance commitment and maturity

3. **Time Since Last Commit**: Days since most recent commit
   - Excellent < 7 days, Good 7-30, Fair 30-90, Poor > 90
   - Why it matters: Detects potentially abandoned projects

**Community Category** (CHAOSS: Community Metrics):
4. **Contributor Count**: Unique contributors (all time)
   - Excellent > 50, Good 10-50, Fair 3-10, Poor < 3
   - Why it matters: Indicates community size and health

5. **Issue Response Time**: Median time to first response on issues (hours)
   - Excellent < 24hrs, Good 24-72hrs, Fair 72-168hrs, Poor > 168hrs
   - Why it matters: Indicates maintainer responsiveness and community engagement

6. **PR Merge Rate**: (Merged PRs / Total PRs) × 100%
   - Excellent > 70%, Good 50-70%, Fair 30-50%, Poor < 30%
   - Why it matters: Shows welcoming maintainers and healthy contribution process

7. **Bus Factor**: Minimum number of contributors accounting for 50% of commits
   - Excellent > 5, Good 3-5, Fair 2, Poor 1
   - Why it matters: Concentration risk - low bus factor indicates key person dependency

**Maintenance Category** (CHAOSS: Issue Resolution):
8. **Open/Closed Issue Ratio**: Open issues / (Open + Closed issues)
   - Excellent < 20%, Good 20-40%, Fair 40-60%, Poor > 60%
   - Why it matters: Shows issue management health and responsiveness

9. **Stale Issues Percentage**: (Issues inactive > 90 days / Total open issues) × 100%
   - Excellent < 10%, Good 10-25%, Fair 25-50%, Poor > 50%
   - Why it matters: Indicates maintenance attention and issue triage

10. **Average Time to Close Issues**: Mean time from creation to close (days)
    - Excellent < 7 days, Good 7-30, Fair 30-90, Poor > 90
    - Why it matters: Shows efficiency in addressing user concerns

**Documentation Category** (CHAOSS: Documentation):
11. **README Presence**: Boolean - has README with adequate content
    - Pass: README exists with > 500 characters
    - Why it matters: First impression quality and onboarding

12. **Contributing Guidelines**: Boolean - has CONTRIBUTING.md
    - Pass/Fail
    - Why it matters: Lowers barrier to entry for new contributors

13. **Code of Conduct**: Boolean - has CODE_OF_CONDUCT.md
    - Pass/Fail
    - Why it matters: Welcoming community indicator and inclusivity

14. **Documentation Coverage**: Has /docs or /documentation directory with content
    - Pass/Fail
    - Why it matters: Indicates formal documentation beyond README

**Security & Governance Category** (CHAOSS: Security):
15. **Security Policy**: Boolean - has SECURITY.md file
    - Pass/Fail
    - Why it matters: Shows security consciousness and responsible disclosure process

16. **Dependabot/Dependency Scanning**: Boolean - has automated dependency updates enabled
    - Pass/Fail
    - Why it matters: Proactive vulnerability management

17. **Vulnerability Count**: Number of known security vulnerabilities
    - Excellent: 0, Good: 1-2, Fair: 3-5, Poor: > 5
    - Why it matters: Direct security risk assessment

18. **License Presence**: Boolean - has recognized OSI-approved license
    - Pass/Fail
    - Why it matters: Legal clarity for usage and contribution

**Sources**:
- [CHAOSS Project](https://chaoss.community/)
- [CHAOSS Metrics Repository](https://github.com/chaoss/metrics)
- [Metrics Model: Starter Project Health](https://chaoss.community/kb/metrics-model-starter-project-health/)
- [Linux Foundation: CHAOSS Project Creates Tools to Analyze Software Development](https://www.linuxfoundation.org/blog/blog/chaoss-project-creates-tools-to-analyze-software-development-and-measure-open-source-community-health)
- [How to measure the health of an open source community](https://opensource.com/article/19/8/measure-project)

---

## 3. LocalStorage Caching with TTL

### Decision: LRU + TTL Hybrid Strategy

**Selected Approach**: Combine TTL (Time-to-Live) with LRU (Least Recently Used) eviction policy

**Rationale**:

1. **Balance Freshness and Performance**: Industry recommendation is "TTL + LRU eviction to balance freshness and performance" for client-side caching. TTL ensures data doesn't go stale (24-hour requirement from FR-028), while LRU handles storage quota limits gracefully.

2. **Quota Management**: Browsers limit localStorage to 5-10MB. You can exhaust available memory if you forget to evict unused data or rely on unbounded in-memory caches - always use an eviction policy like LRU or TTL.

3. **User Experience**: Cached evaluations load instantly (<100ms) using the stale-while-revalidate pattern - show cached results immediately while fetching fresh data in background.

4. **Best Practice Consensus**: Combining LRU with TTL support handles scenarios where data needs automatic expiration, enhancing applicability in dynamic environments.

**Alternatives Considered**:

- **TTL Only**:
  - *Pros*: Simple implementation, guaranteed freshness
  - *Cons*: No quota management - can exhaust storage and crash application
  - *Rejected because*: Risk of storage exhaustion with heavy usage violates reliability requirements

- **IndexedDB with TTL**:
  - *Pros*: Larger storage limits (50MB+), better performance for large datasets, asynchronous API
  - *Cons*: Async API increases complexity significantly, overkill for simple key-value caching
  - *Rejected because*: localStorage simplicity is sufficient for our use case (<40KB per evaluation)

- **LRU Only (no TTL)**:
  - *Pros*: Automatic quota management, simple implementation
  - *Cons*: Data can become very stale if repository is frequently accessed
  - *Rejected because*: Doesn't meet 24-hour freshness requirement from FR-028

**Implementation Notes**:

**Cache Manager with TTL + LRU Hybrid Strategy**:

```javascript
// Cache manager with TTL + LRU hybrid strategy (FR-028, FR-035)
class CacheManager {
  constructor(maxSizeMB = 4, defaultTTL = 86400000) { // 4MB limit, 24hr TTL
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
    this.defaultTTL = defaultTTL; // 24 hours = 86400000 ms
    this.accessLog = new Map(); // Track access times for LRU
  }

  set(key, value, ttl = this.defaultTTL) {
    const entry = {
      data: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      size: this.estimateSize(value)
    };

    // Check if adding this entry would exceed quota
    if (this.getCurrentSize() + entry.size > this.maxSizeBytes) {
      this.evictLRU(entry.size);
    }

    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
      this.accessLog.set(key, Date.now());
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Aggressive eviction - remove oldest 50% of entries
        this.evictLRU(this.getCurrentSize() * 0.5);
        // Retry after eviction
        localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
      } else {
        throw error;
      }
    }
  }

  get(key) {
    const cached = localStorage.getItem(`cache:${key}`);
    if (!cached) return null;

    const entry = JSON.parse(cached);

    // TTL check (FR-028: 24-hour cache expiration)
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access time for LRU
    this.accessLog.set(key, Date.now());

    return entry.data;
  }

  // Get cache metadata for display (FR-035)
  getCacheAge(key) {
    const cached = localStorage.getItem(`cache:${key}`);
    if (!cached) return null;

    const entry = JSON.parse(cached);
    const ageMs = Date.now() - entry.timestamp;
    const remainingMs = entry.expiresAt - Date.now();

    return {
      age: this.formatDuration(ageMs),
      remaining: this.formatDuration(remainingMs),
      timestamp: new Date(entry.timestamp).toISOString(),
      isStale: Date.now() > entry.expiresAt
    };
  }

  delete(key) {
    localStorage.removeItem(`cache:${key}`);
    this.accessLog.delete(key);
  }

  // LRU eviction policy
  evictLRU(bytesNeeded) {
    // Sort entries by last access time (oldest first)
    const entries = Array.from(this.accessLog.entries())
      .sort((a, b) => a[1] - b[1]);

    let freedBytes = 0;
    for (const [key, _] of entries) {
      const cached = localStorage.getItem(`cache:${key}`);
      if (cached) {
        const entry = JSON.parse(cached);
        freedBytes += entry.size;
        this.delete(key);
      }

      if (freedBytes >= bytesNeeded) break;
    }
  }

  getCurrentSize() {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('cache:')) {
        const value = localStorage.getItem(key);
        totalSize += new Blob([value]).size;
      }
    }
    return totalSize;
  }

  estimateSize(value) {
    // Rough estimate: JSON string size in bytes
    return new Blob([JSON.stringify(value)]).size;
  }

  // Periodic cleanup of expired entries (call on app init)
  cleanupExpired() {
    const now = Date.now();
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        const entry = JSON.parse(localStorage.getItem(key));
        if (now > entry.expiresAt) {
          keysToDelete.push(key.replace('cache:', ''));
        }
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  formatDuration(ms) {
    if (ms < 0) return 'expired';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }
}

// Usage with stale-while-revalidate pattern
const cache = new CacheManager(4, 86400000); // 4MB, 24 hours

async function evaluateRepository(owner, repo) {
  const cacheKey = `eval:${owner}:${repo}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    // Display cached results immediately (stale-while-revalidate)
    displayResults(cached);

    // Show cache age indicator (FR-035)
    const cacheAge = cache.getCacheAge(cacheKey);
    showCacheIndicator(cacheAge);

    // Fetch fresh data in background
    fetchFreshData(owner, repo).then(fresh => {
      cache.set(cacheKey, fresh);
      updateResults(fresh);
    });
  } else {
    // No cache - fetch and display
    const results = await fetchFreshData(owner, repo);
    cache.set(cacheKey, results);
    displayResults(results);
  }
}
```

**Key Patterns**:

1. **Stale-While-Revalidate**: Show cached results immediately while fetching fresh data in background
2. **Aggressive Cleanup on Quota Errors**: Evict 50% of LRU entries to prevent repeated failures
3. **Size Estimation**: Track entry sizes proactively to prevent quota exhaustion
4. **Periodic Maintenance**: Clean expired entries on app initialization
5. **Cache Age Display**: Show users when data was last fetched (FR-035 requirement)

**Performance Characteristics**:

- **Cache hit**: <1ms (localStorage synchronous access)
- **Cache miss**: ~5-10s (GitHub API calls + calculation)
- **Eviction**: <50ms for typical cache size (100 entries)
- **Storage footprint**: ~40KB per evaluation result (compressed JSON)
- **Quota limit**: 4MB soft limit (10-50 evaluation results), 5-10MB browser hard limit

**Sources**:
- [Caching Strategies for APIs: When to TTL and When to Evict](https://medium.com/@vinaybilla2021/caching-strategies-for-apis-when-to-ttl-and-when-to-evict-8ce8dfcb3356)
- [5 Cache Eviction Strategies Every Developer Should Know](https://www.designgurus.io/blog/cache-eviction-strategies)
- [Cache Eviction Policies: LRU, MRU, LFU, TTL & Random Replacement](https://systemdesignschool.io/fundamentals/cache-eviction)
- [Mastering Caching: Strategies, Patterns & Pitfalls](https://bool.dev/blog/detail/mastering-caching-strategies-patterns-pitfalls)

---

## 4. Web Components Architecture

### Decision: Light DOM with Progressive Enhancement

**Selected Approach**: Custom Elements (Web Components) using Light DOM for styling flexibility, with Shadow DOM only for isolated widgets

**Rationale**:

1. **Global Styling Support**: Light DOM provides CSS theming and branding - it supports global styling, making it easy to apply custom branding to components. The main reason developers are hot on Light DOM is that they find the styling story of Web Components using Shadow DOM annoying.

2. **Accessibility**: Without the encapsulation barriers of Shadow DOM, assistive technologies can traverse the entire DOM tree naturally. Shadow DOM styles cascade before light DOM styles, and a global inheritable style will override a shadow DOM style.

3. **Developer Experience**: Simpler mental model - styles cascade naturally without complex CSS variable workarounds. Shadow-DOM really does make styling terrible - you can pierce through with CSS vars but that means the web components have to be set up to allow theming with CSS vars for color, type, shape, spacing/padding.

4. **SEO and Crawlability**: Light DOM content is immediately visible to search engines and screen readers without special considerations.

5. **Framework Agnostic**: Custom Elements work in vanilla JavaScript without build tooling or framework dependencies, aligning with our zero-framework constraint.

**Alternatives Considered**:

- **Full Shadow DOM Encapsulation**:
  - *Pros*: Complete style isolation prevents external CSS conflicts, true component encapsulation
  - *Cons*: "Shadow DOM makes styling terrible" (industry consensus), requires extensive CSS custom property setup for theming, complicates accessibility, style piercing is difficult
  - *Rejected because*: Over-engineering for a single-site application where style conflicts are controlled. When you build components that others use in environments where you have no access or control over light DOM styles, style encapsulation can be immensely helpful, but that's not our use case.

- **React/Vue Components**:
  - *Pros*: Rich ecosystem, mature tooling, developer familiarity
  - *Cons*: Adds framework dependency (100-200KB), requires build step, breaks static hosting simplicity
  - *Rejected because*: Violates "no framework" constraint from requirements, unnecessary complexity

- **Template Literals + DOM API**:
  - *Pros*: Zero dependencies, full control, minimal abstraction
  - *Cons*: Manual component lifecycle management, no reusability patterns, security risks (XSS if not careful)
  - *Rejected because*: Web Components provide standardized lifecycle and security via native browser APIs

**Implementation Notes**:

**Light DOM Component Pattern**:

```javascript
// Light DOM component pattern (no Shadow DOM)
class MetricCard extends HTMLElement {
  constructor() {
    super();
    // Do NOT use attachShadow() - use Light DOM
  }

  connectedCallback() {
    // Render template into Light DOM
    this.innerHTML = this.render();
    this.attachEventListeners();
  }

  render() {
    const { name, score, grade, category } = this.data;

    // Use template literals for HTML generation
    return `
      <div class="metric-card" data-category="${category}">
        <h3 class="metric-name">${this.escapeHtml(name)}</h3>
        <div class="metric-score" aria-label="Score: ${score} out of 100">
          <span class="score-value">${score}</span>
          <span class="score-grade grade-${grade.toLowerCase()}">${grade}</span>
        </div>
        <button class="info-button" aria-label="Learn more about ${name}">
          <svg aria-hidden="true"><!-- info icon --></svg>
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    this.querySelector('.info-button')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('metric-info-requested', {
        bubbles: true,
        detail: { metricId: this.data.id }
      }));
    });
  }

  set data(value) {
    this._data = value;
    if (this.isConnected) {
      this.connectedCallback(); // Re-render
    }
  }

  get data() {
    return this._data;
  }

  // XSS protection
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Register component
customElements.define('metric-card', MetricCard);

// Usage in HTML:
// <metric-card></metric-card>
// const card = document.querySelector('metric-card');
// card.data = { name: 'Commit Frequency', score: 85, grade: 'B', category: 'activity' };
```

**Shadow DOM Use Cases (Minimal)**:

Use Shadow DOM ONLY for truly isolated components where global styles should not apply. A shadow root with a slot gives a means to style slotted light DOM in a way that defers to the author:

```javascript
// Shadow DOM for isolated widgets (e.g., progress indicators, loading spinners)
class LoadingSpinner extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        /* Encapsulated styles - won't leak out or be affected by global CSS */
        :host {
          display: inline-block;
          width: 40px;
          height: 40px;
        }
        .spinner {
          border: 4px solid rgba(0,0,0,0.1);
          border-left-color: var(--primary-color, #0066cc);
          border-radius: 50%;
          width: 100%;
          height: 100%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="spinner" role="status" aria-live="polite">
        <span class="sr-only">Loading...</span>
      </div>
    `;
  }
}

customElements.define('loading-spinner', LoadingSpinner);
```

**Component Communication Patterns**:

1. **Props Down**: Parent sets properties/attributes on child components
2. **Events Up**: Children dispatch CustomEvents that bubble up to parents
3. **Shared State**: Use a simple event bus for cross-component communication

```javascript
// Simple event bus for component communication
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }
}

const bus = new EventBus();

// Component A emits event
bus.emit('evaluation-complete', { repository: 'facebook/react', score: 92 });

// Component B listens
bus.on('evaluation-complete', (data) => {
  console.log('Evaluation complete:', data);
});
```

**Accessibility Considerations with Light DOM**:

- All interactive elements must have proper ARIA labels
- Custom components must manage focus correctly
- Keyboard navigation works naturally without shadow boundaries
- Screen readers access all content seamlessly (Light DOM ensures this)

**Recommended Components for This Application**:

- `<metric-card>` - Display individual metric (Light DOM)
- `<category-section>` - Group metrics by category (Light DOM)
- `<health-score-card>` - Overall score display (Light DOM)
- `<repository-input>` - URL input form (Light DOM)
- `<custom-criteria-form>` - Custom criteria management (Light DOM)
- `<error-display>` - Error state component (Light DOM)
- `<loading-spinner>` - Loading indicator (Shadow DOM - isolated widget)

**Sources**:
- [Light-DOM-Only Web Components are Sweet](https://frontendmasters.com/blog/light-dom-only/)
- [Pros and Cons of Using Shadow DOM](https://www.matuzo.at/blog/2023/pros-and-cons-of-shadow-dom/)
- [You can use Web Components without the Shadow DOM](https://chromamine.com/2024/10/you-can-use-web-components-without-the-shadow-dom/)
- [Using Shadow DOM - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [HTML Web Components Can Have a Little Shadow DOM, As A Treat](https://scottjehl.com/posts/html-web-components-shadow-dom/)

---

## 5. Testing Strategy

### Decision: Vitest + MSW + Playwright with TDD

**Selected Approach**:
- **Unit/Integration**: Vitest (fast, ES modules native, Vite integration)
- **API Mocking**: MSW (Mock Service Worker for realistic request interception)
- **E2E**: Playwright (multi-browser, reliable, modern API)

**Rationale**:

1. **Vitest for Unit Tests**:
   - Native ES modules support - no configuration needed for `import` statements
   - Fast performance (10x faster than Jest for ES modules in many cases)
   - Vite integration means zero configuration
   - Watch mode with HMR-like speed for rapid feedback
   - Compatible API with Jest for easy migration if needed

2. **MSW for API Mocking**:
   - Intercepts requests at network level (more realistic than mocking fetch directly)
   - Same handlers work in both tests and browser development (reusable mocks)
   - No code changes needed - intercepts actual fetch/XHR calls transparently
   - Great TypeScript support and excellent debugging experience
   - The best place to enable API mocking is in a Vitest setup file by calling server.listen() in beforeAll(), server.resetHandlers() in afterEach(), and server.close() in afterAll()

3. **Playwright for E2E**:
   - Excellent reliability with auto-waits, retries, and stable selectors
   - Multi-browser testing (Chromium, Firefox, WebKit) for comprehensive coverage
   - Modern async/await API with TypeScript support
   - Built-in accessibility testing via axe-core integration
   - Parallel execution and CI-ready configuration
   - Mock Service Worker can intercept requests in Node.js environments, making it work seamlessly with Vitest

**Alternatives Considered**:

- **Jest + Testing Library**:
  - *Pros*: Most popular testing framework, huge ecosystem, familiar to many developers
  - *Cons*: ES modules support requires complex configuration, slower than Vitest, heavier dependency footprint
  - *Rejected because*: Vitest is designed specifically for ES modules and Vite projects

- **Cypress for E2E**:
  - *Pros*: Great developer experience with time-travel debugging, visual test runner
  - *Cons*: Slower than Playwright, WebKit not supported, historically more flaky tests
  - *Rejected because*: Playwright is faster and more reliable for modern web apps

- **Manual API mocking with vi.mock()**:
  - *Pros*: Built into Vitest, no extra dependency
  - *Cons*: Tightly coupled tests, doesn't catch actual network issues, harder to maintain
  - *Rejected because*: MSW provides better test isolation and realism

**Implementation Notes**:

**Vitest Configuration** (`vitest.config.js`):

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Browser-like environment
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js', 'src/**/*.spec.js', 'tests/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    // Performance optimizations
    isolate: true,
    threads: true,
    maxThreads: 4
  }
});
```

**MSW Setup** (`tests/mocks/handlers.js`):

```javascript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock GitHub API repository endpoint
  http.get('https://api.github.com/repos/:owner/:repo', ({ params }) => {
    const { owner, repo } = params;

    return HttpResponse.json({
      id: 10270250,
      name: repo,
      full_name: `${owner}/${repo}`,
      owner: { login: owner },
      description: 'A declarative, efficient, and flexible JavaScript library.',
      stargazers_count: 220000,
      forks_count: 45000,
      open_issues_count: 950,
      created_at: '2013-05-24T16:15:54Z',
      updated_at: '2026-01-16T10:30:00Z'
    });
  }),

  // Mock commits endpoint
  http.get('https://api.github.com/repos/:owner/:repo/commits', ({ request }) => {
    const url = new URL(request.url);
    const since = url.searchParams.get('since');

    return HttpResponse.json([
      {
        sha: 'abc123',
        commit: {
          author: { name: 'Dan Abramov', date: '2026-01-15T10:00:00Z' },
          message: 'Fix bug in useEffect'
        }
      }
    ]);
  }),

  // Mock rate limit endpoint
  http.get('https://api.github.com/rate_limit', () => {
    return HttpResponse.json({
      rate: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600
      }
    });
  })
];
```

**MSW Integration** (`tests/setup.js`):

```javascript
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW server
export const server = setupServer(...handlers);

// Start server before all tests with error on unhandled requests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test to prevent test pollution
afterEach(() => {
  server.resetHandlers();
});

// Cleanup after all tests
afterAll(() => {
  server.close();
});
```

**Example Unit Test** (`src/services/metricCalculator.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { calculateCommitFrequency } from './metricCalculator';
import { server } from '../../tests/setup';
import { http, HttpResponse } from 'msw';

describe('calculateCommitFrequency', () => {
  it('should calculate commits per month correctly', async () => {
    // Test will use MSW handler automatically
    const result = await calculateCommitFrequency('facebook', 'react');

    expect(result).toMatchObject({
      value: expect.any(Number),
      score: expect.any(Number),
      grade: expect.stringMatching(/^[A-F]$/),
      rawData: expect.objectContaining({
        commitsLastMonth: expect.any(Number)
      })
    });
  });

  it('should handle API errors gracefully', async () => {
    // Override handler for this specific test
    server.use(
      http.get('https://api.github.com/repos/:owner/:repo/commits', () => {
        return HttpResponse.json(
          { message: 'Not Found' },
          { status: 404 }
        );
      })
    );

    const result = await calculateCommitFrequency('invalid', 'repo');

    expect(result).toMatchObject({
      value: null,
      score: null,
      grade: 'N/A',
      error: 'Repository not found'
    });
  });
});
```

**Playwright Configuration** (`playwright.config.js`):

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
});
```

**Example E2E Test with Accessibility** (`tests/e2e/evaluate-repository.spec.js`):

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Evaluate Repository', () => {
  test('should display health metrics for valid repository', async ({ page }) => {
    await page.goto('/');

    // Fill repository URL
    await page.fill('input[name="repository-url"]', 'https://github.com/facebook/react');
    await page.click('button[type="submit"]');

    // Wait for results with timeout
    await expect(page.locator('.health-score')).toBeVisible({ timeout: 10000 });

    // Verify all 18 metrics are displayed
    await expect(page.locator('metric-card')).toHaveCount(18);

    // Check overall score is valid
    const score = await page.locator('.health-score .score-value').textContent();
    expect(parseInt(score)).toBeGreaterThan(0);
    expect(parseInt(score)).toBeLessThanOrEqual(100);
  });

  test('should be accessible (WCAG 2.1 AA)', async ({ page }) => {
    await page.goto('/');

    // Run accessibility scan with axe-core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/');

    // Submit invalid repository
    await page.fill('input[name="repository-url"]', 'https://github.com/invalid/doesnotexist');
    await page.click('button[type="submit"]');

    // Verify error message (FR-036)
    await expect(page.locator('.error-message'))
      .toContainText('Repository not found or is private');
  });
});
```

**Testing Pyramid Implementation**:

```
        /\
       /  \
      / E2E \  (Few - Playwright) - Critical user journeys only
     /------\
    /        \
   / Integr. \  (Some - Vitest + MSW) - Service integration
  /----------\
 /            \
/  Unit Tests  \  (Many - Vitest) - Business logic, utilities, models
----------------
```

**Coverage Targets**:
- **Unit Tests**: ≥80% coverage - all business logic, utilities, models
- **Integration Tests**: ≥70% coverage - API integration, workflows, service coordination
- **E2E Tests**: Critical paths only (evaluate repository, custom criteria, error handling)

**Sources**:
- [Using Mock Service Worker With Vitest](https://stevekinney.com/courses/testing/testing-with-mock-service-worker)
- [Vitest Documentation - Mocking Requests](https://vitest.dev/guide/mocking/requests)
- [Testing React Applications with Vitest and MSW](https://medium.com/front-end-weekly/testing-react-applications-the-easy-way-with-testing-library-msw-and-vitest-using-a-sample-932916433203)
- [Quick start - Mock Service Worker](https://mswjs.io/docs/quick-start)
- [Mocking Services with Vitest](https://courses.cs.northwestern.edu/394/guides/mocking-services.php)

---

## 6. Performance Optimization

### Decision: Route-Based Code Splitting + Progressive Loading

**Selected Approach**:
- **Bundle Optimization**: Vite's automatic code splitting with dynamic imports
- **Loading Strategy**: Progressive loading (show results as they arrive)
- **Lazy Loading**: Defer non-critical features (chart visualization, export functionality)

**Rationale**:

1. **Route-Based Splitting**: Route splitting delivers the biggest performance win with minimal effort - every page creates a natural boundary so you load JavaScript for a route only when users navigate to it.

2. **Progressive Loading**: Improves perceived performance significantly - users see first metrics within 2-3 seconds rather than waiting 10+ seconds for everything. Code-splitting breaks bundles into smaller chunks loaded on-demand while lazy loading defers non-critical resources until required, dramatically reducing initial bundle size.

3. **Lazy Loading**: Deferring non-critical code with dynamic imports means the browser downloads less JavaScript up front, and key metrics like First Contentful Paint improve immediately. Components with significant code or dependencies that aren't needed during initial rendering should use lazy loading.

4. **Vite Optimization**: Vite's automatic optimizations (tree-shaking, minification, Brotli compression) provide 60-70% of optimization without manual work.

**Alternatives Considered**:

- **Aggressive Code Splitting (every component)**:
  - *Pros*: Absolutely minimal initial bundle
  - *Cons*: Too many network requests creates HTTP overhead, worse overall performance due to connection overhead
  - *Rejected because*: Diminishing returns - route-level splitting is the sweet spot. There's a granularity versus performance trade-off.

- **No Code Splitting (single bundle)**:
  - *Pros*: Simpler deployment, single HTTP request
  - *Cons*: 500KB+ initial bundle, slow Time to Interactive on 3G networks, violates performance budget
  - *Rejected because*: Violates <500KB initial bundle requirement

- **Server-Side Rendering (SSR)**:
  - *Pros*: Faster First Contentful Paint, better SEO
  - *Cons*: Requires server infrastructure, breaks static hosting constraint
  - *Rejected because*: Static hosting on GitHub Pages is a hard requirement

**Implementation Notes**:

**Vite Configuration for Bundle Optimization** (`vite.config.js`):

```javascript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        passes: 2 // Multiple minification passes
      }
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor code separate from application code
          'vendor': ['@octokit/rest'],
          // Chart library loaded lazily only when needed
          'charts': ['chart.js']
        }
      }
    },
    chunkSizeWarningLimit: 500, // Warn if chunks exceed 500KB
    reportCompressedSize: true // Show gzipped sizes
  },

  // Dependency pre-bundling optimization
  optimizeDeps: {
    include: ['@octokit/rest']
  },

  plugins: [
    // Bundle size visualization
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

**Dynamic Imports for Lazy Loading**:

```javascript
// Lazy load chart component only when user requests visualization
async function showDetailedAnalysis(metricData) {
  const container = document.querySelector('#analysis-container');
  container.innerHTML = '<loading-spinner></loading-spinner>';

  try {
    // Dynamic import - ~60KB chunk loaded only when needed
    const { MetricChart } = await import('./components/MetricChart.js');

    // Render chart
    const chart = new MetricChart();
    chart.data = metricData;
    container.innerHTML = '';
    container.appendChild(chart);
  } catch (error) {
    container.innerHTML = '<p>Failed to load chart visualization</p>';
    console.error('Chart loading error:', error);
  }
}

// Export functionality - lazy loaded on button click
document.querySelector('#export-button')?.addEventListener('click', async () => {
  const { exportToCSV } = await import('./utils/export.js');
  await exportToCSV(evaluationData);
});

// Comparison view - lazy loaded (User Story 3 - P3 priority)
async function loadComparisonView() {
  const { ComparisonTable } = await import('./components/ComparisonTable.js');
  // Render comparison component
}
```

**Progressive Loading Pattern**:

```javascript
// Evaluation orchestrator with progressive loading
class EvaluationOrchestrator {
  async evaluateRepository(owner, repo) {
    // Show loading state immediately
    this.ui.showLoading();

    // Fetch categories in parallel, display as each completes
    const metricPromises = [
      this.fetchActivityMetrics(owner, repo),
      this.fetchCommunityMetrics(owner, repo),
      this.fetchMaintenanceMetrics(owner, repo),
      this.fetchDocumentationMetrics(owner, repo),
      this.fetchSecurityMetrics(owner, repo)
    ];

    // Display each category as it completes (progressive loading)
    for (const metricPromise of metricPromises) {
      metricPromise
        .then(categoryData => {
          // Display partial results immediately
          this.ui.renderCategory(categoryData);
          this.ui.updateOverallScore(); // Recalculate with available data
        })
        .catch(error => {
          this.ui.renderCategoryError(error);
        });
    }

    // Wait for all to complete
    const allResults = await Promise.allSettled(metricPromises);

    // Final score calculation with complete data
    this.ui.finalizeScore(allResults);
  }
}
```

**Resource Hints for Performance** (`index.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- DNS prefetch for GitHub API (establish DNS connection early) -->
  <link rel="dns-prefetch" href="https://api.github.com">

  <!-- Preconnect to GitHub API (DNS + TCP + TLS handshake) -->
  <link rel="preconnect" href="https://api.github.com">

  <!-- Inline critical CSS (first paint styles) -->
  <style>
    /* Critical CSS - above-the-fold styles */
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #f5f5f5;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
  </style>

  <!-- Load main CSS asynchronously (non-blocking) -->
  <link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>

  <title>Open Source Project Health Analyzer</title>
</head>
<body>
  <div id="app">
    <div class="loading">Loading...</div>
  </div>

  <!-- Load main JavaScript module -->
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Performance Budget Enforcement** (`package.json`):

```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build && open dist/stats.html",
    "perf:check": "bundlesize"
  },
  "bundlesize": [
    {
      "path": "./dist/assets/index-*.js",
      "maxSize": "300 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/vendor-*.js",
      "maxSize": "200 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "50 KB",
      "compression": "gzip"
    }
  ]
}
```

**Performance Metrics Targets** (Core Web Vitals):

| Metric | Target | Measurement | Status |
|--------|--------|-------------|--------|
| First Contentful Paint (FCP) | <1.5s | Lighthouse | ⏳ TBD |
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse | ⏳ TBD |
| Time to Interactive (TTI) | <3.0s | Lighthouse | ⏳ TBD |
| First Input Delay (FID) | <100ms | Real User Monitoring | ⏳ TBD |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse | ⏳ TBD |
| Total Blocking Time (TBT) | <200ms | Lighthouse | ⏳ TBD |
| Initial Bundle (gzip) | <300KB | Bundle analyzer | ⏳ TBD |
| Total Bundle (gzip) | <500KB | Bundle analyzer | ⏳ TBD |

**Incremental Optimization Approach**:

Run a bundle analyzer and sort by size, targeting anything above 30-50 KB that doesn't render in the first viewport. Common candidates include authenticated dashboards, admin charts, WYSIWYG editors, and marketing videos. Roll out changes incrementally - wrap a single dashboard route today and a heavy chart component tomorrow, with each step yielding measurable improvements without requiring a full rewrite.

**Sources**:
- [JavaScript Performance Optimization Best Practices for 2026](https://www.landskill.com/blog/javascript-performance-optimization/)
- [Optimize your loading sequence](https://www.patterns.dev/vanilla/loading-sequence/)
- [Improving JavaScript Bundle Performance With Code-Splitting](https://www.smashingmagazine.com/2022/02/javascript-bundle-performance-code-splitting/)
- [Code-Splitting and Lazy Loading](https://stevekinney.com/courses/react-performance/code-splitting-and-lazy-loading)
- [Lazy Loading | webpack](https://webpack.js.org/guides/lazy-loading/)

---

## 7. Accessibility Implementation

### Decision: WCAG 2.1 AA Compliance with Automated Testing

**Selected Approach**:
- **Standard**: WCAG 2.1 Level AA (required by 2026 regulations)
- **Testing**: Automated (axe-core) + manual (keyboard, screen reader)
- **Framework**: Semantic HTML + ARIA where necessary

**Rationale**:

1. **Legal Compliance**: Starting April 24, 2026, state and local governments with a population of 50,000 or more must ensure that websites and mobile applications comply with WCAG 2.1 Level AA. State- or county-run healthcare organizations must comply even sooner. This means digital content must be perceivable, operable, understandable, and robust for people with disabilities.

2. **Comprehensive Coverage**: WCAG 2.1 AA covers 50 success criteria across 4 principles (Perceivable, Operable, Understandable, Robust), providing comprehensive accessibility coverage.

3. **Automated Testing**: axe-core catches ~57% of accessibility issues automatically, significantly reducing manual testing burden. However, automated tools cannot catch all issues - manual testing with screen readers and keyboard navigation is essential.

4. **Progressive Enhancement**: Semantic HTML provides baseline accessibility that works without JavaScript, ARIA enhances where semantic HTML is insufficient.

**Alternatives Considered**:

- **WCAG 2.2 (latest version)**:
  - *Pros*: More comprehensive with 9 new success criteria, future-proof
  - *Cons*: Not yet required by regulations, tooling less mature, added complexity
  - *Rejected because*: WCAG 2.1 AA meets current legal requirements. Expect 2.1 Level AA to remain the legal standard for the next few years, but integrally planning 2.2 criteria adoption will maximize future readiness.

- **Accessibility as afterthought (retrofit later)**:
  - *Pros*: Faster initial development
  - *Cons*: Expensive to retrofit (3-5x more effort), legal risk, excludes users with disabilities
  - *Rejected because*: Baking accessibility in from start is cheaper, better for users, and legally required

**Implementation Notes**:

**WCAG 2.1 AA Key Requirements**:

**1. Perceivable** - Information and user interface components must be presentable to users:

```javascript
// Text alternatives (1.1.1) - All non-text content must have text alternative
<img
  src="health-score-chart.png"
  alt="Repository health score trend over 90 days showing improvement from 65 to 85"
>

// Proper semantic structure
<svg aria-labelledby="chart-title chart-desc" role="img">
  <title id="chart-title">Health Score Trend</title>
  <desc id="chart-desc">Line chart showing health score improving from 65 to 85 over 90 days</desc>
  <!-- chart content -->
</svg>

// Color contrast (1.4.3) - Minimum 4.5:1 for normal text, 3:1 for large text
:root {
  --text-color: #1a1a1a;        /* 16:1 contrast on white background */
  --primary-color: #0066cc;      /* 7:1 contrast on white */
  --success-color: #0a7e07;      /* 4.6:1 contrast on white */
  --error-color: #c41e3a;        /* 5.3:1 contrast on white */
  --warning-color: #9f6000;      /* 4.5:1 contrast on white */
}

// Resize text (1.4.4) - Support 200% zoom without loss of functionality
body {
  font-size: 16px;
  line-height: 1.5;
}
* {
  max-width: 100%; // Prevent horizontal scrolling
}

// Reflow (1.4.10) - Content reflows without horizontal scrolling at 320px width
@media (max-width: 320px) {
  /* Mobile-first responsive design */
}
```

**2. Operable** - User interface components and navigation must be operable:

```javascript
// Keyboard accessible (2.1.1) - All functionality available via keyboard
class MetricCard extends HTMLElement {
  connectedCallback() {
    this.tabIndex = 0; // Make focusable
    this.setAttribute('role', 'button');

    // Keyboard event handling
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleActivation();
      }
    });

    // Mouse/touch handling
    this.addEventListener('click', () => this.handleActivation());
  }

  handleActivation() {
    this.dispatchEvent(new CustomEvent('metric-selected', {
      bubbles: true,
      detail: { metricId: this.data.id }
    }));
  }
}

// Focus visible (2.4.7) - Clear focus indicators
:focus {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

// Remove outline only for mouse users
:focus:not(:focus-visible) {
  outline: none;
}

// Ensure keyboard users always see focus
:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

// Bypass blocks (2.4.1) - Skip to main content link
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>
    <nav aria-label="Main navigation">
      <!-- navigation -->
    </nav>
  </header>
  <main id="main-content">
    <!-- main content -->
  </main>
</body>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-color);
  color: white;
  padding: 8px;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
</style>

// Page titled (2.4.2) - Descriptive page titles
<title>React - Project Health Analysis | Open Source Health Analyzer</title>

// Focus order (2.4.3) - Logical tab order matches visual order
<div class="metric-card" tabindex="0">
  <h3>Commit Frequency</h3>
  <div class="score" aria-live="polite">85</div>
  <button tabindex="0">More Info</button> <!-- Natural tab order -->
</div>
```

**3. Understandable** - Information and operation must be understandable:

```javascript
// Language of page (3.1.1)
<html lang="en">

// Error identification (3.3.1) and suggestions (3.3.3)
<form>
  <label for="repo-url">
    Repository URL
    <span class="required" aria-label="required">*</span>
  </label>
  <input
    id="repo-url"
    type="url"
    required
    aria-describedby="url-error url-hint"
    aria-invalid="false"
  >
  <span id="url-hint" class="hint">
    Example: https://github.com/facebook/react
  </span>
  <span id="url-error" class="error" role="alert" hidden>
    Please enter a valid GitHub repository URL in format: https://github.com/owner/repo
  </span>
</form>

// Consistent navigation (3.2.3)
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/help">Help</a></li>
  </ul>
</nav>
```

**4. Robust** - Content must be robust enough for assistive technologies:

```javascript
// Name, Role, Value (4.1.2) - ARIA for custom components
<div
  role="progressbar"
  aria-valuenow="75"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Health score: 75 out of 100"
>
  <div class="progress-bar" style="width: 75%"></div>
</div>

// Status messages (4.1.3) - Announce dynamic updates
<div role="status" aria-live="polite" aria-atomic="true">
  Evaluation complete: Health score is 85 (Grade B+)
</div>

// Accessible names for interactive elements
<button aria-label="Close dialog">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>
```

**Screen Reader Support**:

```javascript
// Live regions for dynamic updates (avoid spamming)
class EvaluationProgress extends HTMLElement {
  updateProgress(percentage, message) {
    // Visual update
    this.querySelector('.progress-bar').style.width = `${percentage}%`;

    // Screen reader announcement (only at 25% intervals)
    if (percentage % 25 === 0) {
      const liveRegion = this.querySelector('[role="status"]');
      liveRegion.textContent = `${message} - ${percentage}% complete`;
    }
  }
}

// Screen reader only text (visually hidden but readable)
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

<span class="sr-only">Loading repository data</span>
<loading-spinner aria-hidden="true"></loading-spinner>
```

**Automated Testing with axe-core**:

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance', () => {
  test('should have no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab to skip link
    await page.keyboard.press('Tab');
    let focused = await page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#main-content');

    // Activate skip link
    await page.keyboard.press('Enter');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    focused = await page.locator(':focus');
    await expect(focused).toHaveAttribute('name', 'repository-url');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Verify no skipped heading levels
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingLevels = await headings.evaluateAll(elements =>
      elements.map(el => parseInt(el.tagName[1]))
    );

    // Check no heading level is skipped
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i-1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
});
```

**Manual Testing Checklist**:

- [ ] All interactive elements reachable via keyboard (Tab, Arrow keys)
- [ ] Tab order logical and intuitive
- [ ] Focus indicators clearly visible (3:1 contrast minimum)
- [ ] Skip to main content link functional
- [ ] Screen reader (NVDA/JAWS/VoiceOver) announces all content correctly
- [ ] Images have descriptive alt text
- [ ] Form errors announced and associated with fields via aria-describedby
- [ ] Color not sole means of conveying information
- [ ] Text resizable to 200% without breaking layout
- [ ] All text meets 4.5:1 contrast (normal) or 3:1 (large text)
- [ ] Dynamic content updates announced to screen readers via aria-live
- [ ] Modal dialogs trap focus, closable with Escape key
- [ ] No keyboard traps preventing navigation

**Sources**:
- [ADA Website Accessibility: WCAG 2.1 by 2026](https://wpvip.com/blog/ada-website-accessibility-deadline-2026/)
- [WCAG 2.1 AA: The Standard for Accessible Web Design](https://www.webability.io/blog/wcag-2-1-aa-the-standard-for-accessible-web-design)
- [WCAG 2.2 Complete Compliance Guide 2025](https://www.allaccessible.org/blog/wcag-22-complete-guide-2025)
- [WCAG Keyboard Accessible Explained](https://www.getstark.co/wcag-explained/operable/keyboard-accessible/)
- [What WCAG 2.1AA Means for Healthcare Organizations in 2026](https://pilotdigital.com/blog/what-wcag-2-1aa-means-for-healthcare-organizations-in-2026/)

---

## 8. Data Visualization Library

### Decision: Chart.js with Lazy Loading

**Selected Technology**: Chart.js 4.x (loaded lazily on-demand)

**Rationale**:

1. **Small Bundle Size**: Chart.js is lightweight (~200KB uncompressed, ~60KB gzipped) compared to heavier alternatives like ECharts (~300KB gzipped).

2. **Good Performance**: Chart.js uses HTML5 Canvas for rendering, providing 10x performance vs SVG libraries for typical datasets. The use of canvas compresses the toll on the DOM tree, minimizing code size in the bundle and resulting in faster load times.

3. **Accessibility Support**: Built-in support for ARIA labels, keyboard navigation, and alternative data table representations.

4. **Lazy Loading Strategy**: Charts are non-critical features - load only when user explicitly requests detailed visualization, keeping initial bundle small.

5. **Simple API**: Easy to use with good documentation and large community support.

**Alternatives Considered**:

- **Apache ECharts**:
  - *Pros*: Great for fast-loading charts, supports both HTML5 canvas and SVG rendering, performs well on mobiles and portable devices with small modular package, extensive chart types
  - *Cons*: Larger bundle size (~300KB gzipped), more complex API, overkill for simple visualizations
  - *Rejected because*: Chart.js is simpler and lighter for our use case

- **LightningChart JS**:
  - *Pros*: Exceptional performance (4030x faster than standard options for large datasets), WebGL GPU acceleration, specialized for high-performance scenarios
  - *Cons*: Commercial license required, massive overkill for small datasets (<1000 points), expensive
  - *Rejected because*: Our datasets are small (50-100 data points max), Chart.js performance is more than sufficient

- **Tremor**:
  - *Pros*: Ultra-lightweight, super simple, ideal for straightforward charts and internal dashboards
  - *Cons*: Very basic charting options, too limited for potential future features
  - *Rejected because*: Too limited for comprehensive data visualization needs

- **D3.js**:
  - *Pros*: Maximum flexibility, powerful for custom visualizations
  - *Cons*: Steep learning curve, large bundle (even with tree-shaking), requires manual accessibility implementation
  - *Rejected because*: Too complex for simple line/bar charts, accessibility would need custom implementation

**Implementation Notes**:

```javascript
// Lazy load Chart.js only when user requests chart view
async function showMetricTrendChart(metricData) {
  const chartContainer = document.querySelector('#trend-chart');
  chartContainer.innerHTML = '<loading-spinner></loading-spinner>';

  try {
    // Dynamic import - loads Chart.js on-demand (~60KB gzipped)
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label',
      `Trend chart showing ${metricData.name} over time from ${metricData.startDate} to ${metricData.endDate}`
    );

    chartContainer.innerHTML = '';
    chartContainer.appendChild(canvas);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: metricData.dates,
        datasets: [{
          label: metricData.name,
          data: metricData.values,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${metricData.name} Trend (90 days)`
          },
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
              label: (tooltipItem) => `Score: ${tooltipItem.formattedValue}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: metricData.unit || 'Score'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        // Accessibility
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });

    // Add accessible table fallback for screen readers
    addAccessibleDataTable(chartContainer, metricData);

  } catch (error) {
    chartContainer.innerHTML = '<p>Failed to load chart visualization. Please try again.</p>';
    console.error('Chart loading error:', error);
  }
}

// Add accessible data table for screen readers
function addAccessibleDataTable(container, metricData) {
  const tableHTML = `
    <table class="sr-only">
      <caption>${metricData.name} Trend Data</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        ${metricData.dates.map((date, i) => `
          <tr>
            <td>${date}</td>
            <td>${metricData.values[i]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  container.insertAdjacentHTML('beforeend', tableHTML);
}

// Optional: Prefetch Chart.js when user hovers over "Show Chart" button
document.querySelector('#show-chart-btn')?.addEventListener('mouseenter', () => {
  // Prefetch module (downloads but doesn't execute)
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = '/node_modules/chart.js/dist/chart.esm.js';
  document.head.appendChild(link);
}, { once: true });
```

**Performance Characteristics**:

- **Initial Load**: 0KB (not loaded until user requests chart)
- **On-Demand Load**: ~60KB gzipped (~200KB uncompressed)
- **Render Time**: <100ms for typical datasets (50-100 data points)
- **Canvas vs SVG**: Chart.js can accept internal data structure reducing need for parsing and normalization, increasing performance. Data decimation can be configured to reduce dataset size before rendering.

**Accessibility Implementation**:

- Canvas chart with ARIA labels and role="img"
- Accessible data table fallback for screen readers (visually hidden)
- Keyboard navigation support via Chart.js interaction modes
- Descriptive tooltips for all data points
- High contrast colors meeting WCAG requirements

**Sources**:
- [JavaScript Chart Libraries In 2026: Best Picks + Alternatives](https://www.luzmo.com/blog/javascript-chart-libraries)
- [6 Best JavaScript Charting Libraries for Dashboards in 2026](https://embeddable.com/blog/javascript-charting-libraries)
- [7 best JavaScript Chart Libraries (and a Faster Alternative for 2026)](https://www.luzmo.com/blog/best-javascript-chart-libraries)
- [Comparing the most popular JavaScript charting libraries](https://blog.logrocket.com/comparing-most-popular-javascript-charting-libraries/)

---

## Summary of Technology Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| **GitHub API** | REST API v3 + Octokit.js | Conditional requests (ETag), predictable rate limits, simpler for single-repo evaluation |
| **Metrics** | CHAOSS Framework + Adaptive Scoring | Industry standard, ISO-aligned, comprehensive coverage across 5 categories |
| **Caching** | localStorage TTL + LRU Eviction | 24-hour freshness requirement + quota management, best practice hybrid approach |
| **Components** | Web Components (Light DOM) | Global styling flexibility, accessibility, framework-agnostic, simpler mental model |
| **Testing** | Vitest + MSW + Playwright | Native ES modules, realistic API mocking, reliable multi-browser E2E, TDD-friendly |
| **Performance** | Route Splitting + Progressive Loading | 40-50% bundle reduction, faster perceived performance, lazy load non-critical features |
| **Accessibility** | WCAG 2.1 AA + axe-core | Legal compliance (2026 deadline), automated + manual testing, comprehensive coverage |
| **Charts** | Chart.js (lazy loaded) | Lightweight (60KB gzipped), good performance with Canvas, accessibility support, simple API |

---

## Next Steps

1. **Phase 1**: Create detailed data model (`data-model.md`) - COMPLETE
2. **Phase 1**: Define API contracts (`contracts/*.md`) - COMPLETE
3. **Phase 1**: Write user guide (`quickstart.md`) - COMPLETE
4. **Phase 2**: Generate task breakdown (`/speckit.tasks`)
5. **Implementation**: Begin TDD cycle following this research

---

## References

All research findings are based on industry standards, official documentation, and current best practices as of January 2026. Implementation should follow the patterns documented here while remaining flexible to evolving standards and browser capabilities.

**Key Industry Standards**:
- CHAOSS (Community Health Analytics in Open Source Software) - Linux Foundation
- WCAG 2.1 (Web Content Accessibility Guidelines) - W3C
- ISO Standards for Open Source Community Health Metrics (in development)
- GitHub API Documentation and Best Practices
- Modern Web Performance Standards (Core Web Vitals)
