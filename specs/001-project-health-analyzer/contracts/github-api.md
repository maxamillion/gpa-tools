# GitHub API Integration Contract

**Feature**: Open Source Project Health Analyzer
**Date**: 2026-01-16
**Version**: 2.0

## Overview

This document defines the GitHub REST API v3 endpoints used by the application, including request/response schemas, rate limiting, error handling, and authentication contracts.

**API Version**: REST API v3
**Base URL**: `https://api.github.com`
**Authentication**: Personal Access Token (PAT) via `Authorization: token {PAT}` header
**Rate Limiting**: 5000 requests/hour (authenticated), 60 requests/hour (unauthenticated)

---

## Required Endpoints

### 1. Repository Information
**Endpoint**: `GET /repos/{owner}/{repo}`

**Purpose**: Retrieve basic repository metadata and statistics

**Request**:
```http
GET /repos/{owner}/{repo}
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
User-Agent: Project-Health-Analyzer/1.0
```

**Response Schema** (200 OK):
```json
{
  "id": 123456,
  "name": "repo-name",
  "full_name": "owner/repo-name",
  "owner": {
    "login": "owner",
    "type": "Organization"
  },
  "description": "Repository description",
  "private": false,
  "html_url": "https://github.com/owner/repo",
  "created_at": "2020-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "pushed_at": "2024-01-15T00:00:00Z",
  "stargazers_count": 1500,
  "watchers_count": 1500,
  "forks_count": 250,
  "open_issues_count": 45,
  "license": {
    "key": "mit",
    "name": "MIT License",
    "spdx_id": "MIT"
  },
  "has_issues": true,
  "has_wiki": true,
  "archived": false
}
```

**Key Fields for Metrics**:
- `created_at`: Repository age calculation
- `pushed_at`: Last activity metric (FR-001)
- `stargazers_count`: Popularity indicator
- `forks_count`: Community engagement (FR-002)
- `license`: Security/governance metric (FR-008)

---

### 2. Commit History
**Endpoint**: `GET /repos/{owner}/{repo}/commits`

**Purpose**: Retrieve commit activity for maintenance and activity metrics

**Request**:
```http
GET /repos/{owner}/{repo}/commits?per_page=100&since=2025-10-16T00:00:00Z
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Query Parameters**:
- `per_page`: Results per page (max 100)
- `page`: Page number for pagination
- `since`: ISO 8601 timestamp (filter commits after this date)

**Response Schema** (200 OK):
```json
[
  {
    "sha": "abc123...",
    "commit": {
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "date": "2024-01-15T10:30:00Z"
      },
      "message": "Fix authentication bug"
    },
    "author": {
      "login": "johndoe",
      "id": 12345
    }
  }
]
```

**Usage**:
- Fetch last 90 days for commit frequency (FR-001)
- Use `commit.author.date` for activity analysis
- Use `author.login` for contributor identification (FR-006)

**Optimization**: Use `since` parameter to fetch only last 90 days: `since=<90_days_ago_ISO8601>`

---

### 3. Contributors
**Endpoint**: `GET /repos/{owner}/{repo}/contributors`

**Purpose**: Retrieve contributor statistics for community metrics

**Request**:
```http
GET /repos/{owner}/{repo}/contributors?per_page=100&anon=1
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "login": "contributor1",
    "id": 12345,
    "type": "User",
    "contributions": 247
  },
  {
    "login": "contributor2",
    "id": 67890,
    "type": "User",
    "contributions": 89
  }
]
```

**Usage**:
- Total contributors count (FR-002)
- Bus factor calculation (FR-006): Count contributors for 50% of commits
- Contributor diversity analysis

**Pagination**: May require multiple pages for repos with >100 contributors

---

### 4. Releases
**Endpoint**: `GET /repos/{owner}/{repo}/releases`

**Purpose**: Retrieve release history for maturity and maintenance metrics

**Request**:
```http
GET /repos/{owner}/{repo}/releases?per_page=10
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "id": 54321,
    "tag_name": "v1.2.0",
    "name": "Version 1.2.0",
    "published_at": "2024-01-10T00:00:00Z",
    "prerelease": false,
    "draft": false,
    "body": "Release notes..."
  }
]
```

**Usage**:
- Release count (FR-005)
- Release cadence calculation (FR-001)
- Days since last release

**N/A Handling** (FR-037): Empty array → No releases, mark release metrics as "N/A"

---

### 5. Issues
**Endpoint**: `GET /repos/{owner}/{repo}/issues`

**Purpose**: Retrieve issue statistics for maintenance and community metrics

**Request**:
```http
GET /repos/{owner}/{repo}/issues?state=all&per_page=100&page=1
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Query Parameters**:
- `state`: `open`, `closed`, or `all`
- `per_page`: Results per page (max 100)
- `since`: ISO 8601 timestamp filter
- `sort`: `created`, `updated`, `comments`
- `direction`: `asc` or `desc`

