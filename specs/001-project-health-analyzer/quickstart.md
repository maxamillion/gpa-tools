# Developer Quickstart: Open Source Project Health Analyzer

**Feature**: Open Source Project Health Analyzer
**Branch**: 001-project-health-analyzer
**Date**: 2026-01-15

## Welcome!

This guide will get you up and running with the Project Health Analyzer codebase in under 15 minutes.

---

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **GitHub Account**: Optional, but recommended for higher API rate limits

---

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/gpa-tools.git
cd gpa-tools

# Checkout the feature branch
git checkout 001-project-health-analyzer

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
# Start Vite dev server with hot module replacement
npm run dev

# Server will start at http://localhost:5173
# App will automatically reload on file changes
```

### 3. Run Tests

```bash
# Run unit tests (Vitest)
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests in UI mode (interactive debugging)
npm run test:e2e:ui
```

### 4. Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure Overview

```
src/
├── components/          # UI components (Web Components)
│   ├── MetricDisplay.js       # Individual metric card
│   ├── CustomCriteriaForm.js  # Add/edit custom criteria
│   ├── ComparisonView.js      # Side-by-side comparison
│   └── HelpTooltip.js         # Educational tooltips
│
├── services/           # Business logic and API interactions
│   ├── githubApi.js          # GitHub API client
│   ├── metricCalculator.js   # Metric calculation logic
│   ├── criteriaEvaluator.js  # Custom criteria evaluation
│   └── cacheManager.js       # localStorage caching
│
├── models/             # Data structures and entities
│   ├── Repository.js         # Repository entity
│   ├── Metric.js            # Metric entity
│   ├── CustomCriterion.js   # Custom criterion entity
│   └── EvaluationProfile.js # Evaluation profile entity
│
├── utils/              # Utility functions
│   ├── urlParams.js         # URL parameter handling
│   ├── scoring.js           # Scoring algorithms
│   └── formatters.js        # Data formatting helpers
│
├── config/             # Configuration and constants
│   ├── metricDefinitions.js # Baseline metric definitions
│   └── thresholds.js        # Scoring thresholds
│
├── styles/             # CSS files
│   ├── main.css            # Global styles
│   └── components.css      # Component styles
│
├── index.html          # Entry point
└── main.js             # Application initialization

tests/
├── unit/               # Unit tests (Vitest)
├── integration/        # Integration tests (Vitest + MSW)
└── e2e/                # End-to-end tests (Playwright)

docs/
├── architecture.md     # System architecture
├── metrics-guide.md    # Metric explanations
└── adr/                # Architecture Decision Records
```

---

## Development Workflow

### Test-Driven Development (TDD)

This project follows strict TDD. **Always write tests before implementation.**

#### Example TDD Workflow:

```bash
# 1. Write a failing test
# tests/unit/metricCalculator.test.js

import { describe, it, expect } from 'vitest';
import { calculateCommitFrequency } from '../../src/services/metricCalculator.js';

describe('calculateCommitFrequency', () => {
  it('calculates commits per week for last 90 days', () => {
    const commits = [
      { commit: { author: { date: '2026-01-01T00:00:00Z' } } },
      { commit: { author: { date: '2026-01-08T00:00:00Z' } } },
      // ... more commits
    ];

    const result = calculateCommitFrequency(commits);

    expect(result).toBe(2.0); // 2 commits per week
  });
});

# 2. Run test - it should FAIL
npm test

# 3. Implement the function
# src/services/metricCalculator.js

export function calculateCommitFrequency(commits) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentCommits = commits.filter(c =>
    new Date(c.commit.author.date) >= ninetyDaysAgo
  );

  const weeks = 90 / 7;
  return recentCommits.length / weeks;
}

# 4. Run test - it should PASS
npm test

# 5. Refactor if needed (tests still passing)
```

### Code Quality Checks

```bash
# Lint code (ESLint)
npm run lint

# Format code (Prettier)
npm run format

# Type check (if using TypeScript)
npm run typecheck

# Run all quality checks
npm run check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b fix/metric-calculation-bug

# Make changes following TDD
# 1. Write test
# 2. See it fail
# 3. Implement
# 4. See it pass
# 5. Refactor

# Commit using Conventional Commits format
git add .
git commit -m "fix: correct commit frequency calculation for edge cases"

# Push and create pull request
git push origin fix/metric-calculation-bug
```

---

## Key Concepts

### 1. Web Components

UI components use native Web Components (Custom Elements):

```javascript
// Example: Creating a metric card component
class MetricCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute('name');
    const score = this.getAttribute('score');
    const grade = this.getAttribute('grade');

    this.shadowRoot.innerHTML = `
      <style>
        .metric-card {
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 8px;
        }
        .score { font-size: 2rem; font-weight: bold; }
      </style>
      <div class="metric-card">
        <h3>${name}</h3>
        <div class="score">${score}</div>
        <div class="grade">${grade}</div>
      </div>
    `;
  }
}

customElements.define('metric-card', MetricCard);
```

Usage:
```html
<metric-card name="Commit Frequency" score="85" grade="Good"></metric-card>
```

### 2. GitHub API Integration

```javascript
// Example: Fetching repository data
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: userToken // Optional, increases rate limit
});

