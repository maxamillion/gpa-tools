# Implementation Tasks: Open Source Project Health Analyzer

**Feature Branch**: `001-project-health-analyzer`
**Created**: 2026-01-16
**Status**: Ready for Implementation
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

## Overview

This document provides dependency-ordered implementation tasks following Test-Driven Development (TDD) principles. Tasks are organized by user story to enable independent implementation and testing.

**Total Tasks**: 98
**Estimated MVP (User Story 1)**: 66 tasks
**Constitution Compliance**: TDD mandatory, WCAG 2.1 AA required, 80% test coverage target

---

## Task Organization

- **Phase 1**: Setup & Infrastructure (T001-T015) - 15 tasks
- **Phase 2**: Foundational Components (T016-T024) - 9 tasks
- **Phase 3**: User Story 1 - Core Evaluation (T025-T066) - 42 tasks ⭐ **MVP**
- **Phase 4**: User Story 2 - Custom Criteria (T067-T079) - 13 tasks
- **Phase 5**: User Story 4 - Metric Education (T080-T085) - 6 tasks
- **Phase 6**: User Story 3 - Project Comparison (T086-T091) - 6 tasks
- **Phase 7**: Polish & Cross-Cutting (T092-T098) - 7 tasks

**Parallel Execution Opportunities**: 42 tasks marked with [P]

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize project with all necessary tooling, configuration, and development environment.

**Success Criteria**:
- All dependencies installed and configured
- Linting and type checking pass on empty project
- Build and test commands execute successfully
- Development server runs without errors

### Tasks

- [X] T001 Initialize npm project with package.json in repository root
- [X] T002 Install core dependencies: @octokit/rest, chart.js in repository root
- [X] T003 Install dev dependencies: vite, vitest, playwright, @vitest/ui, msw, @axe-core/playwright in repository root
- [X] T004 Install linting tools: eslint, prettier, eslint-config-prettier in repository root
- [X] T005 Create vite.config.js with build configuration (minification, code splitting, bundle analysis)
- [X] T006 Create vitest.config.js with test configuration (coverage thresholds ≥80%, jsdom environment)
- [X] T007 Create playwright.config.js with E2E test configuration (multi-browser, accessibility, retries)
- [X] T008 Create .eslintrc.js with code quality rules (cyclomatic complexity ≤10, max function length 50)
- [X] T009 Create .prettierrc with formatting rules
- [X] T010 Create public/index.html with semantic HTML structure, WCAG 2.1 AA compliance, skip links
- [X] T011 Create src/main.js application entry point with event bus initialization
- [X] T012 Create src/styles/main.css with CSS reset, design tokens, responsive breakpoints
- [X] T013 Create tests/setup.js with MSW server configuration and test utilities
- [X] T014 Create tests/mocks/handlers.js with GitHub API mock handlers
- [X] T015 Configure npm scripts: dev, build, test, test:e2e, lint, format

**Validation**: Run `npm run lint && npm run test && npm run build` - all should pass with zero errors.

---

## Phase 2: Foundational Components

**Goal**: Implement core data models, utilities, and services that all user stories depend on.

**Success Criteria**:
- All models have validation logic and pass unit tests
- CacheManager works with TTL and LRU eviction
- EventBus enables component communication
- No dependencies on incomplete user stories

### Tasks

- [X] T016 [P] Write unit tests for Repository model in tests/unit/models/Repository.test.js
- [X] T017 [P] Implement Repository model class in src/models/Repository.js with validation (owner, name, isPrivate check)
- [X] T018 [P] Write unit tests for Metric model in tests/unit/models/Metric.test.js
- [X] T019 [P] Implement Metric model class in src/models/Metric.js with scoreToGrade, formatValue methods
- [X] T020 [P] Write unit tests for HealthScore model in tests/unit/models/HealthScore.test.js
- [X] T021 [P] Implement HealthScore model class in src/models/HealthScore.js with calculateOverall method (FR-016 weighted scoring)
- [X] T022 [P] Write unit tests for CacheManager in tests/unit/services/CacheManager.test.js (TTL, LRU eviction)
- [X] T023 [P] Implement CacheManager class in src/services/CacheManager.js with set, get, evictLRU, getCacheAge methods (FR-028, FR-035)
- [X] T024 [P] Implement EventBus utility in src/utils/eventBus.js for component communication

