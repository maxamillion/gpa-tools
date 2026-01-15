# Feature Specification: Open Source Project Health Analyzer

**Feature Branch**: `001-project-health-analyzer`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Create a single page web app that can be statically hosted on github pages to evaluate various open source project health metrics of a community as well as accept user input for a specific topic, theme, capability, technology focus area, or inclusion of certain technologies to evaluate a project on. Make sure to include various baseline metrics that are considered best practice to evaluate open source projects on and then accept the user input in addition to those baseline metrics."

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

**Baseline Metrics Evaluation**

- **FR-001**: System MUST evaluate repository activity metrics including commit frequency, release cadence, and time since last commit
- **FR-002**: System MUST evaluate community engagement metrics including contributor count, issue response time, and pull request merge rate
- **FR-003**: System MUST evaluate maintenance health metrics including open vs closed issues ratio, stale issue percentage, and average time to close issues
- **FR-004**: System MUST evaluate documentation quality indicators including README presence, documentation directory, and code comment density
- **FR-005**: System MUST evaluate repository maturity metrics including age, number of releases, and version stability
- **FR-006**: System MUST evaluate bus factor (contributor concentration risk) by analyzing commit distribution
- **FR-007**: System MUST evaluate community responsiveness by measuring median response time to issues and pull requests
- **FR-008**: System MUST evaluate security posture including presence of SECURITY.md, dependabot alerts, and security policy

**Custom Criteria Evaluation**

- **FR-009**: Users MUST be able to add custom evaluation criteria for technology focus areas (e.g., "Uses TypeScript", "Has GraphQL API")
- **FR-010**: Users MUST be able to add custom criteria for project themes (e.g., "Accessibility-focused", "Performance-oriented")
- **FR-011**: Users MUST be able to add custom criteria for capabilities (e.g., "Supports internationalization", "Has CLI interface")
- **FR-012**: Users MUST be able to add custom criteria for specific technology inclusion/exclusion (e.g., "Must use Docker", "Avoid jQuery")
- **FR-013**: System MUST automatically evaluate custom criteria where possible (e.g., checking for file existence, scanning dependencies)
- **FR-014**: System MUST allow manual evaluation for criteria that cannot be automatically assessed
- **FR-015**: System MUST display confidence level for each custom criterion evaluation (definite/likely/manual review needed)

**Data Presentation & UX**

- **FR-016**: System MUST display an overall health score or grade that summarizes all baseline metrics
- **FR-017**: System MUST organize metrics into logical categories (Activity, Community, Maintenance, Documentation, Security)
- **FR-018**: System MUST provide visual indicators (colors, icons, progress bars) to communicate metric status at a glance
- **FR-019**: System MUST display trend information where applicable (improving/stable/declining)
- **FR-020**: System MUST show raw metric values alongside interpreted scores (e.g., "15 contributors - Good")
- **FR-021**: System MUST provide contextual help for each metric explaining its meaning and importance
- **FR-022**: System MUST display timestamps showing when data was last fetched
- **FR-023**: System MUST handle and display error states gracefully (API failures, missing data, invalid input)

**Static Hosting & Performance**

- **FR-024**: Application MUST function as a single-page app without requiring server-side processing
- **FR-025**: Application MUST be hostable on GitHub Pages as static files
- **FR-026**: Application MUST load and become interactive within 3 seconds on a standard broadband connection
- **FR-027**: Application MUST handle GitHub API authentication via personal access token (user-provided)
- **FR-028**: Application MUST cache evaluation results locally to reduce API calls and improve performance
- **FR-029**: Application MUST warn users about GitHub API rate limits and show remaining quota

**Data Persistence & Sharing**

- **FR-030**: Application MUST allow users to bookmark or save evaluations via URL parameters
- **FR-031**: Application MUST allow users to export evaluation results as JSON or CSV
- **FR-032**: Application MUST store user preferences and custom criteria definitions in browser local storage
- **FR-033**: Application MUST support sharing evaluations via shareable URLs that include repository and custom criteria

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

- **Repository**: An open source project to be evaluated, identified by owner and name, containing metadata like URL, description, language, stars, forks, creation date, and last update date
- **Baseline Metric**: A standard health indicator with a name, category, score/value, explanation, threshold definitions, and data sources
- **Custom Criterion**: A user-defined evaluation rule with a description, evaluation type (automatic/manual), result (pass/fail/score), confidence level, and supporting evidence
- **Evaluation Profile**: A saved configuration containing repository identifier, baseline metrics to include, custom criteria definitions, evaluation timestamp, and sharing identifier
- **Metric Category**: A grouping of related metrics (Activity, Community, Maintenance, Documentation, Security) for organizational clarity
- **Health Score**: An aggregate score derived from baseline metrics, displayed as numerical value, grade, and trend indicator

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can evaluate a repository's health within 10 seconds of entering the repository URL
- **SC-002**: System displays at least 15 industry-standard baseline metrics across 5 categories
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