async function fetchRepositoryData(owner, name) {
  try {
    const { data: repo } = await octokit.repos.get({ owner, repo: name });
    const { data: contributors } = await octokit.repos.listContributors({ owner, repo: name });
    const { data: commits } = await octokit.repos.listCommits({ owner, repo: name, per_page: 100 });

    return { repo, contributors, commits };
  } catch (error) {
    if (error.status === 404) {
      throw new Error('Repository not found');
    }
    if (error.status === 403) {
      throw new Error('Rate limit exceeded');
    }
    throw error;
  }
}
```

### 3. Caching Strategy

```javascript
// Example: localStorage caching
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheData(key, data) {
  const cacheEntry = {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
}

function getCachedData(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp, ttl } = JSON.parse(cached);
  const isExpired = Date.now() - timestamp > ttl;

  return isExpired ? null : data;
}
```

### 4. Metric Calculation

```javascript
// Example: Calculating and scoring a metric
import { scoreCommitFrequency } from '../utils/scoring.js';

function calculateCommitFrequencyMetric(commits) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentCommits = commits.filter(c =>
    new Date(c.commit.author.date) >= ninetyDaysAgo
  );

  const weeks = 90 / 7;
  const value = recentCommits.length / weeks;
  const { score, grade } = scoreCommitFrequency(value);

  return {
    id: 'commit-frequency',
    name: 'Commit Frequency',
    category: 'activity',
    value,
    score,
    grade,
    explanation: 'Average commits per week over the last 90 days',
    whyItMatters: 'High commit frequency indicates active development',
    dataSource: 'GitHub API: /repos/{owner}/{repo}/commits',
    calculatedAt: new Date(),
    confidence: 'high'
  };
}
```

---

## Common Tasks

### Adding a New Metric

1. **Define metric in config**:
```javascript
// src/config/metricDefinitions.js
export const metricDefinitions = {
  // ... existing metrics
  newMetric: {
    id: 'new-metric',
    name: 'New Metric',
    category: 'activity',
    explanation: '...',
    whyItMatters: '...'
  }
};
```

2. **Write tests**:
```javascript
// tests/unit/metricCalculator.test.js
describe('calculateNewMetric', () => {
  it('calculates new metric correctly', () => {
    // Test implementation
  });
});
```

3. **Implement calculation**:
```javascript
// src/services/metricCalculator.js
export function calculateNewMetric(data) {
  // Implementation
}
```

4. **Add scoring logic**:
```javascript
// src/utils/scoring.js
export function scoreNewMetric(value) {
  // Scoring logic
}
```

### Adding a Custom Criterion Evaluator

1. **Write test**:
```javascript
// tests/unit/criteriaEvaluator.test.js
describe('evaluateTypeScriptUsage', () => {
  it('detects TypeScript in package.json', () => {
    // Test implementation
  });
});
```

2. **Implement evaluator**:
```javascript
// src/services/criteriaEvaluator.js
export function evaluateTypeScriptUsage(repo, packageJson) {
  const hasTypeScript =
    repo.language === 'TypeScript' ||
    (packageJson?.dependencies?.typescript) ||
    (packageJson?.devDependencies?.typescript);

  return {
    result: hasTypeScript ? 'pass' : 'fail',
    resultValue: hasTypeScript,
    confidence: 'definite',
    supportingEvidence: hasTypeScript
      ? 'Found TypeScript in repository or dependencies'
      : 'No TypeScript detected'
  };
}
```

### Debugging

```bash
# Debug tests
npm run test:watch

# Debug in browser DevTools
# Add debugger; statement in code
# Run dev server: npm run dev
# Open browser DevTools and interact with app

# Debug E2E tests
npm run test:e2e:ui
# Opens Playwright UI for interactive debugging
```

---

## Configuration

### Environment Variables

Create `.env` file (not committed to git):

```env
# GitHub Personal Access Token (optional)
VITE_GITHUB_TOKEN=ghp_your_token_here

# API Base URL (default: https://api.github.com)
VITE_API_BASE_URL=https://api.github.com

# Cache TTL in milliseconds (default: 1 hour)
VITE_CACHE_TTL=3600000
```

### Vite Configuration

See `vite.config.js` for build configuration:
- Bundle size limits
- Code splitting
- Performance budgets
- Plugin configuration

---

## Troubleshooting

### GitHub API Rate Limit

**Problem**: Getting 403 errors from GitHub API

**Solution**:
1. Add personal access token in `.env` file
2. Clear cache: `localStorage.clear()`
3. Wait for rate limit to reset (check headers)

### Build Errors

**Problem**: Build fails with module not found

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Test Failures

**Problem**: Tests failing after changes

**Solution**:
```bash
# Run tests in watch mode to see specific failures
npm run test:watch

# Check if mocks need updating
# tests/__mocks__/github-api.js
```

---

## Resources

### Documentation
- [Architecture Overview](../docs/architecture.md)
- [Metrics Guide](../docs/metrics-guide.md)
- [ADRs](../docs/adr/)

### Specifications
- [Feature Spec](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)

### External Resources
- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Vite Docs](https://vitejs.dev/)

---

## Getting Help

1. **Check Documentation**: Start with this guide and linked docs
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask Questions**: Open a discussion on GitHub
4. **Code Review**: Submit a draft PR for early feedback

---

## Next Steps

1. ✅ **Read the Spec**: Understand requirements in [spec.md](./spec.md)
2. ✅ **Explore Code**: Browse `src/` directory and understand structure
3. ✅ **Run Tests**: Get familiar with test suite and TDD workflow
4. ✅ **Make a Change**: Pick a small task and practice TDD
5. ✅ **Submit PR**: Get your first contribution reviewed

**Welcome to the team! Happy coding! 🚀**