**Validation**: Run `npm test tests/unit/models tests/unit/services/CacheManager.test.js` - all tests pass, ≥80% coverage.

---

## Phase 3: User Story 1 - Evaluate Project Health with Standard Metrics (P1) ⭐ **MVP**

**User Story**: A developer wants to quickly assess overall health of an open source project using industry-standard metrics before deciding whether to adopt, contribute to, or depend on it.

**Goal**: Complete end-to-end evaluation workflow from URL input to health report display.

**Independent Test Criteria**:
- ✅ User can enter "https://github.com/facebook/react" and see health report within 10 seconds
- ✅ All 18 baseline metrics displayed with scores, explanations, and categories
- ✅ Invalid/private repository URLs show clear error messages
- ✅ Loading indicators appear for operations >2 seconds
- ✅ WCAG 2.1 AA compliance verified via axe-core

### GitHub API Integration (US1)

- [X] T025 [P] [US1] Write unit tests for GitHubApiClient in tests/unit/services/GitHubApiClient.test.js (mocked with MSW)
- [X] T026 [US1] Implement GitHubApiClient class in src/services/GitHubApiClient.js with fetchRepository, fetchCommits, fetchContributors methods (FR-027)
- [X] T027 [P] [US1] Write integration tests for GitHub API rate limiting in tests/integration/api-integration.test.js (MSW mock)
- [X] T028 [US1] Implement exponential backoff logic in GitHubApiClient with retry queue (1s → 60s max, FR-034)
- [X] T029 [P] [US1] Write integration tests for ETag conditional requests in tests/integration/api-integration.test.js
- [X] T030 [US1] Implement ETag caching in GitHubApiClient for conditional requests (reduce API calls)

### Metric Calculation Services (US1)

- [X] T031 [P] [US1] Write unit tests for MetricCalculator activity metrics in tests/unit/services/MetricCalculator.test.js (commitFrequency, releaseCadence, timeSinceLastCommit)
- [X] T032 [P] [US1] Implement MetricCalculator.calculateActivityMetrics in src/services/MetricCalculator.js (FR-001, FR-005)
- [X] T033 [P] [US1] Write unit tests for MetricCalculator community metrics in tests/unit/services/MetricCalculator.test.js (contributorCount, issueResponseTime, prMergeRate, busFactor)
- [X] T034 [P] [US1] Implement MetricCalculator.calculateCommunityMetrics in src/services/MetricCalculator.js (FR-002, FR-006, FR-007)
- [X] T035 [P] [US1] Write unit tests for MetricCalculator maintenance metrics in tests/unit/services/MetricCalculator.test.js (openClosedIssueRatio, staleIssuePercentage, avgTimeToCloseIssues)
- [X] T036 [P] [US1] Implement MetricCalculator.calculateMaintenanceMetrics in src/services/MetricCalculator.js (FR-003)
- [X] T037 [P] [US1] Write unit tests for MetricCalculator documentation metrics in tests/unit/services/MetricCalculator.test.js (hasReadme, hasContributing, hasCodeOfConduct, documentationCoverage)
- [X] T038 [P] [US1] Implement MetricCalculator.calculateDocumentationMetrics in src/services/MetricCalculator.js (FR-004)
- [X] T039 [P] [US1] Write unit tests for MetricCalculator security metrics in tests/unit/services/MetricCalculator.test.js (hasSecurityPolicy, hasDependabot, vulnerabilityCount, licensePresence)
- [X] T040 [P] [US1] Implement MetricCalculator.calculateSecurityMetrics in src/services/MetricCalculator.js (FR-008)
- [X] T041 [P] [US1] Write unit tests for missing data handling (N/A metrics, FR-037) in tests/unit/services/MetricCalculator.test.js
- [X] T042 [US1] Implement missing data handling in MetricCalculator - return null score, "N/A" grade, unavailableReason (FR-037)

### Evaluation Orchestration (US1)

