/**
 * OSS Health Analyzer - Main Entry Point
 *
 * Initializes the application and orchestrates analysis workflow.
 */

import './styles/main.css';
import { GitHubApiService } from './services/githubApi.js';
import { MetricCalculator } from './services/metricCalculator.js';
import { HealthScoreCalculator } from './services/healthScoreCalculator.js';
import { CacheManager } from './services/cacheManager.js';
import { HealthScoreCard } from './components/HealthScoreCard.js';
import { CategorySection } from './components/CategorySection.js';

// Register custom elements
customElements.define('health-score-card', HealthScoreCard);
customElements.define('category-section', CategorySection);

class OSSHealthAnalyzer {
  constructor() {
    this.githubApi = null;
    this.metricCalculator = new MetricCalculator();
    this.healthScoreCalculator = new HealthScoreCalculator();
    this.cacheManager = new CacheManager();

    this.elements = {
      form: document.getElementById('repo-form'),
      repoUrl: document.getElementById('repo-url'),
      githubToken: document.getElementById('github-token'),
      analyzeBtn: document.getElementById('analyze-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
      resultsSection: document.getElementById('results-section'),
      resultsContainer: document.getElementById('results-container'),
      errorSection: document.getElementById('error-section'),
      errorMessage: document.getElementById('error-message'),
      errorDismiss: document.getElementById('error-dismiss'),
      loadingSection: document.getElementById('loading-section'),
      loadingProgress: document.getElementById('loading-progress'),
    };

    // Track if we should bypass cache
    this.bypassCache = false;

    this.init();
  }

  async init() {
    // Load saved token from localStorage
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      this.elements.githubToken.value = savedToken;
    }

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');
    const noCacheParam = urlParams.get('nocache');

    // Check if cache should be bypassed
    if (noCacheParam === '1' || noCacheParam === 'true') {
      this.bypassCache = true;
    }

    if (repoParam) {
      this.elements.repoUrl.value = this.normalizeRepoUrl(repoParam);
      // Auto-analyze if repo is provided
      this.analyze();
    }

    // Bind event listeners
    this.elements.form.addEventListener('submit', e => this.handleSubmit(e));
    this.elements.errorDismiss.addEventListener('click', () => this.hideError());
    this.elements.githubToken.addEventListener('change', e => this.handleTokenChange(e));
    this.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());

