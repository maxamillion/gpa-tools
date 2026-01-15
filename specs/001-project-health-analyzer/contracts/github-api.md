# GitHub API Contracts

**Feature**: Open Source Project Health Analyzer
**Date**: 2026-01-15

## Overview

This document defines the GitHub REST API v3 endpoints used by the application, including request/response schemas, rate limiting, and error handling contracts.

---

## Base Configuration

**Base URL**: `https://api.github.com`
**API Version**: `v3` (via Accept header: `application/vnd.github.v3+json`)
**Authentication**: Optional personal access token via `Authorization: Bearer {token}` header
**Rate Limits**:
- Unauthenticated: 60 requests/hour
- Authenticated: 5000 requests/hour

---

## API Endpoints

### 1. Get Repository

**Endpoint**: `GET /repos/{owner}/{repo}`

**Purpose**: Fetch basic repository information and statistics

**Request**:
```http
GET /repos/facebook/react HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
Authorization: Bearer {token} (optional)
```

**Response Schema** (200 OK):
```json
{
  "id": 10270250,
  "node_id": "MDEwOlJlcG9zaXRvcnkxMDI3MDI1MA==",
  "name": "react",
  "full_name": "facebook/react",
  "owner": {
    "login": "facebook",
    "id": 69631,
    "type": "Organization"
  },
  "private": false,
  "html_url": "https://github.com/facebook/react",
  "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
  "fork": false,
  "created_at": "2013-05-24T16:15:54Z",
  "updated_at": "2026-01-15T10:00:00Z",
  "pushed_at": "2026-01-15T09:45:00Z",
  "size": 215000,
  "stargazers_count": 200000,
  "watchers_count": 200000,
  "language": "JavaScript",
  "forks_count": 42000,
  "open_issues_count": 800,
  "default_branch": "main",
  "archived": false,
  "disabled": false,
  "license": {
    "key": "mit",
    "name": "MIT License",
    "spdx_id": "MIT"
  }
}
```

**Error Responses**:
- `404 Not Found`: Repository doesn't exist or is private
- `403 Forbidden`: Rate limit exceeded or blocked
- `301 Moved Permanently`: Repository was renamed/moved

---

### 2. List Contributors

**Endpoint**: `GET /repos/{owner}/{repo}/contributors`

**Purpose**: Get list of repository contributors with contribution counts

**Request Parameters**:
- `per_page`: Number of results per page (max 100)
- `page`: Page number for pagination
- `anon`: Include anonymous contributors (default: false)

**Request**:
```http
GET /repos/facebook/react/contributors?per_page=100&page=1 HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "login": "gaearon",
    "id": 810438,
    "type": "User",
    "contributions": 1500
  },
  {
    "login": "sophiebits",
    "id": 6820,
    "type": "User",
    "contributions": 1200
  }
]
```

**Pagination**:
- Link header contains `rel="next"`, `rel="prev"`, `rel="first"`, `rel="last"`
- Total count not provided, must paginate to end

---

### 3. List Commits

**Endpoint**: `GET /repos/{owner}/{repo}/commits`

**Purpose**: Get repository commit history

**Request Parameters**:
- `per_page`: Results per page (max 100)
- `page`: Page number
- `since`: ISO 8601 timestamp - only commits after this date
- `until`: ISO 8601 timestamp - only commits before this date

**Request**:
```http
GET /repos/facebook/react/commits?per_page=100&since=2025-10-15T00:00:00Z HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "sha": "abc123...",
    "commit": {
      "author": {
        "name": "Dan Abramov",
        "email": "dan@example.com",
        "date": "2026-01-15T09:00:00Z"
      },
      "message": "Fix bug in hooks"
    },
    "author": {
      "login": "gaearon",
      "id": 810438
    }
  }
]
```

---

### 4. List Releases

**Endpoint**: `GET /repos/{owner}/{repo}/releases`

**Purpose**: Get repository releases

**Request Parameters**:
- `per_page`: Results per page (max 100)
- `page`: Page number