- [X] T043 [P] [US1] Write unit tests for EvaluationOrchestrator in tests/unit/services/EvaluationOrchestrator.test.js
- [X] T044 [US1] Implement EvaluationOrchestrator class in src/services/EvaluationOrchestrator.js with evaluateRepository method
- [X] T045 [US1] Implement parallel category fetching in EvaluationOrchestrator (5 API calls in parallel, progressive loading)
- [X] T046 [US1] Implement cache integration in EvaluationOrchestrator (check cache, fetch if miss, store with 24h TTL - FR-028)

### UI Components (US1)

- [X] T047 [P] [US1] Write unit tests for RepositoryInput component in tests/unit/components/RepositoryInput.test.js
- [X] T048 [US1] Implement RepositoryInput Web Component in src/components/RepositoryInput.js (Light DOM, WCAG 2.1 AA, keyboard navigation)
- [X] T049 [US1] Add URL validation to RepositoryInput (GitHub URL format, error message for invalid URLs - FR-023, FR-036)
- [X] T050 [P] [US1] Write unit tests for LoadingSpinner component in tests/unit/components/LoadingSpinner.test.js
- [X] T051 [US1] Implement LoadingSpinner Web Component in src/components/LoadingSpinner.js (Shadow DOM, ARIA live region)
- [X] T052 [P] [US1] Write unit tests for ErrorDisplay component in tests/unit/components/ErrorDisplay.test.js
- [X] T053 [US1] Implement ErrorDisplay Web Component in src/components/ErrorDisplay.js (private repo error, 404 error, rate limit error - FR-023, FR-036)
- [X] T054 [P] [US1] Write unit tests for MetricCard component in tests/unit/components/MetricCard.test.js
- [X] T055 [US1] Implement MetricCard Web Component in src/components/MetricCard.js (score, grade, explanation, ARIA labels - FR-018, FR-020, FR-021)
- [X] T056 [P] [US1] Write unit tests for CategorySection component in tests/unit/components/CategorySection.test.js
- [X] T057 [US1] Implement CategorySection Web Component in src/components/CategorySection.js (groups metrics by category - FR-017)
- [X] T058 [P] [US1] Write unit tests for HealthScoreCard component in tests/unit/components/HealthScoreCard.test.js
- [X] T059 [US1] Implement HealthScoreCard Web Component in src/components/HealthScoreCard.js (overall score, weighted average, cache age indicator - FR-016, FR-035)
- [X] T060 [US1] Wire RepositoryInput to EvaluationOrchestrator in src/main.js (URL submit → evaluation → display)
- [X] T061 [US1] Add loading states and progressive metric display in src/main.js (show results as categories complete)
- [X] T062 [US1] Add error handling and display in src/main.js (API errors, private repos, invalid URLs)

### End-to-End Testing (US1)

- [X] T063 [US1] Write E2E test for successful evaluation workflow in tests/e2e/evaluate-repository.spec.js (enter URL → see health report)
- [X] T064 [US1] Write E2E test for invalid repository error in tests/e2e/evaluate-repository.spec.js (404, private repo)
- [X] T065 [US1] Write E2E test for loading indicators in tests/e2e/evaluate-repository.spec.js (spinner, progress feedback)
- [X] T066 [US1] Write E2E accessibility test with axe-core in tests/e2e/accessibility.spec.js (WCAG 2.1 AA compliance - no violations)

**US1 Validation**:
- Run `npm test` - all US1 tests pass, ≥80% coverage
- Run `npm run test:e2e` - all US1 E2E tests pass
- Manual test: Enter facebook/react URL → see health report within 10 seconds

---

## Phase 4: User Story 2 - Add Custom Evaluation Criteria (P2)

**User Story**: A user wants to evaluate a project based on specific criteria important to their use case in addition to standard health metrics.

**Goal**: Enable users to define, evaluate, and persist custom criteria.

**Independent Test Criteria**:
- ✅ User can add custom criterion "Has TypeScript" and see evaluation result
- ✅ Multiple criteria can be added and evaluated simultaneously
- ✅ Custom criteria persist across browser sessions (localStorage)
- ✅ User can edit/delete individual criteria without losing others

### Custom Criteria Models & Services (US2)

