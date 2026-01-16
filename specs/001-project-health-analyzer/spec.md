# Feature Specification: Open Source Project Health Analyzer

**Feature Branch**: `001-project-health-analyzer`
**Created**: 2026-01-15
**Updated**: 2026-01-16
**Status**: Enhanced with comprehensive metrics
**Input**: User description: "Create a single page web app that can be statically hosted on github pages to evaluate various open source project health metrics of a community as well as accept user input for a specific topic, theme, capability, technology focus area, or inclusion of certain technologies to evaluate a project on. Make sure to include various baseline metrics that are considered best practice to evaluate open source projects on and then accept the user input in addition to those baseline metrics."

## Specification Summary

This specification defines a comprehensive open source project health analyzer with **72 baseline metrics** across **9 categories**:

| Category | Metric Count | Focus Area |
|----------|--------------|------------|
| Activity | 6 | Commit frequency, releases, growth trends |
| Community Health & Diversity | 10 | Contributors, diversity, engagement |
| Maintenance & Responsiveness | 8 | Issue/PR handling, response times |
| Code Quality & Development | 7 | Testing, CI/CD, code practices |
| Documentation Quality | 9 | README, guides, API docs, i18n |
| Security & Compliance | 10 | Vulnerabilities, policies, scanning |
| Governance & Sustainability | 9 | Policies, funding, leadership |
| Ecosystem & Adoption | 7 | Downloads, dependents, popularity |
| Project Maturity & Stability | 6 | Age, releases, stability |
| **Total Baseline Metrics** | **72** | **Comprehensive health assessment** |

**Implementation Approach**: Two-phase development
- **MVP Phase**: 18 core metrics (current implementation)
- **Enhanced Phase**: Full 72 metrics with advanced features

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evaluate Project Health with Standard Metrics (Priority: P1)

A developer or technical decision-maker wants to quickly assess the overall health of an open source project using industry-standard metrics before deciding whether to adopt, contribute to, or depend on it.

**Why this priority**: This is the core value proposition - providing instant visibility into project health using established best practices. Without this, the tool has no purpose.

**Independent Test**: Can be fully tested by entering a GitHub repository URL and viewing a comprehensive health report with all baseline metrics displayed clearly.

**Acceptance Scenarios**:

1. **Given** the analyzer is loaded in the browser, **When** a user enters a valid GitHub repository URL (e.g., "https://github.com/facebook/react"), **Then** the system displays a health report showing all baseline metrics (activity, community, maintenance, documentation)
2. **Given** the analyzer is loaded, **When** a user enters an invalid repository URL or a repository that doesn't exist, **Then** the system displays a clear error message explaining the issue
3. **Given** a health report is displayed, **When** a user views the metrics, **Then** each metric includes a score/indicator, explanation of what it measures, and why it matters
4. **Given** metric data is being fetched, **When** the operation takes longer than 2 seconds, **Then** the system displays a loading indicator with progress feedback

---

### User Story 2 - Add Custom Evaluation Criteria (Priority: P2)

A user wants to evaluate a project based on specific criteria important to their use case (e.g., TypeScript usage, specific technology stack, security practices, license type) in addition to standard health metrics.

**Why this priority**: This differentiates the tool from basic health checkers - allowing customization for specific decision-making contexts (security-focused orgs, specific tech stacks, compliance requirements).

**Independent Test**: Can be tested independently by first viewing standard metrics (Story 1), then adding custom criteria (e.g., "Must use TypeScript", "Must have security policy"), and seeing those criteria evaluated and displayed alongside baseline metrics.

**Acceptance Scenarios**:

1. **Given** a project health report is displayed, **When** a user adds a custom criterion (e.g., "Has SECURITY.md file"), **Then** the system evaluates that criterion and displays the result (pass/fail/score) with supporting evidence
2. **Given** the custom criteria input form, **When** a user enters multiple criteria of different types (technology, theme, capability), **Then** all criteria are evaluated and results are organized clearly
3. **Given** custom criteria have been added, **When** a user saves or bookmarks the page, **Then** the custom criteria are preserved for future use
4. **Given** a user has added custom criteria, **When** they want to modify or remove a criterion, **Then** they can edit or delete individual criteria without losing other customizations

---

### User Story 3 - Compare Projects Side-by-Side (Priority: P3)

A user wants to evaluate and compare multiple projects simultaneously to make an informed choice between competing alternatives (e.g., React vs Vue, Express vs Fastify).