**Response Schema** (200 OK):
```json
[
  {
    "number": 42,
    "state": "open",
    "title": "Feature request",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "closed_at": null,
    "pull_request": null,
    "labels": [{"name": "bug"}],
    "comments": 5
  }
]
```

**Usage**:
- Open issues count (FR-003)
- Issue response time (FR-007)
- Stale issues percentage (FR-003)
- Average time to close (FR-003)

**Important**: Filter out pull requests by checking `pull_request === null`

---

### 6. Pull Requests
**Endpoint**: `GET /repos/{owner}/{repo}/pulls`

**Purpose**: Retrieve PR statistics for community engagement

**Request**:
```http
GET /repos/{owner}/{repo}/pulls?state=all&per_page=100&page=1
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "number": 15,
    "state": "open",
    "title": "Add authentication feature",
    "created_at": "2024-01-10T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "closed_at": null,
    "merged_at": null,
    "user": {
      "login": "contributor1"
    }
  }
]
```

**Usage**:
- PR merge rate (FR-002)
- Average PR merge time (FR-007)
- Open PR count

**Metrics**: `merged_at !== null` indicates merged PR

---

### 7. README
**Endpoint**: `GET /repos/{owner}/{repo}/readme`

**Purpose**: Check documentation presence and quality

**Request**:
```http
GET /repos/{owner}/{repo}/readme
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
{
  "name": "README.md",
  "path": "README.md",
  "size": 5234,
  "content": "IyBQcm9qZWN0...",
  "encoding": "base64",
  "download_url": "https://raw.githubusercontent.com/..."
}
```

**Usage**:
- README presence (FR-004)
- README size/quality indicator
- Decode base64 `content` for quality analysis

**N/A Handling** (FR-037): 404 response → No README, mark documentation metrics as degraded

---

### 8. Community Profile
**Endpoint**: `GET /repos/{owner}/{repo}/community/profile`

**Purpose**: Retrieve community health files presence

**Request**:
```http
GET /repos/{owner}/{repo}/community/profile
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
{
  "health_percentage": 85,
  "description": "Repository description",
  "documentation": "https://example.com/docs",
  "files": {
    "code_of_conduct": {
      "name": "CODE_OF_CONDUCT.md",
      "key": "code-of-conduct",
      "html_url": "https://github.com/..."
    },
    "contributing": {
      "name": "CONTRIBUTING.md",
      "key": "contributing",
      "html_url": "https://github.com/..."
    },
    "license": {
      "name": "LICENSE",
      "key": "mit",
      "html_url": "https://github.com/..."
    },
    "readme": {
      "name": "README.md",
      "key": "readme",
      "html_url": "https://github.com/..."
    }
  },
  "updated_at": "2024-01-15T00:00:00Z"
}
```

**Usage**:
- Security policy presence (FR-008): Check `files.security`
- Code of Conduct (FR-004)
- Contributing guidelines (FR-004)
- License (FR-008)
- GitHub health score: `health_percentage`

**N/A Handling** (FR-037): Missing files → Individual metrics marked "N/A"

---

## Rate Limiting

### Rate Limit Headers
All responses include:

```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1699999999
X-RateLimit-Used: 1
```

**Key Headers**:
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Rate Limit Handling (FR-034)