- [X] T067 [P] [US2] Write unit tests for CustomCriterion model in tests/unit/models/CustomCriterion.test.js
- [X] T068 [US2] Implement CustomCriterion model class in src/models/CustomCriterion.js with validate, evaluate methods (FR-009 to FR-015)
- [X] T069 [P] [US2] Write unit tests for EvaluationProfile model in tests/unit/models/EvaluationProfile.test.js
- [X] T070 [US2] Implement EvaluationProfile model class in src/models/EvaluationProfile.js with serialize, deserialize, generateShareableUrl methods (FR-030, FR-032, FR-033)
- [X] T071 [P] [US2] Write unit tests for custom criterion automatic evaluation in tests/unit/services/CriterionEvaluator.test.js
- [X] T072 [US2] Implement automatic evaluation logic for technology/file-based criteria in src/services/CriterionEvaluator.js (check dependencies, file existence - FR-013)

### Custom Criteria UI (US2)

- [X] T073 [P] [US2] Write unit tests for CustomCriteriaForm component in tests/unit/components/CustomCriteriaForm.test.js
- [X] T074 [US2] Implement CustomCriteriaForm Web Component in src/components/CustomCriteriaForm.js (add/edit/delete criteria, WCAG 2.1 AA)
- [X] T075 [US2] Add criterion evaluation display to MetricCard component (confidence level, evidence - FR-015)
- [X] T076 [US2] Implement localStorage persistence for custom criteria in src/services/CacheManager.js (persist until user clears data - FR-032)
- [X] T077 [US2] Wire CustomCriteriaForm to EvaluationOrchestrator in src/main.js (evaluate criteria alongside baseline metrics)

### End-to-End Testing (US2)

- [X] T078 [US2] Write E2E test for adding custom criteria in tests/e2e/custom-criteria.spec.js
- [X] T079 [US2] Write E2E test for criteria persistence in tests/e2e/custom-criteria.spec.js (page reload)

**US2 Validation**:
- Add criterion "Has TypeScript" → see automatic evaluation result
- Reload page → custom criteria still present

---

## Phase 5: User Story 4 - Understand Metric Meanings and Thresholds (P2)

**User Story**: A user who is not familiar with open source health metrics wants to understand what each metric means, why it matters, and what constitutes a "good" vs "poor" score.

**Goal**: Provide educational tooltips, metric explanations, and threshold visualizations.

**Independent Test Criteria**:
- ✅ Hover over metric → see tooltip with explanation and importance
- ✅ Click metric → see modal with detailed explanation, thresholds, examples
- ✅ Links to authoritative resources (CHAOSS) provided
- ✅ Threshold ranges (poor/fair/good/excellent) clearly visualized

### Educational UI Components (US4)

- [X] T080 [P] [US4] Write unit tests for MetricTooltip component in tests/unit/components/MetricTooltip.test.js
- [X] T081 [US4] Implement MetricTooltip Web Component in src/components/MetricTooltip.js (hover → explanation, why it matters - FR-021)
- [X] T082 [P] [US4] Write unit tests for MetricDetailModal component in tests/unit/components/MetricDetailModal.test.js
- [X] T083 [US4] Implement MetricDetailModal Web Component in src/components/MetricDetailModal.js (click → full explanation, thresholds, examples, CHAOSS links)
- [X] T084 [US4] Add threshold visualization to MetricCard component (color-coded ranges, labels for poor/fair/good/excellent)
- [X] T085 [US4] Wire MetricCard to MetricDetailModal in src/main.js (click metric → open modal)

**US4 Validation**:
- Hover over "Commit Frequency" → see tooltip
- Click "Commit Frequency" → see detailed modal with CHAOSS link

---

## Phase 6: User Story 3 - Compare Projects Side-by-Side (P3)

**User Story**: A user wants to evaluate and compare multiple projects simultaneously to make an informed choice between competing alternatives.

**Goal**: Enable multi-project comparison with aligned metrics and visual highlighting.

**Independent Test Criteria**:
- ✅ Evaluate facebook/react and vuejs/vue → see side-by-side comparison
- ✅ Metrics aligned for easy comparison
- ✅ Significant differences visually highlighted
- ✅ Comparison shareable via URL

### Comparison UI & Services (US3)