**Request**:
```http
GET /repos/facebook/react/releases?per_page=10 HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "id": 12345,
    "tag_name": "v18.2.0",
    "name": "React 18.2.0",
    "created_at": "2026-01-01T00:00:00Z",
    "published_at": "2026-01-01T10:00:00Z",
    "draft": false,
    "prerelease": false
  }
]
```

---

### 5. List Issues

**Endpoint**: `GET /repos/{owner}/{repo}/issues`

**Purpose**: Get repository issues (includes pull requests)

**Request Parameters**:
- `state`: `open`, `closed`, or `all` (default: open)
- `per_page`: Results per page (max 100)
- `page`: Page number
- `since`: ISO 8601 timestamp
- `sort`: `created`, `updated`, `comments` (default: created)
- `direction`: `asc` or `desc` (default: desc)

**Request**:
```http
GET /repos/facebook/react/issues?state=all&per_page=100 HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "id": 123456,
    "number": 1000,
    "title": "Bug: Component not rendering",
    "state": "open",
    "created_at": "2026-01-10T00:00:00Z",
    "updated_at": "2026-01-15T09:00:00Z",
    "closed_at": null,
    "pull_request": null,
    "comments": 5
  }
]
```

**Note**: Response includes pull requests. Filter by checking `pull_request` field.

---

### 6. List Pull Requests

**Endpoint**: `GET /repos/{owner}/{repo}/pulls`

**Purpose**: Get repository pull requests

**Request Parameters**:
- `state`: `open`, `closed`, or `all` (default: open)
- `per_page`: Results per page (max 100)
- `page`: Page number
- `sort`: `created`, `updated`, `popularity` (default: created)
- `direction`: `asc` or `desc` (default: desc)

**Request**:
```http
GET /repos/facebook/react/pulls?state=all&per_page=100 HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
[
  {
    "id": 654321,
    "number": 500,
    "title": "Add new feature",
    "state": "closed",
    "created_at": "2026-01-05T00:00:00Z",
    "updated_at": "2026-01-10T00:00:00Z",
    "closed_at": "2026-01-10T00:00:00Z",
    "merged_at": "2026-01-10T00:00:00Z",
    "merged": true
  }
]
```

---

### 7. Get Community Profile

**Endpoint**: `GET /repos/{owner}/{repo}/community/profile`

**Purpose**: Get community health files (CODE_OF_CONDUCT, CONTRIBUTING, etc.)

**Request**:
```http
GET /repos/facebook/react/community/profile HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
{
  "health_percentage": 100,
  "description": "A declarative, efficient, and flexible JavaScript library...",
  "documentation": "https://reactjs.org/docs",
  "files": {
    "code_of_conduct": {
      "name": "CODE_OF_CONDUCT.md",
      "key": "code_of_conduct",
      "html_url": "https://github.com/facebook/react/blob/main/CODE_OF_CONDUCT.md"
    },
    "contributing": {
      "name": "CONTRIBUTING.md",
      "key": "contributing",
      "html_url": "https://github.com/facebook/react/blob/main/CONTRIBUTING.md"
    },
    "license": {
      "name": "LICENSE",
      "key": "mit",
      "html_url": "https://github.com/facebook/react/blob/main/LICENSE"
    },
    "readme": {
      "name": "README.md",
      "html_url": "https://github.com/facebook/react/blob/main/README.md"
    }
  }
}
```

---

### 8. Get README

**Endpoint**: `GET /repos/{owner}/{repo}/readme`

**Purpose**: Get repository README content

**Request**:
```http
GET /repos/facebook/react/readme HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3.raw (for raw content)
```

**Response Schema** (200 OK - raw content):
```
# React

A JavaScript library for building user interfaces.

## Installation
...
```

---

### 9. Get Repository Contents

**Endpoint**: `GET /repos/{owner}/{repo}/contents/{path}`

**Purpose**: Check for specific files (SECURITY.md, docs/, etc.)

**Request**:
```http
GET /repos/facebook/react/contents/SECURITY.md HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
```

