# Implementation Plan: Open Source Project Health Analyzer

**Branch**: `001-project-health-analyzer` | **Date**: 2026-01-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-project-health-analyzer/spec.md`

## Summary

A static single-page web application for evaluating open source project health metrics that combines industry-standard baseline metrics (activity, community, maintenance, documentation, security) with user-customizable evaluation criteria. The application must be hostable on GitHub Pages, require zero server-side dependencies, and provide comprehensive health reports with educational context for users of all experience levels.

**Technical Approach**: Client-side JavaScript application using modern web standards, GitHub REST API for data fetching, browser localStorage for persistence, and URL parameters for sharing. Optimized bundle size and caching strategy to meet 3-second TTI requirement.

## Technical Context

**Language/Version**: JavaScript ES2022+ (modern browser support), HTML5, CSS3
**Primary Dependencies**: GitHub REST API (Octokit.js or native fetch), Chart.js or similar for visualizations, No backend framework required (static SPA)
**Storage**: Browser localStorage for user preferences and custom criteria, URL parameters for sharing evaluations, No server-side database
**Testing**: Vitest for unit tests, Playwright for E2E tests, JSDoc for type hints (or TypeScript for enhanced type safety)
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), GitHub Pages static hosting
**Project Type**: Single-page web application (frontend only, no backend)
**Performance Goals**: < 3 second TTI on 10 Mbps, < 500KB initial bundle gzipped, < 10 second evaluation completion, 60 FPS UI interactions
**Constraints**: Zero server-side processing, GitHub API rate limits (60 req/hr unauthenticated, 5000 req/hr authenticated), Must work offline after initial load with cached data
**Scale/Scope**: Single-user client-side application, Handles repositories with 10-10,000 contributors, Supports comparison of up to 5 projects simultaneously

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-Driven Development (TDD)
- ✅ **PASS**: All features will be developed using TDD workflow
- **Plan**: Write unit tests for metric calculation functions before implementation
- **Plan**: Write integration tests for GitHub API interactions before implementation
- **Plan**: Write E2E tests for user workflows (URL input → health report display) before implementation
- **Verification**: Test coverage reports required, ≥ 80% for business logic

### II. Code Quality Standards
- ✅ **PASS**: Will enforce with ESLint, Prettier, and automated checks
- **Plan**: Maximum complexity 10 per function (enforce with ESLint complexity rule)
- **Plan**: Maximum 50 lines per function, 500 lines per file (enforce with ESLint)
- **Plan**: Zero linting errors tolerance, JSDoc/TypeScript for type safety
- **Plan**: Code review required before merge

### III. User Experience Consistency
- ✅ **PASS**: WCAG 2.1 AA compliance required per spec
- **Plan**: Semantic HTML with ARIA labels for all interactive elements
- **Plan**: Keyboard navigation for all features (tab order, enter/space activation)
- **Plan**: Screen reader testing with NVDA/VoiceOver
- **Plan**: Loading states for operations > 200ms (FR-023)
- **Plan**: Mobile-first responsive design (FR-026)
- **Plan**: Clear error messages with actionable guidance (FR-023)

### IV. Performance Requirements
- ✅ **PASS**: Performance budgets align with spec requirements
- **Plan**: Initial bundle < 500KB gzipped (FR-026, constitution requirement)
- **Plan**: TTI < 3 seconds on 3G networks (FR-026, constitution requirement)
- **Plan**: Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Plan**: Code splitting for comparison and advanced features
- **Plan**: Lazy loading for non-critical components
- **Plan**: Caching strategy using localStorage and service worker (FR-028)
- **Plan**: Performance regression tests in CI/CD

### V. Testing Pyramid
- ✅ **PASS**: Will follow pyramid structure
- **Plan**: Unit tests: ≥ 80% coverage for metric calculations, scoring algorithms, data transformations
- **Plan**: Integration tests: GitHub API interactions, localStorage persistence, URL parameter handling
- **Plan**: Contract tests: GitHub API response schemas, Expected metric output formats
- **Plan**: E2E tests: Critical user journeys only (evaluate project, add custom criteria, share evaluation)
- **Plan**: Test independence: No shared state, mocked GitHub API responses
- **Plan**: Fast execution: Unit tests < 100ms each, full suite < 5 minutes

### VI. Documentation Excellence
- ✅ **PASS**: Comprehensive documentation planned
- **Plan**: README with setup, architecture overview, contribution guidelines
- **Plan**: Inline JSDoc for all public functions and complex algorithms
- **Plan**: User guide integrated into application (contextual help - FR-021)
- **Plan**: ADRs for significant decisions (framework choice, architecture patterns)
- **Plan**: Metric explanation content (educational component - User Story 4)
- **Plan**: quickstart.md for developers getting started

### Performance Standards
- ✅ **PASS**: Frontend budgets align with constitution
- **Initial bundle**: < 500KB gzipped ✅ (constitution: < 500KB)
- **Total bundle**: < 2MB ✅ (constitution: < 2MB)
- **FCP**: < 1.5 seconds ✅ (constitution: < 1.5s)
- **LCP**: < 2.5 seconds ✅ (constitution: < 2.5s)
- **TTI**: < 3 seconds on 3G ✅ (spec + constitution: < 3s)
- **FID**: < 100ms ✅ (constitution: < 100ms)
- **CLS**: < 0.1 ✅ (constitution: < 0.1)

### Development Workflow
- ✅ **PASS**: Will implement all workflow requirements
- **Plan**: Feature branch workflow with pull requests
- **Plan**: Code review required before merge
- **Plan**: CI/CD with GitHub Actions (linting, testing, bundle size checks)
- **Plan**: Automated deployment to GitHub Pages on main branch merge
- **Plan**: Conventional Commits format for commit messages

### Summary
**CONSTITUTION CHECK: PASS ✅** - All constitutional requirements can be met for this feature. No violations require justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-health-analyzer/
├── plan.md              # This file
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Developer getting started guide
├── contracts/           # Phase 1: API contracts and schemas
│   ├── github-api.md    # GitHub API endpoints and response schemas
│   └── metrics-schema.md # Metric calculation specifications
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── components/          # UI components (metric cards, charts, forms)
│   ├── MetricDisplay.js
│   ├── CustomCriteriaForm.js
│   ├── ComparisonView.js
│   └── HelpTooltip.js
├── services/           # Business logic and API interactions
│   ├── githubApi.js    # GitHub API client
│   ├── metricCalculator.js  # Metric calculation logic
│   ├── criteriaEvaluator.js # Custom criteria evaluation
│   └── cacheManager.js # localStorage caching
├── models/             # Data structures and entities
│   ├── Repository.js
│   ├── Metric.js
│   ├── CustomCriterion.js
│   └── EvaluationProfile.js
├── utils/              # Utility functions
│   ├── urlParams.js    # URL parameter handling
│   ├── scoring.js      # Scoring algorithms
│   └── formatters.js   # Data formatting helpers
├── config/             # Configuration and constants
│   ├── metricDefinitions.js  # Baseline metric definitions
│   └── thresholds.js   # Scoring thresholds
├── styles/             # CSS files
│   ├── main.css
│   └── components.css
├── index.html          # Entry point
└── main.js             # Application initialization

tests/
├── unit/               # Unit tests for services, models, utils
│   ├── metricCalculator.test.js
│   ├── criteriaEvaluator.test.js
│   ├── scoring.test.js
│   └── formatters.test.js
├── integration/        # Integration tests for API and storage
│   ├── githubApi.test.js
│   ├── cacheManager.test.js
│   └── urlParams.test.js
└── e2e/                # End-to-end tests for user workflows
    ├── evaluate-project.spec.js
    ├── custom-criteria.spec.js
    └── share-evaluation.spec.js

docs/
├── architecture.md     # System architecture overview
├── metrics-guide.md    # Explanation of all baseline metrics
└── adr/                # Architecture Decision Records
    ├── 001-vanilla-js-vs-framework.md
    ├── 002-github-api-authentication.md
    └── 003-caching-strategy.md

.github/
├── workflows/
│   ├── ci.yml          # Linting, testing, build verification
│   └── deploy.yml      # GitHub Pages deployment
└── CODEOWNERS          # Code review ownership

public/
├── favicon.ico
└── assets/             # Images, icons, fonts
```

**Structure Decision**: Selected single-page web application structure (Option 1 variant) because this is a frontend-only static application with no backend requirements. The structure separates concerns into components (UI), services (business logic), models (data structures), and utils (helpers). This organization supports TDD by making business logic easily testable in isolation from UI components.

## Complexity Tracking

> No constitutional violations - this section is empty per template instructions.