- [X] T086 [P] [US3] Write unit tests for ComparisonTable component in tests/unit/components/ComparisonTable.test.js
- [X] T087 [US3] Implement ComparisonTable Web Component in src/components/ComparisonTable.js (side-by-side metrics, difference highlighting)
- [X] T088 [US3] Implement multi-evaluation state management in src/main.js (store multiple EvaluationProfiles)
- [X] T089 [US3] Add comparison URL generation in EvaluationProfile model (encode multiple repos in URL params - FR-033)
- [X] T090 [US3] Wire "Add to Comparison" button to ComparisonTable in src/main.js
- [X] T091 [US3] Implement export functionality for comparisons in src/utils/export.js (JSON/CSV export - FR-031)

**US3 Validation**:
- Evaluate facebook/react → click "Add to Comparison"
- Evaluate vuejs/vue → see comparison table
- Differences visually highlighted

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final polish, performance optimization, and production readiness.

### Tasks

- [X] T092 [P] Implement Chart.js lazy loading for trend visualization in src/components/MetricChart.js (dynamic import, <60KB)
- [X] T093 [P] Add CSS component styles in src/styles/components.css (mobile-first, responsive, WCAG contrast)
- [X] T094 Run bundle size analysis with rollup-plugin-visualizer and verify <500KB initial bundle (FR-025)
- [ ] T095 Run Lighthouse performance audit and verify TTI <3s, LCP <2.5s (FR-026, performance budget)
- [ ] T096 Run full accessibility audit with axe-core across all pages (WCAG 2.1 AA - zero violations)
- [X] T097 Add GitHub Pages deployment configuration in vite.config.js (base path, static assets)
- [ ] T098 Create production build and test on GitHub Pages (smoke test - verify static hosting works - FR-024, FR-025)

**Validation**:
- Bundle <500KB gzipped
- Lighthouse score: Performance >90, Accessibility 100
- Zero axe-core violations

---

## Dependency Graph

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational)
                        ↓
                  Phase 3 (US1 - MVP) ⭐
                        ↓
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
    Phase 4 (US2)  Phase 5 (US4)  Phase 6 (US3)
          └─────────────┼─────────────┘
                        ↓
                  Phase 7 (Polish)
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) [MVP complete]

**Parallel Opportunities After MVP**:
- US2 (Custom Criteria) can be developed in parallel with US4 (Education)
- US3 (Comparison) depends on US1 but is independent of US2 and US4
- US4 (Education) is independent of US2 and US3

---

## Parallel Execution Examples

### Phase 1 (Setup) - Sequential (dependencies on previous tasks)
All tasks must run sequentially due to file system and configuration dependencies.

### Phase 2 (Foundational) - High Parallelism
```
Parallel Group 1 (6 tasks):
├── T016, T017 (Repository model)
├── T018, T019 (Metric model)
└── T020, T021 (HealthScore model)

Parallel Group 2 (2 tasks):
├── T022, T023 (CacheManager)
└── T024 (EventBus)
```

### Phase 3 (User Story 1) - Moderate Parallelism
```
Sequential: T025 → T026 (GitHubApiClient foundation)
Then Parallel Group 1 (12 tasks):
├── T027, T028, T029, T030 (API enhancements)
├── T031, T032 (Activity metrics)
├── T033, T034 (Community metrics)
├── T035, T036 (Maintenance metrics)
├── T037, T038 (Documentation metrics)
└── T039, T040 (Security metrics)

Parallel Group 2 (3 tasks after T041, T042):
├── T043, T044 (Orchestrator)
├── T045, T046 (Parallel fetching, caching)

Parallel Group 3 (Components - 12 tasks):
├── T047, T048, T049 (RepositoryInput)
├── T050, T051 (LoadingSpinner)
├── T052, T053 (ErrorDisplay)
├── T054, T055 (MetricCard)
├── T056, T057 (CategorySection)
└── T058, T059 (HealthScoreCard)

Sequential: T060 → T061 → T062 (Integration)
Sequential: T063 → T064 → T065 → T066 (E2E tests)
```