**Exponential Backoff Algorithm**:

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  const backoffDelays = [1000, 2000, 4000, 8000, 16000, 32000, 60000];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    // Check rate limit
    if (response.status === 403 || response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const remaining = response.headers.get('X-RateLimit-Remaining');

      if (remaining === '0') {
        // Primary rate limit - wait until reset
        const waitTime = (resetTime * 1000) - Date.now();
        displayRateLimitMessage(`Rate limit exceeded. Waiting ${Math.ceil(waitTime/1000)}s...`);
        await sleep(waitTime + 1000); // +1s buffer
        continue;
      }

      // Secondary rate limit - exponential backoff
      const backoffTime = backoffDelays[Math.min(attempt, backoffDelays.length - 1)];
      displayRateLimitMessage(`Retrying in ${backoffTime/1000}s...`);
      await sleep(backoffTime);
      continue;
    }

    return response;
  }

  throw new Error('Max retries exceeded');
}
```

**Strategy** (FR-034):
1. **Primary Rate Limit**: Wait until reset time
2. **Secondary Rate Limit**: Exponential backoff (1s → 2s → 4s → 8s → 16s → 32s → 60s max)
3. **Max Retries**: 3 attempts
4. **User Notification**: Display progress indicator with time remaining

### Rate Limit Warning (FR-029)
Before evaluation:
```javascript
async function checkRateLimit() {
  const response = await fetch('https://api.github.com/rate_limit');
  const data = await response.json();
  const remaining = data.rate.remaining;

  if (remaining < 10) {
    displayWarning(`Low API quota: ${remaining} requests remaining. Consider adding a GitHub token.`);
  }
}
```

---

## Error Responses

### 404 Not Found (FR-036)
**Scenario**: Repository doesn't exist or is private (no access)

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/reference/repos#get-a-repository"
}
```

**Handling** (FR-036):
- Display: "This repository is private or does not exist. Only public repositories are supported."
- Stop evaluation immediately
- Clear any cached data

---

### 403 Forbidden
**Scenarios**:
1. **Rate limit exceeded** (FR-034)
2. **Private repository without authentication** (FR-036)
3. **Insufficient token permissions**

```json
{
  "message": "API rate limit exceeded for xxx.xxx.xxx.xxx.",
  "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"
}
```

**Handling**:
- **Rate Limit**: Apply exponential backoff (see above)
- **Private Repo** (FR-036): Display authentication error
- **Permissions**: Display required scopes message

---

### 401 Unauthorized
**Scenario**: Invalid or expired personal access token

```json
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
```

**Handling**:
- Clear stored token from localStorage
- Prompt user to re-authenticate
- Display: "Authentication failed. Please provide a valid GitHub token."

---

## Authentication

### Personal Access Token (PAT)

**Required Scopes** (FR-027):
- `public_repo`: Access public repository data
- `repo` (optional): Access private repositories (not supported in v1.0 per FR-036)

**Token Storage** (FR-032):
- Store in localStorage: `github_token`
- Never log or transmit token
- Clear on logout or 401 errors

**Token Usage**:
```http
Authorization: token ghp_xxxxxxxxxxxxxxxxxxxx
```

**Unauthenticated Requests**:
- Supported for public repos
- Rate limit: 60 requests/hour
- Recommendation: Always encourage token authentication (FR-029)

---

## Caching Strategy

### LocalStorage Cache (FR-028, FR-035)

**Cache Key Format**:
```
eval:{owner}:{repo}
```

**Cache Entry Schema**:
```json
{
  "data": {
    "repo": {...},
    "contributors": [...],
    "commits": [...],
    "releases": [...],
    "issues": [...],
    "pulls": [...],
    "community": {...},
    "readme": "..."
  },
  "timestamp": 1705316400000,
  "ttl": 86400000,
  "version": "1.0"
}
```

**TTL (Time-To-Live)**: 24 hours (86400000 ms) per FR-028

**Cache Validation** (FR-035):
```javascript
function getCachedData(owner, repo) {
  const key = `eval:${owner}:${repo}`;
  const cached = localStorage.getItem(key);

  if (!cached) return null;

  const { data, timestamp, ttl } = JSON.parse(cached);
  const age = Date.now() - timestamp;

  if (age > ttl) {
    localStorage.removeItem(key); // Clear stale cache
    return null;
  }

  return { data, age }; // Return data with age for display
}
```

