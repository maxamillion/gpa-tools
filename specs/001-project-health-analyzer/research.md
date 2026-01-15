# Research: Open Source Project Health Analyzer

**Feature**: Open Source Project Health Analyzer
**Branch**: 001-project-health-analyzer
**Date**: 2026-01-15

## Overview

This document contains research findings for technology choices, best practices, and architectural decisions for the project health analyzer application.

## 1. JavaScript Framework vs Vanilla JavaScript

### Decision: Vanilla JavaScript (ES2022+) with minimal dependencies

### Rationale:
- **Bundle Size**: Framework overhead (React ~45KB, Vue ~35KB) consumes significant portion of 500KB budget
- **Static Hosting**: No build complexity needed for GitHub Pages deployment
- **Performance**: Native DOM manipulation sufficient for this UI complexity level
- **Learning Curve**: More accessible to contributors familiar with web fundamentals
- **TDD**: Easier to test pure functions without framework-specific testing utilities

### Alternatives Considered:
- **React**: Rejected due to bundle size overhead and unnecessary complexity for this scope
- **Vue**: Rejected for same reasons, though lighter than React
- **Svelte**: Considered seriously (compiles to vanilla JS), but adds build complexity
- **Lit (Web Components)**: Good alternative, but adds learning curve for contributors

### Implementation Approach:
- Use ES6 modules for code organization
- Web Components for reusable UI elements (native browser support)
- Event delegation for efficient event handling
- Template literals for HTML generation (no JSX needed)