### Phase 4 (User Story 2) - Moderate Parallelism
```
Parallel Group 1 (6 tasks):
├── T067, T068 (CustomCriterion model)
├── T069, T070 (EvaluationProfile model)
└── T071, T072 (Criterion evaluator)

Parallel Group 2 (2 tasks):
├── T073, T074 (CustomCriteriaForm)
└── T075 (MetricCard enhancement)

Sequential: T076 → T077 (Integration)
Parallel Group 3 (2 tasks):
├── T078 (E2E - add criteria)
└── T079 (E2E - persistence)
```

### Phase 5 (User Story 4) - High Parallelism
```
Parallel Group (6 tasks):
├── T080, T081 (MetricTooltip)
├── T082, T083 (MetricDetailModal)
├── T084 (Threshold visualization)
└── T085 (Integration)
```

### Phase 6 (User Story 3) - Moderate Parallelism
```
Parallel Group 1 (2 tasks):
├── T086, T087 (ComparisonTable)
└── T088 (State management)

Sequential: T089 → T090 → T091 (Integration & export)
```

### Phase 7 (Polish) - High Parallelism
```
Parallel Group (3 tasks):
├── T092 (Chart.js lazy load)
├── T093 (CSS polish)
└── T094 (Bundle analysis)

Sequential validation: T095 → T096 → T097 → T098
```

---

## Implementation Strategy

### MVP Scope (Recommended First Iteration)
**Target**: User Story 1 only (T001-T066)
- **Tasks**: 66 tasks (Setup + Foundational + US1)
- **Estimated Effort**: 3-4 weeks (assuming TDD, thorough testing)
- **Deliverable**: Functional health analyzer with 18 baseline metrics, caching, WCAG 2.1 AA compliance

### Post-MVP Increments
1. **Increment 1**: Add US2 (Custom Criteria) - 13 tasks
2. **Increment 2**: Add US4 (Education) - 6 tasks
3. **Increment 3**: Add US3 (Comparison) - 6 tasks
4. **Increment 4**: Polish & Production - 7 tasks

### TDD Workflow (Per Task)
1. **Red**: Write failing test first (T0xx test tasks)
2. **Green**: Implement minimal code to pass test (T0xx+1 implementation tasks)
3. **Refactor**: Improve code quality while keeping tests green
4. **Validate**: Run full test suite, ensure coverage ≥80%

### Quality Gates (Before Phase Completion)
- ✅ All unit tests pass (`npm test`)
- ✅ All E2E tests pass (`npm run test:e2e`)
- ✅ Test coverage ≥80% for new code
- ✅ Linting passes with zero errors (`npm run lint`)
- ✅ Bundle size within budget (<500KB)
- ✅ Accessibility audit passes (zero axe-core violations)
- ✅ Performance budget met (TTI <3s, LCP <2.5s)

---

## Task Validation Summary

**Format Compliance**: ✅ All 98 tasks follow strict checklist format:
- Checkbox: `- [ ]` ✓
- Task ID: Sequential T001-T098 ✓
- [P] marker: 42 parallelizable tasks ✓
- [Story] label: US1, US2, US3, US4 for user story tasks ✓
- File paths: Specific paths for all implementation tasks ✓

**Coverage**:
- ✅ All 6 entities from data-model.md mapped to tasks
- ✅ All 18 baseline metrics covered (FR-001 to FR-008)
- ✅ All 4 user stories with acceptance scenarios mapped to E2E tests
- ✅ GitHub API contracts mapped to GitHubApiClient tasks
- ✅ TDD workflow enforced (test task before implementation task)
- ✅ WCAG 2.1 AA compliance validated via axe-core
- ✅ Performance budgets validated in Phase 7

**Parallel Opportunities**: 42 tasks marked [P] (43% of total) - significant time savings potential

**MVP Scope**: Phase 3 (US1) = 66 tasks delivers core value proposition

---

## Next Steps

1. **Start MVP**: Begin with Phase 1 (Setup) tasks T001-T015
2. **Follow TDD**: Always write tests before implementation
3. **Run Quality Gates**: Validate each phase completion before moving forward
4. **Track Progress**: Use task checkboxes to monitor completion
5. **Parallelize**: Leverage [P] tasks for concurrent development when team size allows

**First Command**: `npm init -y` (T001)

**Success Metric**: After completing US1 (T001-T066), user can evaluate facebook/react and see comprehensive health report within 10 seconds.