    // Initialize cache
    await this.cacheManager.init();
  }

  normalizeRepoUrl(input) {
    // Handle various input formats
    if (input.startsWith('https://github.com/')) {
      return input;
    }
    if (input.includes('/') && !input.includes('://')) {
      // Assume owner/repo format
      return `https://github.com/${input}`;
    }
    return input;
  }

  parseRepoUrl(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== 'github.com') {
        throw new Error('Only GitHub repositories are supported');
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        throw new Error('Invalid repository URL format');
      }

      return {
        owner: pathParts[0],
        repo: pathParts[1].replace('.git', ''),
      };
    } catch (err) {
      if (err.message.includes('GitHub') || err.message.includes('Invalid')) {
        throw err;
      }
      throw new Error('Invalid URL format');
    }
  }

  handleTokenChange(e) {
    const token = e.target.value.trim();
    if (token) {
      localStorage.setItem('github_token', token);
    } else {
      localStorage.removeItem('github_token');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.bypassCache = false; // Normal submit uses cache
    await this.analyze();
  }

  async handleRefresh() {
    this.bypassCache = true; // Force bypass cache
    await this.analyze();
    this.bypassCache = false; // Reset after refresh
  }

  async analyze() {
    const url = this.elements.repoUrl.value.trim();
    if (!url) {
      return;
    }

    let repoInfo;
    try {
      repoInfo = this.parseRepoUrl(this.normalizeRepoUrl(url));
    } catch (err) {
      this.showError(err.message);
      return;
    }

    // Update URL with repo parameter for sharing
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('repo', `${repoInfo.owner}/${repoInfo.repo}`);
    window.history.replaceState({}, '', newUrl);

    this.showLoading();
    this.hideError();
    this.hideResults();

    try {
      // Initialize GitHub API with optional token
      const token = this.elements.githubToken.value.trim() || null;
      this.githubApi = new GitHubApiService(token);

      // Check cache first (unless bypassing)
      const cacheKey = `${repoInfo.owner}/${repoInfo.repo}`;
      if (!this.bypassCache) {
        const cached = await this.cacheManager.get(cacheKey);

        if (cached && !this.isCacheExpired(cached.timestamp)) {
          this.renderResults(cached.data);
          this.hideLoading();
          return;
        }
      }

      // Fetch repository data
      this.updateProgress('Fetching repository information...');
      const repoData = await this.githubApi.getRepository(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Analyzing commit activity...');
      const commits = await this.githubApi.getCommits(repoInfo.owner, repoInfo.repo, 90);

      this.updateProgress('Fetching contributor data...');
      const contributors = await this.githubApi.getContributors(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Analyzing issues...');
      const issues = await this.githubApi.getIssues(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Checking pull requests...');
      const pullRequests = await this.githubApi.getPullRequests(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Fetching releases...');
      const releases = await this.githubApi.getReleases(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Checking community health files...');
      const communityProfile = await this.githubApi.getCommunityProfile(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Checking governance documentation...');
      const governanceFiles = await this.githubApi.getGovernanceFiles(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Checking OpenSSF Best Practices badge...');
      const openSSFBadge = await this.githubApi.getOpenSSFBadge(repoInfo.owner, repoInfo.repo);

      this.updateProgress('Detecting foundation affiliation...');
      const foundationAffiliation = await this.githubApi.detectFoundationAffiliation(repoInfo.owner, repoInfo.repo, repoData);

      this.updateProgress('Calculating metrics...');

      // Calculate all metrics
      const metrics = this.metricCalculator.calculateAll({
        repository: repoData,
        commits,
        contributors,
        issues,
        pullRequests,
        releases,
        communityProfile,
        governanceFiles,
        openSSFBadge,
        foundationAffiliation,
      });

      // Calculate health scores
      const healthScore = this.healthScoreCalculator.calculate(metrics);

      const results = {
        repository: {
          owner: repoInfo.owner,
          name: repoInfo.repo,
          fullName: `${repoInfo.owner}/${repoInfo.repo}`,
          description: repoData.description,
          url: repoData.html_url,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
        },
        metrics,
        healthScore,
        analyzedAt: new Date().toISOString(),
      };

      // Cache results
      await this.cacheManager.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });

      this.renderResults(results);
    } catch (err) {
      console.error('Analysis failed:', err);
      this.showError(this.formatError(err));
    } finally {
      this.hideLoading();
    }
  }

  isCacheExpired(timestamp) {
    const ONE_HOUR = 60 * 60 * 1000;
    return Date.now() - timestamp > ONE_HOUR;
  }

  formatError(err) {
    if (err.status === 404) {
      return 'Repository not found. Please check the URL and ensure the repository is public.';
    }
    if (err.status === 403) {
      return 'Rate limit exceeded. Please add a GitHub token for more requests, or try again later.';
    }
    if (err.status === 401) {
      return 'Invalid GitHub token. Please check your token and try again.';
    }
    return err.message || 'An unexpected error occurred. Please try again.';
  }

  updateProgress(message) {
    this.elements.loadingProgress.textContent = message;
  }

  showLoading() {
    this.elements.loadingSection.classList.remove('hidden');
    this.elements.analyzeBtn.classList.add('btn-loading');
    this.elements.analyzeBtn.disabled = true;
  }

  hideLoading() {
    this.elements.loadingSection.classList.add('hidden');
    this.elements.analyzeBtn.classList.remove('btn-loading');
    this.elements.analyzeBtn.disabled = false;
  }

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorSection.classList.remove('hidden');
    this.hideResults();
  }

  hideError() {
    this.elements.errorSection.classList.add('hidden');
  }

  hideResults() {
    this.elements.resultsSection.classList.add('hidden');
  }

  renderResults(results) {
    this.elements.resultsContainer.innerHTML = '';

    // Create health score card
    const scoreCard = document.createElement('health-score-card');
    scoreCard.setData(results);
    this.elements.resultsContainer.appendChild(scoreCard);

    // Create category sections
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'categories-container';
    categoriesContainer.style.display = 'flex';
    categoriesContainer.style.flexDirection = 'column';
    categoriesContainer.style.gap = 'var(--space-4)';
    categoriesContainer.style.marginTop = 'var(--space-6)';

    for (const [categoryId, categoryData] of Object.entries(results.healthScore.categories)) {
      const section = document.createElement('category-section');
      section.setData({
        id: categoryId,
        ...categoryData,
        metrics: results.metrics.filter(m => m.category === categoryId),
      });
      categoriesContainer.appendChild(section);
    }

    this.elements.resultsContainer.appendChild(categoriesContainer);
    this.elements.resultsSection.classList.remove('hidden');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new OSSHealthAnalyzer());
} else {
  new OSSHealthAnalyzer();
}