### References:
- [You Might Not Need a Framework](https://github.com/you-dont-need/You-Dont-Need-A-JavaScript-Framework)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

---

## 2. GitHub API Integration Strategy

### Decision: GitHub REST API v3 with Octokit.js client library

### Rationale:
- **REST API v3**: Mature, well-documented, sufficient for our needs
- **Octokit.js Core**: Lightweight client (~15KB) with auth handling and rate limiting built-in
- **GraphQL**: Not needed - REST endpoints cover all required data without complexity
- **Authentication**: Support both anonymous (60 req/hr) and personal access token (5000 req/hr)

### API Endpoints Required:

**Repository Data**:
- `GET /repos/{owner}/{repo}` - Basic repo info, stats
- `GET /repos/{owner}/{repo}/contributors` - Contributor list
- `GET /repos/{owner}/{repo}/commits` - Commit history (paginated)
- `GET /repos/{owner}/{repo}/releases` - Release data
- `GET /repos/{owner}/{repo}/issues` - Issue statistics
- `GET /repos/{owner}/{repo}/pulls` - Pull request data
- `GET /repos/{owner}/{repo}/community/profile` - Community health metrics

**Rate Limiting**:
- `GET /rate_limit` - Check remaining quota
- Implement exponential backoff for 429 responses
- Cache responses aggressively (localStorage + TTL)

### Authentication Strategy:
1. **Anonymous Mode**: Default, 60 requests/hour
2. **Token Mode**: User provides personal access token via secure input
3. **Token Storage**: Store encrypted in localStorage (Web Crypto API)
4. **Scope Requirements**: Only `public_repo` scope needed (read-only)

### References:
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Octokit.js Documentation](https://github.com/octokit/octokit.js)
- [Rate Limiting Best Practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators#dealing-with-rate-limits)

---

## 3. Baseline Metrics Definitions

### Decision: Implement 18 industry-standard OSS health metrics across 5 categories

### Research Sources:
- [CHAOSS Project](https://chaoss.community/) - Community Health Analytics OSS
- [GitHub Insights](https://docs.github.com/en/communities)
- [Linux Foundation Core Infrastructure Initiative](https://www.coreinfrastructure.org/programs/badge-program/)

### Metric Categories and Definitions:

#### Category 1: Activity Metrics
1. **Commit Frequency**
   - **Calculation**: Commits per week (last 90 days average)
   - **Thresholds**: Excellent > 20/week, Good 5-20, Fair 1-5, Poor < 1
   - **Why it matters**: Indicates active development

2. **Release Cadence**
   - **Calculation**: Days between releases (last 5 releases average)
   - **Thresholds**: Excellent < 30 days, Good 30-90, Fair 90-180, Poor > 180
   - **Why it matters**: Shows maintenance commitment

3. **Last Activity**
   - **Calculation**: Days since last commit
   - **Thresholds**: Excellent < 7 days, Good 7-30, Fair 30-90, Poor > 90
   - **Why it matters**: Detects abandoned projects

#### Category 2: Community Metrics
4. **Contributor Count**
   - **Calculation**: Unique contributors (all time)
   - **Thresholds**: Excellent > 50, Good 10-50, Fair 3-10, Poor < 3
   - **Why it matters**: Indicates community size

5. **New Contributors (90 days)**
   - **Calculation**: Contributors with first commit in last 90 days
   - **Thresholds**: Excellent > 5, Good 2-5, Fair 1-2, Poor 0
   - **Why it matters**: Shows community growth

6. **PR Merge Rate**
   - **Calculation**: (Merged PRs / Total PRs) × 100%
   - **Thresholds**: Excellent > 70%, Good 50-70%, Fair 30-50%, Poor < 30%
   - **Why it matters**: Indicates welcoming maintainers

#### Category 3: Maintenance Metrics
7. **Open Issues Ratio**
   - **Calculation**: Open issues / (Open + Closed issues)
   - **Thresholds**: Excellent < 20%, Good 20-40%, Fair 40-60%, Poor > 60%
   - **Why it matters**: Shows issue management health

8. **Issue Response Time**
   - **Calculation**: Median time to first response (hours)
   - **Thresholds**: Excellent < 24hrs, Good 24-72hrs, Fair 72-168hrs, Poor > 168hrs
   - **Why it matters**: Indicates maintainer responsiveness

9. **Stale Issues Percentage**
   - **Calculation**: (Issues inactive > 90 days / Total open issues) × 100%
   - **Thresholds**: Excellent < 10%, Good 10-25%, Fair 25-50%, Poor > 50%
   - **Why it matters**: Shows maintenance attention

10. **Average Time to Close**
    - **Calculation**: Mean time from issue creation to close (days)
    - **Thresholds**: Excellent < 7 days, Good 7-30, Fair 30-90, Poor > 90
    - **Why it matters**: Shows efficiency

#### Category 4: Documentation Metrics
11. **README Quality Score**
    - **Calculation**: Points for: Length > 500 chars (1), Installation section (1), Usage examples (1), Badges (1), TOC (1)
    - **Thresholds**: Excellent 5 points, Good 4, Fair 3, Poor < 3
    - **Why it matters**: First impression quality

12. **Documentation Directory**
    - **Calculation**: Boolean - has /docs or /documentation directory
    - **Thresholds**: Pass/Fail
    - **Why it matters**: Indicates formal documentation

13. **Wiki Presence**
    - **Calculation**: Boolean - has wiki enabled with content
    - **Thresholds**: Pass/Fail
    - **Why it matters**: Additional documentation resources

#### Category 5: Security & Governance
14. **Security Policy**
    - **Calculation**: Boolean - has SECURITY.md file
    - **Thresholds**: Pass/Fail
    - **Why it matters**: Shows security consciousness

15. **Code of Conduct**
    - **Calculation**: Boolean - has CODE_OF_CONDUCT.md
    - **Thresholds**: Pass/Fail
    - **Why it matters**: Welcoming community indicator

16. **Contributing Guidelines**
    - **Calculation**: Boolean - has CONTRIBUTING.md
    - **Thresholds**: Pass/Fail
    - **Why it matters**: Lowers contributor barrier

17. **License**
    - **Calculation**: Boolean - has recognized OSI-approved license
    - **Thresholds**: Pass/Fail
    - **Why it matters**: Legal clarity for usage

18. **Bus Factor**
    - **Calculation**: Minimum number of contributors accounting for 50% of commits
    - **Thresholds**: Excellent > 5, Good 3-5, Fair 2, Poor 1
    - **Why it matters**: Concentration risk

### References:
- [CHAOSS Metrics](https://chaoss.community/metrics/)
- [Best Practices Badge Criteria](https://www.coreinfrastructure.org/programs/badge-program/)

---

## 4. Caching Strategy

### Decision: Multi-layer caching with localStorage + service worker

### Rationale:
- **GitHub API Rate Limits**: Must minimize API calls to stay within quota
- **Performance**: Instant results for previously evaluated repos
- **Offline Support**: Service worker enables offline-first experience

### Caching Layers:

**Layer 1: Memory Cache** (session-scoped)
- In-memory JavaScript object for active session
- Fastest access, cleared on page reload
- Use for current evaluation data

**Layer 2: localStorage** (persistent)
- Cache GitHub API responses with TTL (Time To Live)
- Default TTL: 1 hour for volatile data (issues, PRs), 24 hours for stable data (contributors, commits)
- Max storage: ~5MB (monitor and evict LRU if needed)
- Store: Repository metadata, metric calculations, custom criteria

**Layer 3: Service Worker** (offline support)
- Cache static assets (HTML, CSS, JS, fonts, icons)
- Cache API responses with stale-while-revalidate strategy
- Enable offline mode with cached data

### Cache Invalidation:
- Manual refresh button (force new API calls)
- Automatic refresh if cached data > TTL
- Clear cache button in settings
- Version-based invalidation on app updates

### Cache Keys:
```javascript
// Example cache key structure
const cacheKey = `repo:${owner}/${name}:${dataType}:${version}`;
// Example: "repo:facebook/react:contributors:v1"
```

### References:
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [localStorage Best Practices](https://web.dev/storage-for-the-web/)

---

## 5. Testing Strategy

### Decision: Vitest + Playwright + Custom GitHub API Mocks

### Rationale:
- **Vitest**: Fast Vite-native test runner, excellent DX, ESM support
- **Playwright**: Cross-browser E2E testing, reliable selectors
- **Mocking**: Essential for testing without hitting real GitHub API

### Testing Tools:

**Unit Testing: Vitest**
- Advantages: Fast (Vite-powered), great DX, coverage built-in, ESM native
- Use for: Metric calculations, scoring algorithms, data transformations
- Mock Strategy: Mock GitHub API responses with fixtures

**Integration Testing: Vitest + MSW (Mock Service Worker)**
- MSW intercepts network requests at service worker level
- Use for: GitHub API integration, localStorage, URL parameters
- Advantages: Realistic mocking, no code changes needed

**E2E Testing: Playwright**
- Cross-browser (Chromium, Firefox, WebKit)
- Use for: User workflows (evaluate → display → share)
- Advantages: Reliable, screenshots, video recording, traces

**Contract Testing**:
- Validate GitHub API response schemas
- Use JSON Schema validation
- Catch API changes early

### Test Fixtures:
```javascript
// Example: Mock GitHub API response fixture
const mockRepoData = {
  name: "react",
  owner: { login: "facebook" },
  stargazers_count: 200000,
  forks_count: 42000,
  // ... full response
};
```

### Coverage Requirements:
- Unit tests: ≥ 80% coverage for services, models, utils
- Integration tests: All GitHub API interactions
- E2E tests: 4 critical user journeys (from spec)

### References:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

---

## 6. UI Component Strategy

### Decision: Web Components (Custom Elements) + CSS Modules

### Rationale:
- **Native Browser Support**: No framework needed, excellent performance
- **Encapsulation**: Shadow DOM for style isolation
- **Reusability**: True component reusability without framework lock-in
- **Bundle Size**: Zero framework overhead

### Component Architecture:

**Base Components**:
- `<metric-card>`: Display individual metric with score, explanation, trend
- `<metric-category>`: Group related metrics with category header
- `<health-score>`: Overall health score with grade visualization
- `<custom-criterion-form>`: Add/edit custom criteria
- `<comparison-table>`: Side-by-side project comparison
- `<help-tooltip>`: Educational tooltips for metrics

**Example Web Component**:
```javascript
class MetricCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* Scoped styles */
      </style>
      <div class="metric-card">
        <h3>${this.getAttribute('name')}</h3>
        <div class="score">${this.getAttribute('score')}</div>
      </div>
    `;
  }
}

customElements.define('metric-card', MetricCard);
```

### CSS Strategy:
- CSS Custom Properties for theming
- Mobile-first responsive design
- Accessibility: WCAG 2.1 AA compliance
- No CSS-in-JS (avoid runtime cost)

### References:
- [Web Components Standards](https://www.webcomponents.org/specs)
- [MDN Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)

---

## 7. Performance Optimization Techniques

### Decision: Bundle splitting + lazy loading + compression + caching

### Optimization Strategies:

**Bundle Optimization**:
- Code splitting: Separate core (evaluation) from advanced (comparison)
- Dynamic imports for non-critical features
- Tree shaking: Remove unused code
- Minification: Terser for JS, cssnano for CSS
- Compression: Brotli for static assets (GitHub Pages supports)

**Loading Strategy**:
- Critical CSS inline in HTML head
- Defer non-critical JavaScript
- Lazy load comparison view (User Story 3 - P3)
- Lazy load chart library (only if visualizations needed)

**Image Optimization**:
- SVG icons (scalable, small file size)
- WebP format with PNG fallback for images
- Lazy loading images (Intersection Observer)

**Network Optimization**:
- HTTP/2 multiplexing (GitHub Pages supports)
- Preconnect to GitHub API domain
- Service worker for offline support

**Measurement Tools**:
- Lighthouse CI in GitHub Actions
- Bundle size limits in CI (fail if > 500KB gzipped)
- Performance budget enforcement

### Performance Checklist:
- ✅ Initial bundle < 500KB gzipped
- ✅ TTI < 3 seconds on 3G
- ✅ LCP < 2.5 seconds
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Lighthouse score > 90

### References:
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 8. Accessibility Implementation

### Decision: WCAG 2.1 AA compliance with automated + manual testing

### Accessibility Requirements:

**Semantic HTML**:
- Use native HTML elements (`<button>`, `<form>`, `<nav>`)
- Heading hierarchy (h1 → h2 → h3)
- Landmark regions (`<header>`, `<main>`, `<footer>`)

**ARIA Labels**:
- `aria-label` for icon-only buttons
- `aria-describedby` for help tooltips
- `aria-live` regions for dynamic content (loading states)
- `role` attributes where semantic HTML insufficient

**Keyboard Navigation**:
- Tab order logical and complete
- Focus indicators visible (3:1 contrast minimum)
- Skip links for main content
- Keyboard shortcuts documented

**Screen Reader Support**:
- Alt text for images
- Form labels properly associated
- Error messages announced
- Status updates announced

**Color & Contrast**:
- Text contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- Color not sole indicator of meaning
- High contrast mode support

**Testing Strategy**:
- Automated: axe-core via Playwright tests
- Manual: Screen reader testing (NVDA on Windows, VoiceOver on Mac)
- Keyboard-only navigation testing
- Color blindness simulation

### References:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe-core](https://github.com/dequelabs/axe-core)

---

## 9. Data Persistence & Sharing

### Decision: URL parameters (sharing) + localStorage (preferences) + Export (JSON/CSV)

### URL Parameter Strategy:

**Shareable URL Format**:
```
https://user.github.io/gpa-tools/?repo=facebook/react&criteria=typescript,security-md&compare=vuejs/vue,angular/angular
```

**Parameters**:
- `repo`: Main repository (owner/name)
- `criteria`: Comma-separated custom criteria IDs
- `compare`: Comma-separated repos for comparison
- `token`: (Never included - security risk)

**Implementation**:
- URLSearchParams API for parsing
- Base64 encoding for complex criteria definitions (if needed)
- History API for browser back/forward support

### localStorage Strategy:

**Stored Data**:
- User preferences (theme, default metrics, token - encrypted)
- Custom criteria definitions
- Recently evaluated repos (history)
- Cache (see Caching Strategy above)

**Data Structure**:
```javascript
{
  preferences: {
    theme: "light",
    defaultMetrics: ["activity", "community"],
    encryptedToken: "..."
  },
  customCriteria: [
    { id: "typescript", name: "Uses TypeScript", type: "technology" }
  ],
  recentRepos: ["facebook/react", "vuejs/vue"],
  cache: { /* ... */ }
}
```

### Export Strategy:

**JSON Export**:
- Complete evaluation data
- Machine-readable
- Use for programmatic processing

**CSV Export**:
- Metrics in tabular format
- Excel/Google Sheets compatible
- Use for reporting

### References:
- [URLSearchParams API](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## 10. Development Tooling

### Decision: Vite (build) + ESLint + Prettier + GitHub Actions (CI/CD)

### Build Tool: Vite
- **Why**: Fast dev server (HMR), optimized production builds, modern by default
- **Alternatives Rejected**: Webpack (too complex), Parcel (less mature), Rollup (Vite uses Rollup internally)

### Code Quality:
- **ESLint**: JavaScript linting with complexity rules
- **Prettier**: Code formatting (auto-fix on save)
- **lint-staged + husky**: Pre-commit hooks

### CI/CD Pipeline (GitHub Actions):

**Continuous Integration**:
```yaml
on: [push, pull_request]
jobs:
  - lint (ESLint + Prettier)
  - test (Vitest unit + integration)
  - e2e (Playwright cross-browser)
  - build (verify bundle size < 500KB)
  - lighthouse (performance score > 90)
```

**Continuous Deployment**:
```yaml
on:
  push:
    branches: [main]
jobs:
  - build
  - deploy to GitHub Pages
```

### Development Commands:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

### References:
- [Vite Documentation](https://vitejs.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## Summary of Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Framework** | Vanilla JS + Web Components | Bundle size, performance, simplicity |
| **Build Tool** | Vite | Fast, modern, optimized builds |
| **Testing** | Vitest + Playwright | Speed, reliability, great DX |
| **API Client** | Octokit.js (REST v3) | Lightweight, handles auth/rate limits |
| **Caching** | localStorage + Service Worker | Performance, offline support |
| **Components** | Web Components | Native, encapsulated, reusable |
| **Hosting** | GitHub Pages | Free, static, integrated |
| **CI/CD** | GitHub Actions | Integrated, powerful, free for public repos |
| **Baseline Metrics** | 18 metrics across 5 categories | Industry-standard (CHAOSS, LF CII) |
| **Accessibility** | WCAG 2.1 AA + axe-core | Constitutional requirement, inclusive |

## Next Steps

Proceed to Phase 1:
1. Generate data-model.md (entity definitions)
2. Generate contracts/ (GitHub API schemas, metric schemas)
3. Generate quickstart.md (developer guide)
4. Update agent context files
