# Tasks: Open Source Project Health Analyzer

**Input**: Design documents from `/specs/001-project-health-analyzer/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution (TDD is non-negotiable)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Node.js project with package.json and npm configuration
- [ ] T002 Install Vite as build tool and dev server with configuration
- [ ] T003 [P] Install Vitest for unit/integration testing with configuration in vitest.config.js
- [ ] T004 [P] Install Playwright for E2E testing with configuration in playwright.config.js
- [ ] T005 [P] Install ESLint with complexity rules (max 10) in .eslintrc.js
- [ ] T006 [P] Install Prettier for code formatting in .prettierrc.js
- [ ] T007 [P] Install Octokit.js for GitHub API client interactions
- [ ] T008 [P] Create project directory structure (src/, tests/, docs/, public/, .github/)
- [ ] T009 [P] Create base HTML entry point in src/index.html with semantic structure
- [ ] T010 [P] Create main CSS file in src/styles/main.css with CSS custom properties
- [ ] T011 [P] Create main JavaScript entry point in src/main.js
- [ ] T012 [P] Configure GitHub Actions CI workflow in .github/workflows/ci.yml (lint, test, build)
- [ ] T013 [P] Configure GitHub Actions deploy workflow in .github/workflows/deploy.yml (GitHub Pages)
- [ ] T014 [P] Create README.md with setup instructions and architecture overview
- [ ] T015 [P] Create .gitignore with node_modules, dist, .env exclusions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T016 Create metric definitions configuration in src/config/metricDefinitions.js with all 18 baseline metrics
- [ ] T017 [P] Create scoring thresholds configuration in src/config/thresholds.js
- [ ] T018 [P] Write unit tests for Repository model validation in tests/unit/Repository.test.js
- [ ] T019 [P] Create Repository model in src/models/Repository.js with validation
- [ ] T020 [P] Write unit tests for Metric model validation in tests/unit/Metric.test.js
- [ ] T021 [P] Create Metric model in src/models/Metric.js with validation
- [ ] T022 [P] Write unit tests for MetricCategory enum in tests/unit/MetricCategory.test.js
- [ ] T023 [P] Create MetricCategory enum/constants in src/models/MetricCategory.js
- [ ] T024 [P] Write unit tests for GitHub API client error handling in tests/unit/githubApi.test.js
- [ ] T025 Create GitHub API service in src/services/githubApi.js with rate limiting and error handling
- [ ] T026 [P] Write integration tests for GitHub API mocking in tests/integration/githubApi.test.js using MSW
- [ ] T027 [P] Write unit tests for cache manager in tests/unit/cacheManager.test.js
- [ ] T028 Create cache manager service in src/services/cacheManager.js with localStorage and TTL
- [ ] T029 [P] Write unit tests for URL parameter utilities in tests/unit/urlParams.test.js
- [ ] T030 Create URL parameter utility in src/utils/urlParams.js for sharing functionality
- [ ] T031 [P] Write unit tests for scoring algorithms in tests/unit/scoring.test.js
- [ ] T032 Create scoring utility in src/utils/scoring.js with all threshold logic
- [ ] T033 [P] Write unit tests for data formatters in tests/unit/formatters.test.js
- [ ] T034 Create data formatter utility in src/utils/formatters.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Evaluate Project Health with Standard Metrics (Priority: P1) 🎯 MVP

**Goal**: Users can enter a GitHub repository URL and view a comprehensive health report with all 18 baseline metrics

**Independent Test**: Enter "https://github.com/facebook/react" → See health report with all baseline metrics, scores, and explanations

### Tests for User Story 1 (TDD - Write First) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T035 [P] [US1] Write E2E test for repository URL input and validation in tests/e2e/evaluate-project.spec.js
- [ ] T036 [P] [US1] Write E2E test for displaying baseline metrics report in tests/e2e/evaluate-project.spec.js
- [ ] T037 [P] [US1] Write E2E test for error handling (invalid URL, 404) in tests/e2e/evaluate-project.spec.js
- [ ] T038 [P] [US1] Write E2E test for loading indicators during fetch in tests/e2e/evaluate-project.spec.js
- [ ] T039 [P] [US1] Write unit tests for commit frequency calculation in tests/unit/metricCalculator.test.js
- [ ] T040 [P] [US1] Write unit tests for release cadence calculation in tests/unit/metricCalculator.test.js
- [ ] T041 [P] [US1] Write unit tests for last activity calculation in tests/unit/metricCalculator.test.js
- [ ] T042 [P] [US1] Write unit tests for contributor count calculation in tests/unit/metricCalculator.test.js
- [ ] T043 [P] [US1] Write unit tests for new contributors calculation in tests/unit/metricCalculator.test.js
- [ ] T044 [P] [US1] Write unit tests for PR merge rate calculation in tests/unit/metricCalculator.test.js
- [ ] T045 [P] [US1] Write unit tests for open issues ratio calculation in tests/unit/metricCalculator.test.js
- [ ] T046 [P] [US1] Write unit tests for issue response time calculation in tests/unit/metricCalculator.test.js
- [ ] T047 [P] [US1] Write unit tests for stale issues percentage calculation in tests/unit/metricCalculator.test.js
- [ ] T048 [P] [US1] Write unit tests for average time to close calculation in tests/unit/metricCalculator.test.js
- [ ] T049 [P] [US1] Write unit tests for README quality score calculation in tests/unit/metricCalculator.test.js
- [ ] T050 [P] [US1] Write unit tests for documentation directory check in tests/unit/metricCalculator.test.js
- [ ] T051 [P] [US1] Write unit tests for wiki presence check in tests/unit/metricCalculator.test.js
- [ ] T052 [P] [US1] Write unit tests for security policy check in tests/unit/metricCalculator.test.js
- [ ] T053 [P] [US1] Write unit tests for code of conduct check in tests/unit/metricCalculator.test.js
- [ ] T054 [P] [US1] Write unit tests for contributing guidelines check in tests/unit/metricCalculator.test.js
- [ ] T055 [P] [US1] Write unit tests for license check in tests/unit/metricCalculator.test.js
- [ ] T056 [P] [US1] Write unit tests for bus factor calculation in tests/unit/metricCalculator.test.js
- [ ] T057 [P] [US1] Write unit tests for overall health score calculation in tests/unit/metricCalculator.test.js
- [ ] T058 [P] [US1] Write contract tests for GitHub API response schemas in tests/integration/github-api-contracts.test.js

### Implementation for User Story 1

- [ ] T059 [US1] Implement metric calculator service in src/services/metricCalculator.js with all 18 metric calculations (depends on T035-T058)
- [ ] T060 [P] [US1] Create HealthScore model in src/models/HealthScore.js with weighted average logic
- [ ] T061 [P] [US1] Create EvaluationProfile model in src/models/EvaluationProfile.js
- [ ] T062 [US1] Create MetricDisplay web component in src/components/MetricDisplay.js with semantic HTML and ARIA
- [ ] T063 [US1] Create MetricCategory web component in src/components/MetricCategory.js for grouping metrics
- [ ] T064 [US1] Create HealthScore web component in src/components/HealthScore.js for overall score display
- [ ] T065 [US1] Create repository input form web component in src/components/RepositoryInput.js with validation
- [ ] T066 [US1] Create loading indicator web component in src/components/LoadingIndicator.js
- [ ] T067 [US1] Create error message web component in src/components/ErrorMessage.js with accessible alerts
- [ ] T068 [US1] Implement main application controller in src/main.js connecting all components for US1
- [ ] T069 [US1] Add CSS styles for metric display in src/styles/components.css
- [ ] T070 [US1] Implement keyboard navigation and focus management for accessibility
- [ ] T071 [US1] Add ARIA live regions for dynamic content updates
- [ ] T072 [US1] Test with screen readers (NVDA/VoiceOver) and fix accessibility issues

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 4 - Understand Metric Meanings and Thresholds (Priority: P2)

**Goal**: Users can understand what each metric means, why it matters, and scoring thresholds without external documentation

**Independent Test**: Hover/click on any metric → See tooltip with explanation, why it matters, and threshold ranges

**Note**: Implementing US4 before US2 because it enhances US1 and is simpler than custom criteria

### Tests for User Story 4 (TDD - Write First) ⚠️

- [ ] T073 [P] [US4] Write E2E test for metric tooltip display on hover in tests/e2e/metric-help.spec.js
- [ ] T074 [P] [US4] Write E2E test for metric threshold indicators in tests/e2e/metric-help.spec.js
- [ ] T075 [P] [US4] Write E2E test for external documentation links in tests/e2e/metric-help.spec.js
- [ ] T076 [P] [US4] Write E2E test for keyboard accessibility of help tooltips in tests/e2e/metric-help.spec.js
- [ ] T077 [P] [US4] Write unit tests for help tooltip content generation in tests/unit/HelpTooltip.test.js

### Implementation for User Story 4

- [ ] T078 [P] [US4] Create help content data in src/config/helpContent.js with all metric explanations
- [ ] T079 [US4] Create HelpTooltip web component in src/components/HelpTooltip.js with accessible patterns (depends on T073-T077)
- [ ] T080 [US4] Create ThresholdIndicator web component in src/components/ThresholdIndicator.js
- [ ] T081 [US4] Integrate HelpTooltip into MetricDisplay component with keyboard triggers
- [ ] T082 [US4] Add external documentation links to CHAOSS and Linux Foundation resources
- [ ] T083 [US4] Add CSS styles for tooltips and threshold indicators in src/styles/components.css
- [ ] T084 [US4] Test tooltip accessibility with keyboard-only navigation
- [ ] T085 [US4] Verify all 18 metrics have complete help content and examples

**Checkpoint**: User Story 4 complete - Users can now understand all metrics without leaving the app

---

## Phase 5: User Story 2 - Add Custom Evaluation Criteria (Priority: P2)

**Goal**: Users can define and evaluate custom criteria (TypeScript usage, security practices, etc.) alongside baseline metrics

**Independent Test**: After viewing baseline metrics, add custom criteria "Uses TypeScript" → See evaluation result with evidence

### Tests for User Story 2 (TDD - Write First) ⚠️

- [ ] T086 [P] [US2] Write E2E test for adding custom criterion in tests/e2e/custom-criteria.spec.js
- [ ] T087 [P] [US2] Write E2E test for evaluating custom criteria automatically in tests/e2e/custom-criteria.spec.js
- [ ] T088 [P] [US2] Write E2E test for editing/deleting custom criteria in tests/e2e/custom-criteria.spec.js
- [ ] T089 [P] [US2] Write E2E test for persisting custom criteria in localStorage in tests/e2e/custom-criteria.spec.js
- [ ] T090 [P] [US2] Write unit tests for CustomCriterion model validation in tests/unit/CustomCriterion.test.js
- [ ] T091 [P] [US2] Write unit tests for TypeScript detection evaluator in tests/unit/criteriaEvaluator.test.js
- [ ] T092 [P] [US2] Write unit tests for file existence evaluator in tests/unit/criteriaEvaluator.test.js
- [ ] T093 [P] [US2] Write unit tests for dependency scanning evaluator in tests/unit/criteriaEvaluator.test.js
- [ ] T094 [P] [US2] Write unit tests for confidence level assignment in tests/unit/criteriaEvaluator.test.js

### Implementation for User Story 2

- [ ] T095 [P] [US2] Create CustomCriterion model in src/models/CustomCriterion.js with validation (depends on T090)
- [ ] T096 [US2] Implement criteria evaluator service in src/services/criteriaEvaluator.js with automatic evaluation logic (depends on T091-T094)
- [ ] T097 [US2] Create CustomCriteriaForm web component in src/components/CustomCriteriaForm.js
- [ ] T098 [US2] Create CustomCriteriaDisplay web component in src/components/CustomCriteriaDisplay.js
- [ ] T099 [US2] Integrate custom criteria into EvaluationProfile model
- [ ] T100 [US2] Implement custom criteria persistence in cacheManager service
- [ ] T101 [US2] Add custom criteria to main application flow in src/main.js
- [ ] T102 [US2] Add CSS styles for custom criteria components in src/styles/components.css
- [ ] T103 [US2] Implement keyboard navigation for custom criteria form
- [ ] T104 [US2] Add ARIA labels and live regions for custom criteria results

**Checkpoint**: User Story 2 complete - Users can now add and evaluate custom criteria

---

## Phase 6: User Story 3 - Compare Projects Side-by-Side (Priority: P3)

**Goal**: Users can evaluate multiple projects simultaneously with aligned metrics for comparison

**Independent Test**: Evaluate "facebook/react" and "vuejs/vue" → See side-by-side comparison highlighting differences

### Tests for User Story 3 (TDD - Write First) ⚠️

- [ ] T105 [P] [US3] Write E2E test for adding second project for comparison in tests/e2e/comparison.spec.js
- [ ] T106 [P] [US3] Write E2E test for side-by-side metric alignment in tests/e2e/comparison.spec.js
- [ ] T107 [P] [US3] Write E2E test for visual difference highlighting in tests/e2e/comparison.spec.js
- [ ] T108 [P] [US3] Write E2E test for exporting comparison results in tests/e2e/comparison.spec.js
- [ ] T109 [P] [US3] Write E2E test for sharing comparison via URL in tests/e2e/comparison.spec.js
- [ ] T110 [P] [US3] Write unit tests for comparison data structure in tests/unit/ComparisonModel.test.js

### Implementation for User Story 3

- [ ] T111 [P] [US3] Create Comparison model in src/models/Comparison.js (depends on T110)
- [ ] T112 [US3] Create ComparisonView web component in src/components/ComparisonView.js with accessible table
- [ ] T113 [US3] Implement comparison mode in main application controller in src/main.js
- [ ] T114 [US3] Implement visual difference highlighting logic in ComparisonView component
- [ ] T115 [US3] Add export to JSON functionality in src/utils/exporters.js
- [ ] T116 [US3] Add export to CSV functionality in src/utils/exporters.js
- [ ] T117 [US3] Implement comparison URL parameter encoding in urlParams utility
- [ ] T118 [US3] Add CSS styles for comparison view in src/styles/components.css
- [ ] T119 [US3] Implement responsive design for comparison table (mobile scrolling)
- [ ] T120 [US3] Test keyboard navigation in comparison view
- [ ] T121 [US3] Add ARIA labels for comparison table headers and cells

**Checkpoint**: All user stories complete - Full feature set implemented

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T122 [P] Create architecture documentation in docs/architecture.md
- [ ] T123 [P] Create metrics guide documentation in docs/metrics-guide.md with all 18 metrics explained
- [ ] T124 [P] Write ADR for vanilla JS vs framework decision in docs/adr/001-vanilla-js-vs-framework.md
- [ ] T125 [P] Write ADR for GitHub API authentication strategy in docs/adr/002-github-api-authentication.md
- [ ] T126 [P] Write ADR for caching strategy in docs/adr/003-caching-strategy.md
- [ ] T127 [P] Optimize bundle size (code splitting, tree shaking, minification)
- [ ] T128 [P] Implement service worker for offline support in src/service-worker.js
- [ ] T129 [P] Add performance regression tests in CI/CD for bundle size and TTI
- [ ] T130 [P] Add Lighthouse CI integration in .github/workflows/ci.yml
- [ ] T131 [P] Create favicon and app icons in public/assets/
- [ ] T132 [P] Implement mobile-responsive design testing across viewports
- [ ] T133 [P] Add meta tags for SEO and social sharing in src/index.html
- [ ] T134 [P] Create GitHub Pages deployment preview environment
- [ ] T135 Run full accessibility audit with axe-core and fix issues
- [ ] T136 Run cross-browser testing (Chrome, Firefox, Safari, Edge) with Playwright
- [ ] T137 Verify ≥80% unit test coverage with coverage reports
- [ ] T138 Run performance profiling and optimize bottlenecks
- [ ] T139 Update README.md with usage examples and screenshots
- [ ] T140 Run quickstart.md validation (verify all commands work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3): No dependencies on other stories - Can start after Foundation ✅ MVP
  - US4 (Phase 4): Enhances US1, no blocking dependencies
  - US2 (Phase 5): Builds on US1, no blocking dependencies
  - US3 (Phase 6): Requires US1 complete (uses same evaluation logic)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundation (Phase 2) → BLOCKS ALL
                    ↓
        ┌───────────┼───────────┬───────────┐
        ↓           ↓           ↓           ↓
      US1 (P1)    US4 (P2)    US2 (P2)    US3 (P3)
        ↓           ↓           ↓           ↓
        └───────────┴───────────┴───────────┘
                    ↓
              Polish (Phase 7)
```