**Why this priority**: Enhances decision-making by allowing direct comparison, but builds on the foundation of single-project evaluation. Not required for MVP but significantly increases value.

**Independent Test**: Can be tested by evaluating two or more projects with the same baseline and custom criteria, then viewing them in a comparison view that highlights differences.

**Acceptance Scenarios**:

1. **Given** one project has been evaluated, **When** a user adds a second project for comparison, **Then** both projects are displayed side-by-side with aligned metrics for easy comparison
2. **Given** multiple projects are being compared, **When** custom criteria have been defined, **Then** all projects are evaluated against the same criteria for fair comparison
3. **Given** a comparison view is displayed, **When** metrics differ significantly between projects, **Then** differences are visually highlighted to draw attention
4. **Given** multiple projects are being compared, **When** a user wants to export or share the comparison, **Then** the comparison can be saved or shared via URL

---

### User Story 4 - Understand Metric Meanings and Thresholds (Priority: P2)

A user who is not familiar with open source health metrics wants to understand what each metric means, why it matters, and what constitutes a "good" vs "poor" score.

**Why this priority**: Educational value ensures the tool is accessible to users with varying levels of open source expertise. Critical for adoption beyond expert users.

**Independent Test**: Can be tested by viewing any metric and accessing detailed explanations, benchmark thresholds, and contextual help without leaving the main interface.

**Acceptance Scenarios**:

1. **Given** a health report is displayed, **When** a user hovers over or clicks a metric name, **Then** a tooltip or modal displays a clear explanation of what the metric measures and why it's important
2. **Given** a metric score is shown (e.g., "75/100" or "Good"), **When** a user views the score, **Then** threshold indicators show what ranges constitute poor/fair/good/excellent
3. **Given** a user is viewing metric explanations, **When** they want to learn more, **Then** links to authoritative resources or documentation are provided
4. **Given** a complex metric (e.g., bus factor), **When** a user views the explanation, **Then** the explanation includes concrete examples and calculation methodology

---

### Edge Cases

- What happens when a repository is private or requires authentication?
- What happens when GitHub API rate limits are exceeded?
- How does the system handle very large repositories with thousands of contributors?
- What happens when repository data is incomplete (e.g., no README, no releases)?
- How does the system handle custom criteria that cannot be automatically evaluated?
- What happens when a repository is archived or deleted between evaluations?
- How does the system handle repositories on platforms other than GitHub (GitLab, Bitbucket)?
- What happens when network connectivity is lost during evaluation?
- How does the system handle simultaneous evaluation of many repositories (performance)?

## Requirements *(mandatory)*

### Functional Requirements

**Baseline Metrics Evaluation - Activity (6 metrics)**

- **FR-001**: System MUST evaluate commit frequency (average commits per week over last 90 days)
- **FR-002**: System MUST evaluate release cadence (average days between releases)
- **FR-003**: System MUST evaluate time since last commit to default branch
- **FR-004**: System MUST evaluate deployment frequency (release velocity trends)
- **FR-005**: System MUST evaluate community growth trends (star/fork/watcher growth rate)
- **FR-006**: System MUST evaluate issue triage time (time from creation to first label/assignment)

**Baseline Metrics Evaluation - Community Health & Diversity (10 metrics)**

- **FR-007**: System MUST evaluate total contributor count
- **FR-008**: System MUST evaluate new contributors in last 90 days
- **FR-009**: System MUST evaluate contributor churn rate (contributors who stop after first contribution)
- **FR-010**: System MUST evaluate first-time contributor success rate (PR merge rate for first-time contributors)
- **FR-011**: System MUST evaluate geographic/organizational diversity (distribution across companies/countries)
- **FR-012**: System MUST evaluate discussion activity (GitHub Discussions, forum engagement)
- **FR-013**: System MUST evaluate maintainer response patterns (coverage across time zones, weekends)
- **FR-014**: System MUST evaluate pull request merge rate (percentage of PRs merged)
- **FR-015**: System MUST evaluate PR close rate (percentage of PRs closed without merging)
- **FR-016**: System MUST evaluate bus factor (contributors accounting for 50% of commits)

**Baseline Metrics Evaluation - Maintenance & Responsiveness (8 metrics)**