**Response Schema** (200 OK):
```json
{
  "name": "SECURITY.md",
  "path": "SECURITY.md",
  "type": "file",
  "size": 1024,
  "download_url": "https://raw.githubusercontent.com/facebook/react/main/SECURITY.md"
}
```

**Error Responses**:
- `404 Not Found`: File doesn't exist

---

### 10. Check Rate Limit

**Endpoint**: `GET /rate_limit`

**Purpose**: Check current rate limit status

**Request**:
```http
GET /rate_limit HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
Authorization: Bearer {token} (optional)
```

**Response Schema** (200 OK):
```json
{
  "resources": {
    "core": {
      "limit": 5000,
      "remaining": 4999,
      "reset": 1640000000,
      "used": 1
    }
  },
  "rate": {
    "limit": 5000,
    "remaining": 4999,
    "reset": 1640000000,
    "used": 1
  }
}
```

---

## Error Handling Contract

### HTTP Status Codes:
- `200 OK`: Success
- `301 Moved Permanently`: Resource moved (follow Location header)
- `304 Not Modified`: Cached response valid (use If-None-Match with ETag)
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Bad credentials
- `403 Forbidden`: Rate limit exceeded, resource forbidden, or blocked
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: GitHub server error
- `503 Service Unavailable`: GitHub temporarily unavailable

### Rate Limiting:
**Headers** (on every response):
- `X-RateLimit-Limit`: Max requests per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `X-RateLimit-Used`: Requests used in current window

**429 Too Many Requests Response**:
```json
{
  "message": "API rate limit exceeded for user ID 123.",
  "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"
}
```

**Retry Strategy**:
1. Check `X-RateLimit-Remaining` header
2. If 0, wait until `X-RateLimit-Reset` timestamp
3. If 429 response, use exponential backoff: wait `2^attempt` seconds (max 60s)
4. Show user-friendly message: "GitHub API rate limit reached. Please wait X minutes or add authentication token."

### Error Response Schema:
```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/reference/repos#get-a-repository"
}
```

---

## Caching Strategy

### ETag Support:
```http
// First request
GET /repos/facebook/react HTTP/1.1
Host: api.github.com

// Response includes ETag
200 OK
ETag: "abc123..."

// Subsequent request with If-None-Match
GET /repos/facebook/react HTTP/1.1
Host: api.github.com
If-None-Match: "abc123..."

// 304 Not Modified if unchanged (no quota used!)
304 Not Modified
```

### Cache Headers:
- Store `ETag` from response
- Use `If-None-Match` on subsequent requests
- 304 responses don't count against rate limit

---

## API Call Budget (Per Evaluation)

For a single repository evaluation, estimated API calls:

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
| `/repos/{owner}/{repo}/contents/*` | 2-5 | Check for SECURITY.md, docs/ |
| **Total** | **13-38 calls** | Average ~25 calls |

**Rate Limit Strategy**:
- Cache aggressively (1 hour TTL for dynamic data, 24 hours for stable data)
- Batch evaluations to stay under quota
- Warn user when quota < 100 remaining
- Require token for power users (comparing many repos)

---

## Contract Tests

### Test Cases:

1. **Repository Exists**: `/repos/facebook/react` returns 200 with valid schema
2. **Repository Not Found**: `/repos/invalid/repo` returns 404
3. **Rate Limit Check**: `/rate_limit` returns valid quota information
4. **Pagination**: Contributors endpoint returns Link header with pagination
5. **Authentication**: Token in Authorization header increases rate limit to 5000
6. **Error Handling**: 404 returns valid error schema
7. **ETag Caching**: If-None-Match header returns 304 when unchanged

### Schema Validation:
- Use JSON Schema to validate all API responses
- Fail if response schema doesn't match contract
- Log warnings for unexpected fields (API changes)

---

## Summary

This contract defines:
- ✅ 10 GitHub API endpoints with complete request/response schemas
- ✅ Rate limiting strategy (60 unauthenticated, 5000 authenticated)
- ✅ Error handling for all HTTP status codes
- ✅ Caching strategy using ETags
- ✅ API call budget estimation (13-38 calls per evaluation)
- ✅ Contract test cases for validation
