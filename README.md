# Open Source Project Health Analyzer

A single-page web application for evaluating GitHub repository health using industry-standard metrics and custom evaluation criteria.

## 🎯 Features

- **Baseline Metrics**: Evaluate repositories using 18 industry-standard health indicators across 5 categories:
  - Activity: Commit frequency, release cadence, last activity
  - Community: Contributor count, new contributors, PR merge rate
  - Maintenance: Open issues ratio, response time, stale issues, time to close
  - Documentation: README quality, docs directory, wiki presence
  - Security: Security policy, code of conduct, contributing guidelines, license, bus factor

- **Custom Criteria**: Add your own evaluation criteria based on technology stack, themes, or specific requirements
- **Side-by-Side Comparison**: Compare multiple repositories to make informed decisions
- **Educational**: Understand what each metric means and why it matters

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 7)
- npm 9+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

```bash
# Clone the repository
git clone https://github.com/maxamillion/gpa-tools.git
cd gpa-tools

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

## 📝 Development

### Available Scripts

- `npm run dev` - Start Vite dev server with hot module replacement
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests in interactive UI mode
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run check` - Run all quality checks (lint + test + build)

### Project Structure

```
src/
├── components/          # UI components (Web Components)
├── services/           # Business logic and API interactions
├── models/             # Data structures and entities
├── utils/              # Utility functions
├── config/             # Configuration and constants
├── styles/             # CSS files
├── index.html          # Entry point
└── main.js             # Application initialization

tests/
├── unit/               # Unit tests (Vitest)
├── integration/        # Integration tests (Vitest + MSW)
└── e2e/                # End-to-end tests (Playwright)

docs/                   # Documentation
.github/workflows/      # CI/CD workflows
```

### Test-Driven Development (TDD)

This project follows **strict TDD** practices:

1. Write failing tests first
2. Verify tests fail (Red)
3. Implement minimal code to pass (Green)
4. Refactor while keeping tests green (Refactor)

See the [project constitution](.specify/memory/constitution.md) for detailed quality standards.

### Code Quality Standards

- **Maximum cyclomatic complexity**: 10
- **Maximum function length**: 50 lines
- **Test coverage**: ≥80% for unit tests, ≥70% for integration tests
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <500KB bundle size, <3s TTI on 3G

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:coverage
```

## 🏗️ Architecture

- **Framework**: Vanilla JavaScript ES2022+ with Web Components
- **Build Tool**: Vite
- **Testing**: Vitest (unit/integration), Playwright (E2E), MSW (API mocking)
- **API**: GitHub REST API v3 via Octokit.js
- **Storage**: localStorage with TTL-based caching
- **Deployment**: GitHub Pages (static hosting)

## 📊 Metrics Explained

See [quickstart.md](specs/001-project-health-analyzer/quickstart.md) for detailed metric explanations and calculation algorithms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD required)
4. Implement your feature
5. Ensure all tests pass (`npm run check`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

ISC

## 🔗 Links

- [Repository](https://github.com/maxamillion/gpa-tools)
- [Issues](https://github.com/maxamillion/gpa-tools/issues)
- [Specification](specs/001-project-health-analyzer/spec.md)
- [Implementation Plan](specs/001-project-health-analyzer/plan.md)