- **FR-017**: System MUST evaluate open vs closed issues ratio
- **FR-018**: System MUST evaluate issue response time (median time to first response)
- **FR-019**: System MUST evaluate stale issues percentage (no activity in 90+ days)
- **FR-020**: System MUST evaluate average time to close issues
- **FR-021**: System MUST evaluate code review velocity (time from PR submission to first review)
- **FR-022**: System MUST evaluate average PR review time (time to merge)
- **FR-023**: System MUST evaluate issue resolution rate (percentage of issues closed)
- **FR-024**: System MUST evaluate time to first commit for new contributors (onboarding speed)

**Baseline Metrics Evaluation - Code Quality & Development Practices (7 metrics)**

- **FR-025**: System MUST evaluate test coverage percentage (if available via badges or API)
- **FR-026**: System MUST evaluate CI/CD pipeline presence and health (workflow files, success rate)
- **FR-027**: System MUST evaluate dependency health (outdated or vulnerable dependencies)
- **FR-028**: System MUST evaluate code complexity indicators (language-specific linting configurations)
- **FR-029**: System MUST evaluate PR size distribution (percentage of small/medium/large PRs)
- **FR-030**: System MUST evaluate code review practices (required reviewers, branch protection)
- **FR-031**: System MUST evaluate automated testing presence (test files, CI test jobs)

**Baseline Metrics Evaluation - Documentation Quality (9 metrics)**

- **FR-032**: System MUST evaluate README quality score (completeness, structure, badges)
- **FR-033**: System MUST evaluate documentation directory presence (/docs, /documentation)
- **FR-034**: System MUST evaluate wiki presence and activity
- **FR-035**: System MUST evaluate API documentation completeness (if applicable)
- **FR-036**: System MUST evaluate tutorial/guide presence (getting started, examples)
- **FR-037**: System MUST evaluate changelog maintenance (regular, detailed updates)
- **FR-038**: System MUST evaluate migration guide presence (version upgrade docs)
- **FR-039**: System MUST evaluate architecture documentation (system design docs)
- **FR-040**: System MUST evaluate internationalization support (multi-language docs)

**Baseline Metrics Evaluation - Security & Compliance (10 metrics)**

- **FR-041**: System MUST evaluate SECURITY.md presence
- **FR-042**: System MUST evaluate security policy completeness
- **FR-043**: System MUST evaluate vulnerability response time (CVE history analysis)
- **FR-044**: System MUST evaluate OpenSSF Scorecard score (if available)
- **FR-045**: System MUST evaluate security audit history indicators
- **FR-046**: System MUST evaluate dependency scanning status (Dependabot, Snyk integration)
- **FR-047**: System MUST evaluate CVE history (known vulnerabilities and resolution)
- **FR-048**: System MUST evaluate SBOM availability (Software Bill of Materials)
- **FR-049**: System MUST evaluate code scanning alerts status (CodeQL, other tools)
- **FR-050**: System MUST evaluate security best practices (2FA requirement, signed commits)

**Baseline Metrics Evaluation - Governance & Sustainability (9 metrics)**

- **FR-051**: System MUST evaluate CODE_OF_CONDUCT.md presence
- **FR-052**: System MUST evaluate CONTRIBUTING.md presence and quality
- **FR-053**: System MUST evaluate LICENSE file presence
- **FR-054**: System MUST evaluate governance model documentation
- **FR-055**: System MUST evaluate roadmap presence and activity
- **FR-056**: System MUST evaluate funding/sponsorship status (GitHub Sponsors, OpenCollective)
- **FR-057**: System MUST evaluate trademark/IP clarity (ownership documentation)
- **FR-058**: System MUST evaluate corporate backing indicators (foundation, company support)
- **FR-059**: System MUST evaluate steering committee or governance structure

**Baseline Metrics Evaluation - Ecosystem & Adoption (7 metrics)**

- **FR-060**: System MUST evaluate package registry presence (npm, PyPI, Maven Central)
- **FR-061**: System MUST evaluate download statistics (package installation counts)
- **FR-062**: System MUST evaluate dependent repositories (projects using this dependency)
- **FR-063**: System MUST evaluate integration examples presence (sample implementations)
- **FR-064**: System MUST evaluate third-party integrations (ecosystem tools)
- **FR-065**: System MUST evaluate stars/forks/watchers as popularity indicators
- **FR-066**: System MUST evaluate community sentiment (positive/negative issue/PR tone)

**Baseline Metrics Evaluation - Project Maturity & Stability (6 metrics)**