**User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- Independent test: Enter URL → View metrics ✅
- Delivers core value: Health evaluation

**User Story 4 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independent
- Independent test: Hover metric → See tooltip ✅
- Delivers educational value

**User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on evaluation but independent
- Independent test: Add custom criterion → See evaluation ✅
- Delivers customization value

**User Story 3 (P3)**: Depends on US1 evaluation logic being solid
- Independent test: Compare two repos → See side-by-side ✅
- Delivers comparison value

### Within Each User Story

- **Tests FIRST**: Write all tests for the story, verify they FAIL
- **Models**: Before services (T090 → T095, T096)
- **Services**: Before components (T096 → T097-T098)
- **Components**: Can be parallel if different files (T097 [P], T098 [P])
- **Integration**: After all components (T101)
- **Story complete**: All tests passing, independent test verified

### Parallel Opportunities

- **Setup**: All tasks T003-T015 marked [P] can run in parallel
- **Foundational**: Tasks T017-T034 marked [P] can run in parallel within groups
- **User Story Tests**: All test tasks within a story marked [P] can run in parallel (T035-T058 for US1)
- **User Story Models**: Multiple models can be created in parallel (T060 [P], T061 [P])
- **Different User Stories**: Once Foundation complete, US1/US4/US2 can work in parallel by different developers
- **Polish**: Most tasks T122-T134 marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundation phase (T016-T034) completes:

# Launch all tests for User Story 1 together (TDD - write first):
Parallel Group 1 - E2E Tests:
  T035: E2E test for URL input validation
  T036: E2E test for metrics display
  T037: E2E test for error handling
  T038: E2E test for loading indicators

Parallel Group 2 - Unit Tests (Metric Calculations):
  T039: Commit frequency test
  T040: Release cadence test
  T041: Last activity test
  T042-T057: All other metric calculation tests

Parallel Group 3 - Contract Tests:
  T058: GitHub API schema validation tests

# After tests written and FAILING:

Sequential Implementation:
  T059: Metric calculator (makes tests pass)

Parallel Group 4 - Models:
  T060: HealthScore model
  T061: EvaluationProfile model

Parallel Group 5 - Components:
  T062: MetricDisplay component
  T063: MetricCategory component
  T064: HealthScore component
  T065: RepositoryInput component
  T066: LoadingIndicator component
  T067: ErrorMessage component

Sequential Integration:
  T068: Main app controller (wires everything)
  T069: CSS styles
  T070-T072: Accessibility improvements
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T015)
2. Complete Phase 2: Foundational (T016-T034) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T035-T072)
4. **STOP and VALIDATE**: Test US1 independently
   - Enter "https://github.com/facebook/react"
   - Verify all 18 baseline metrics display correctly
   - Verify loading states, error handling, accessibility