**Cache Age Display** (FR-035):
```javascript
// Show cache age in UI
const { data, age } = getCachedData(owner, repo);
if (data) {
  const minutes = Math.floor(age / 60000);
  displayCacheAge(`Cached data from ${minutes} minutes ago`);
}
```

---

## N/A Data Handling (FR-037)

**Missing Data Scenarios**:

| Missing Data | Detection | Display | Score Impact |
|--------------|-----------|---------|--------------|
| No releases | `releases.length === 0` | "N/A - No releases found" | Exclude from maintenance category |
| No contributors | `contributors.length === 0` | "N/A - No contributors" | Exclude from community category |
| No README | 404 on `/readme` | "N/A - No README found" | Degrade documentation score |
| No license | `repo.license === null` | "N/A - No license detected" | Impact security score |
| No community files | Missing in `/community/profile` | "N/A - File not present" | Individual file metrics |

**Score Adjustment**:
```javascript
function calculateCategoryScore(metrics) {
  // Filter out N/A metrics
  const validMetrics = metrics.filter(m => m.value !== 'N/A');

  if (validMetrics.length === 0) {
    return { score: 0, note: 'Insufficient data' };
  }

  // Calculate average excluding N/A
  const avgScore = validMetrics.reduce((sum, m) => sum + m.score, 0) / validMetrics.length;
  return { score: avgScore, excludedCount: metrics.length - validMetrics.length };
}
```

---

## Request Best Practices

### Required Headers (FR-024)
```http
Authorization: token {PAT}
Accept: application/vnd.github.v3+json
User-Agent: Project-Health-Analyzer/1.0
```

### Pagination
```javascript
async function fetchAllPages(endpoint, params = {}) {
  const results = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${endpoint}?${new URLSearchParams({...params, page, per_page: 100})}`;
    const response = await fetchWithRetry(url);
    const data = await response.json();

    results.push(...data);
    hasMore = data.length === 100;
    page++;

    // Safety limit for very large repos
    if (page > 50) break; // Max 5000 items
  }

  return results;
}
```

---

## API Call Budget

**Per Repository Evaluation**:

| Endpoint | Calls | Notes |
|----------|-------|-------|
| `/repos/{owner}/{repo}` | 1 | Basic info |
| `/repos/{owner}/{repo}/contributors` | 1-5 | Paginated (100 per page) |
| `/repos/{owner}/{repo}/commits` | 2-5 | Last 90 days, paginated |
| `/repos/{owner}/{repo}/releases` | 1 | Last 10 releases |
| `/repos/{owner}/{repo}/issues` | 2-10 | Open + closed, paginated |
| `/repos/{owner}/{repo}/pulls` | 2-10 | Open + closed, paginated |
| `/repos/{owner}/{repo}/community/profile` | 1 | Community health |
| `/repos/{owner}/{repo}/readme` | 1 | README content |
| **Total** | **11-33 calls** | Average ~20 calls |

**Optimization**:
- Use `since` parameter for commits (last 90 days only)
- Cache aggressively (24-hour TTL per FR-028)
- Warn when quota < 100 remaining (FR-029)

---

## Implementation Checklist

- [ ] Implement `fetchWithRetry()` with exponential backoff (FR-034)
- [ ] Add rate limit monitoring in UI (FR-029)
- [ ] Cache all API responses with 24-hour TTL (FR-028)
- [ ] Display cache age indicators (FR-035)
- [ ] Handle 404/403 errors per FR-036
- [ ] Implement N/A data handling per FR-037
- [ ] Validate repository URLs before API calls
- [ ] Implement token authentication flow (FR-027)
- [ ] Add error boundaries for API failures
- [ ] Display user-friendly error messages (FR-023)
- [ ] Test with public repositories
- [ ] Test rate limit handling (intentionally exceed)
- [ ] Test private repository error handling (FR-036)
- [ ] Test incomplete data scenarios (FR-037)