- **FR-067**: System MUST evaluate repository age
- **FR-068**: System MUST evaluate number of releases
- **FR-069**: System MUST evaluate breaking change frequency (SemVer major version changes)
- **FR-070**: System MUST evaluate LTS policy presence (long-term support documentation)
- **FR-071**: System MUST evaluate deprecation process documentation
- **FR-072**: System MUST evaluate version numbering consistency (SemVer compliance)

**Custom Criteria Evaluation**

- **FR-073**: Users MUST be able to add custom evaluation criteria for technology focus areas (e.g., "Uses TypeScript", "Has GraphQL API")
- **FR-074**: Users MUST be able to add custom criteria for project themes (e.g., "Accessibility-focused", "Performance-oriented")
- **FR-075**: Users MUST be able to add custom criteria for capabilities (e.g., "Supports internationalization", "Has CLI interface")
- **FR-076**: Users MUST be able to add custom criteria for specific technology inclusion/exclusion (e.g., "Must use Docker", "Avoid jQuery")
- **FR-077**: System MUST automatically evaluate custom criteria where possible (e.g., checking for file existence, scanning dependencies)
- **FR-078**: System MUST allow manual evaluation for criteria that cannot be automatically assessed
- **FR-079**: System MUST display confidence level for each custom criterion evaluation (definite/likely/manual review needed)

**Data Presentation & UX**

- **FR-080**: System MUST display an overall health score or grade that summarizes all baseline metrics
- **FR-081**: System MUST organize metrics into logical categories (Activity, Community, Maintenance, Documentation, Security, Code Quality, Ecosystem, Maturity, Governance)
- **FR-082**: System MUST provide visual indicators (colors, icons, progress bars) to communicate metric status at a glance
- **FR-083**: System MUST display trend information where applicable (improving/stable/declining)
- **FR-084**: System MUST show raw metric values alongside interpreted scores (e.g., "15 contributors - Good")
- **FR-085**: System MUST provide contextual help for each metric explaining its meaning and importance
- **FR-086**: System MUST display timestamps showing when data was last fetched
- **FR-087**: System MUST handle and display error states gracefully (API failures, missing data, invalid input)
- **FR-088**: System MUST support filtering/toggling metric categories for focused analysis
- **FR-089**: System MUST provide metric prioritization options (critical, recommended, optional)
- **FR-090**: System MUST display confidence indicators for each metric (high, medium, low)

**Static Hosting & Performance**