5. Deploy MVP to GitHub Pages
6. Gather feedback before continuing

### Incremental Delivery

1. **Foundation** → Setup + Foundational complete
2. **MVP** → Add User Story 1 → Test independently → Deploy (Baseline metrics working!)
3. **Educational** → Add User Story 4 → Test independently → Deploy (Help tooltips working!)
4. **Customization** → Add User Story 2 → Test independently → Deploy (Custom criteria working!)
5. **Comparison** → Add User Story 3 → Test independently → Deploy (Full feature set!)
6. **Polish** → Phase 7 → Final deployment

Each increment adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T034)
2. **Once Foundational done, split work**:
   - Developer A: User Story 1 (T035-T072) - Core MVP
   - Developer B: User Story 4 (T073-T085) - Educational tooltips
   - Developer C: User Story 2 (T086-T104) - Custom criteria
3. **Converge**: User Story 3 (T105-T121) - Requires US1 stable
4. **Team completes Polish together** (T122-T140)

---

## Notes

- **TDD REQUIRED**: All tests MUST be written before implementation (constitutional requirement)
- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability (US1, US2, US3, US4)
- **Each user story**: Independently completable and testable
- **Tests must FAIL first**: Verify tests actually test functionality before implementing
- **Commit frequency**: After each task or logical group
- **Stop at checkpoints**: Validate story independently before proceeding
- **Accessibility**: WCAG 2.1 AA compliance verified at each story completion
- **Performance**: Bundle size and TTI verified in CI/CD

**Total Tasks**: 140
- Phase 1 (Setup): 15 tasks
- Phase 2 (Foundational): 19 tasks
- Phase 3 (US1 - MVP): 38 tasks (24 tests + 14 implementation)
- Phase 4 (US4): 13 tasks (5 tests + 8 implementation)
- Phase 5 (US2): 20 tasks (9 tests + 11 implementation)
- Phase 6 (US3): 17 tasks (6 tests + 11 implementation)
- Phase 7 (Polish): 19 tasks

**Parallel Opportunities**: 87 tasks marked [P] (62% can run in parallel)

**Test Coverage**:
- Unit tests: 44 tests (metric calculations, models, utilities)
- Integration tests: 2 tests (GitHub API, contracts)
- E2E tests: 17 tests (user journeys for all 4 stories)
- Total: 63 test tasks ensuring ≥80% coverage