- **FR-091**: Application MUST function as a single-page app without requiring server-side processing
- **FR-092**: Application MUST be hostable on GitHub Pages as static files
- **FR-093**: Application MUST load and become interactive within 3 seconds on a standard broadband connection
- **FR-094**: Application MUST handle GitHub API authentication via personal access token (user-provided)
- **FR-095**: Application MUST cache evaluation results locally to reduce API calls and improve performance
- **FR-096**: Application MUST warn users about GitHub API rate limits and show remaining quota
- **FR-097**: Application MUST implement progressive loading for metrics (show results as they're calculated)
- **FR-098**: Application MUST support offline viewing of previously cached evaluations

**Data Persistence & Sharing**

- **FR-099**: Application MUST allow users to bookmark or save evaluations via URL parameters
- **FR-100**: Application MUST allow users to export evaluation results as JSON or CSV
- **FR-101**: Application MUST store user preferences and custom criteria definitions in browser local storage
- **FR-102**: Application MUST support sharing evaluations via shareable URLs that include repository and custom criteria
- **FR-103**: Application MUST support exporting reports in multiple formats (Markdown, HTML, PDF)
- **FR-104**: Application MUST allow saving and loading metric configuration profiles

### Assumptions

- Users will primarily evaluate repositories hosted on GitHub (initial version)
- Users have basic understanding of open source development concepts
- Users accessing the tool have modern web browsers with JavaScript enabled
- GitHub public API is available and accessible to users
- Users can obtain GitHub personal access tokens if they need higher rate limits
- Most repositories being evaluated are public (private repo support is future enhancement)
- Evaluation criteria are primarily boolean or scored on a simple scale
- Single-page app limitations are acceptable (no backend persistence required initially)

### Key Entities

- **Repository**: An open source project to be evaluated, identified by owner and name, containing metadata like URL, description, language, stars, forks, creation date, last update date, and ecosystem information
- **Baseline Metric**: A standard health indicator with a name, category, score/value, explanation, threshold definitions, data sources, confidence level, and priority tier (critical/recommended/optional)
- **Custom Criterion**: A user-defined evaluation rule with a description, evaluation type (automatic/manual), result (pass/fail/score), confidence level, supporting evidence, and validation status
- **Evaluation Profile**: A saved configuration containing repository identifier, baseline metrics to include/exclude, custom criteria definitions, evaluation timestamp, sharing identifier, and metric prioritization settings
- **Metric Category**: A grouping of related metrics with the following categories:
  - Activity (6 metrics)
  - Community Health & Diversity (10 metrics)
  - Maintenance & Responsiveness (8 metrics)
  - Code Quality & Development Practices (7 metrics)
  - Documentation Quality (9 metrics)
  - Security & Compliance (10 metrics)
  - Governance & Sustainability (9 metrics)
  - Ecosystem & Adoption (7 metrics)
  - Project Maturity & Stability (6 metrics)
- **Health Score**: An aggregate score derived from baseline metrics, displayed as numerical value (0-100), letter grade (A-F), category breakdown, trend indicator (improving/stable/declining), and confidence score
- **Metric Priority**: Classification system for metrics (Critical, Recommended, Optional) to guide users on which metrics are most important for decision-making
- **Data Source**: Information about where metric data comes from (GitHub API endpoint, external API, badge parsing, file analysis) with caching and freshness indicators

## Success Criteria *(mandatory)*

### Measurable Outcomes

**MVP Phase (Initial 18 Baseline Metrics)**

- **SC-001**: Users can evaluate a repository's health within 10 seconds of entering the repository URL
- **SC-002**: System displays at least 18 industry-standard baseline metrics across 5 core categories (Activity, Community, Maintenance, Documentation, Security & Governance)
- **SC-003**: Users can add and evaluate at least 5 custom criteria without technical expertise
- **SC-004**: 90% of automatically evaluated custom criteria produce accurate results verified against manual inspection
- **SC-005**: Application loads and becomes interactive in under 3 seconds on a 10 Mbps connection
- **SC-006**: Application remains functional when hosted on GitHub Pages with zero server-side dependencies
- **SC-007**: Users can share evaluations via URL and recipients see identical results
- **SC-008**: Application handles GitHub API rate limits gracefully without crashes or data loss
- **SC-009**: 80% of users can understand metric meanings without external documentation based on in-app explanations
- **SC-010**: Application correctly evaluates repositories with varying sizes (10 to 10,000 contributors) without performance degradation
- **SC-011**: Custom evaluation criteria persist across browser sessions for 95% of users
- **SC-012**: Error states provide actionable guidance to users in 100% of failure scenarios

**Enhanced Phase (Full 72 Baseline Metrics)**

- **SC-013**: System displays all 72 industry-standard baseline metrics across 9 comprehensive categories
- **SC-014**: Critical metrics (security, code quality, governance) are clearly prioritized and highlighted
- **SC-015**: Users can filter and toggle metric categories to focus analysis on specific areas
- **SC-016**: System successfully retrieves and displays ecosystem metrics (downloads, dependencies, integrations) for 80% of evaluated repositories
- **SC-017**: Security metrics (OpenSSF Scorecard, CVE history, dependency scanning) are accurate for 90% of repositories where data is available
- **SC-018**: Code quality metrics (test coverage, CI/CD, complexity) are extracted correctly for 75% of repositories
- **SC-019**: Progressive loading shows initial results within 3 seconds and completes full evaluation within 15 seconds
- **SC-020**: Metric confidence indicators accurately reflect data reliability (high/medium/low) for 95% of metrics
- **SC-021**: Category health scores are calculated correctly using weighted aggregation for all 9 categories
- **SC-022**: Trend indicators (improving/stable/declining) are displayed for applicable metrics based on historical data
- **SC-023**: Users can export comprehensive reports in multiple formats (JSON, CSV, Markdown) with 100% data fidelity
- **SC-024**: Offline viewing of cached evaluations works for 100% of previously loaded repositories
- **SC-025**: Metric configuration profiles can be saved and loaded successfully for 100% of use cases
- **SC-026**: Application provides accurate data freshness timestamps for all metrics
- **SC-027**: GitHub API quota usage is optimized to evaluate 50+ repositories per hour without hitting rate limits (unauthenticated)
- **SC-028**: Application successfully handles repositories with missing or incomplete data gracefully for 100% of cases

## Implementation Phasing

### Phase 1: MVP (18 Core Baseline Metrics)

**Scope**: Deliver functional analyzer with essential metrics to validate core concept and user workflows.

**Baseline Metrics (18 total)**:
- **Activity (3)**: Commit frequency, release cadence, last activity
- **Community (3)**: Contributor count, new contributors, PR merge rate
- **Maintenance (4)**: Open issues ratio, issue response time, stale issues, average time to close
- **Documentation (3)**: README quality, docs directory, wiki presence
- **Security & Governance (5)**: Security policy, code of conduct, contributing guidelines, license, bus factor

**Features**:
- Single repository evaluation
- Basic custom criteria (manual evaluation)
- URL sharing
- Local storage caching
- Export to JSON/CSV
- GitHub Pages deployment
- Responsive UI with accessibility (WCAG 2.1 AA)

**API Requirements**:
- GitHub REST API v3 (no GraphQL)
- Unauthenticated access (rate limit: 60 req/hour)
- Optional token authentication (5000 req/hour)

**Success Criteria**: SC-001 through SC-012

---

### Phase 2: Enhanced (Full 72 Baseline Metrics)

**Scope**: Comprehensive health assessment with advanced metrics and features.

**Additional Baseline Metrics (54 new metrics)**:
- **Activity (3 new)**: Deployment frequency, community growth trends, issue triage time
- **Community (7 new)**: Churn rate, first-time contributor success, diversity metrics, discussion activity, maintainer patterns, PR close rate
- **Maintenance (4 new)**: Code review velocity, average PR review time, issue resolution rate, time to first commit
- **Code Quality (7 new)**: Test coverage, CI/CD health, dependency health, code complexity, PR size distribution, code review practices, automated testing
- **Documentation (6 new)**: API docs, tutorials, changelog, migration guides, architecture docs, i18n support
- **Security (5 new)**: Vulnerability response time, OpenSSF Scorecard, security audits, dependency scanning, CVE history
- **Governance (4 new)**: Governance model, roadmap, funding status, corporate backing
- **Ecosystem (7 new)**: Package registry presence, download stats, dependent repos, integration examples, third-party integrations, popularity metrics, sentiment analysis
- **Maturity (6 new)**: Repository age, release count, breaking change frequency, LTS policy, deprecation process, SemVer compliance

**Advanced Features**:
- Progressive metric loading
- Metric prioritization (critical/recommended/optional)
- Category filtering and toggling
- Trend indicators (improving/stable/declining)
- Confidence scoring (high/medium/low)
- Advanced custom criteria (automatic evaluation via API)
- Side-by-side repository comparison (User Story 3)
- Metric configuration profiles
- Export to Markdown/HTML/PDF
- Offline viewing
- Historical data tracking
- OpenSSF Scorecard integration
- Package registry API integration (npm, PyPI, Maven Central)
- GitHub GraphQL API for performance optimization

**External API Integrations**:
- OpenSSF Scorecard API
- Libraries.io API (download stats, dependents)
- npm Registry API
- PyPI API
- Maven Central API
- Badge parsing (shields.io, codecov.io)

**Success Criteria**: SC-013 through SC-028

---

### Implementation Priority Matrix

| Priority | Metrics | Rationale |
|----------|---------|-----------|
| **Critical (MVP)** | 18 core metrics | Essential for basic health assessment, proven industry standards |
| **High** | Security & Code Quality (12) | Critical for production dependency decisions, security-focused organizations |
| **Medium** | Ecosystem & Adoption (7) | Important for popularity/adoption validation, requires external APIs |
| **Low** | Advanced Governance (4) | Nice-to-have for enterprise evaluation, often requires manual review |

### Technical Complexity Assessment

| Metric Category | Complexity | API Calls | External Dependencies |
|-----------------|------------|-----------|----------------------|
| Activity | Low | 3-5 | GitHub API only |
| Community (basic) | Low | 2-4 | GitHub API only |
| Maintenance | Low | 3-5 | GitHub API only |
| Documentation | Low | 2-4 | GitHub API + file parsing |
| Security & Governance (basic) | Low | 1-2 | GitHub API only |
| **MVP Subtotal** | **Low** | **15-25** | **GitHub only** |
| Community (advanced) | Medium | 5-10 | GitHub API + analysis |
| Code Quality | High | 3-5 | GitHub + badge parsing + CI analysis |
| Security (advanced) | High | 2-5 | OpenSSF API + CVE databases |
| Ecosystem | High | 5-15 | Libraries.io, package registries |
| Maturity | Medium | 2-4 | GitHub API + analysis |
| **Enhanced Subtotal** | **High** | **32-64** | **Multiple external APIs** |
