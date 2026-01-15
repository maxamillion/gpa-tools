/**
 * Unit tests for HealthScoreCard Web Component
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/HealthScoreCard.js';

describe('HealthScoreCard Component', () => {
  let container;
  let healthScoreCard;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    healthScoreCard = document.createElement('health-score-card');
    container.appendChild(healthScoreCard);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Component Registration', () => {
    it('should be registered as custom element', () => {
      expect(customElements.get('health-score-card')).toBeDefined();
    });

    it('should create instance with shadowDOM', () => {
      expect(healthScoreCard.shadowRoot).toBeTruthy();
    });
  });

  describe('Score Property', () => {
    it('should accept score property', () => {
      healthScoreCard.score = 85;
      expect(healthScoreCard.score).toBe(85);
    });

    it('should trigger render when score is set', async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'A';
      await new Promise(resolve => setTimeout(resolve, 0));

      const scoreElement = healthScoreCard.shadowRoot.querySelector('.health-score');
      expect(scoreElement.textContent).toContain('85');
    });

    it('should handle score of 0', () => {
      healthScoreCard.score = 0;
      expect(healthScoreCard.score).toBe(0);
    });

    it('should handle score of 100', () => {
      healthScoreCard.score = 100;
      expect(healthScoreCard.score).toBe(100);
    });
  });

  describe('Grade Property', () => {
    it('should accept grade property', () => {
      healthScoreCard.grade = 'A';
      expect(healthScoreCard.grade).toBe('A');
    });

    it('should display grade', async () => {
      healthScoreCard.score = 92;
      healthScoreCard.grade = 'A';
      await new Promise(resolve => setTimeout(resolve, 0));

      const gradeElement = healthScoreCard.shadowRoot.querySelector('.health-grade');
      expect(gradeElement.textContent).toBe('A');
    });
  });

  describe('Category Breakdown Property', () => {
    it('should accept categoryBreakdown property', () => {
      const breakdown = {
        activity: { score: 85, grade: 'A' },
        community: { score: 70, grade: 'C' },
        maintenance: { score: 90, grade: 'A' },
        documentation: { score: 60, grade: 'D' },
        security: { score: 75, grade: 'B' },
      };
      healthScoreCard.categoryBreakdown = breakdown;
      expect(healthScoreCard.categoryBreakdown).toBe(breakdown);
    });

    it('should display category breakdown', async () => {
      healthScoreCard.score = 80;
      healthScoreCard.grade = 'B';
      healthScoreCard.categoryBreakdown = {
        activity: { score: 85, grade: 'A' },
        community: { score: 70, grade: 'C' },
      };
      await new Promise(resolve => setTimeout(resolve, 0));

      const categories = healthScoreCard.shadowRoot.querySelectorAll('.category-item');
      expect(categories.length).toBe(2);
    });

    it('should display category names', async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'A';
      healthScoreCard.categoryBreakdown = {
        activity: { score: 85, grade: 'A' },
      };
      await new Promise(resolve => setTimeout(resolve, 0));

      const categoryName = healthScoreCard.shadowRoot.querySelector('.category-name');
      expect(categoryName.textContent).toBe('Activity');
    });

    it('should display category scores', async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'A';
      healthScoreCard.categoryBreakdown = {
        activity: { score: 85, grade: 'A' },
      };
      await new Promise(resolve => setTimeout(resolve, 0));

      const categoryScore = healthScoreCard.shadowRoot.querySelector('.category-score');
      expect(categoryScore.textContent).toContain('85');
    });
  });

  describe('Rendering', () => {
    beforeEach(async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'A';
      healthScoreCard.categoryBreakdown = {
        activity: { score: 90, grade: 'A' },
        community: { score: 80, grade: 'B' },
      };
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should display overall health score', () => {
      const scoreElement = healthScoreCard.shadowRoot.querySelector('.health-score');
      expect(scoreElement.textContent).toContain('85');
    });

    it('should display overall grade', () => {
      const gradeElement = healthScoreCard.shadowRoot.querySelector('.health-grade');
      expect(gradeElement.textContent).toBe('A');
    });

    it('should display header title', () => {
      const titleElement = healthScoreCard.shadowRoot.querySelector('.card-title');
      expect(titleElement.textContent).toBe('Overall Health Score');
    });

    it('should display progress bar', () => {
      const progressBar = healthScoreCard.shadowRoot.querySelector('.progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('should set progress bar width based on score', () => {
      const progressFill = healthScoreCard.shadowRoot.querySelector('.progress-fill');
      expect(progressFill.style.width).toBe('85%');
    });
  });

  describe('Grade Styling', () => {
    it('should apply correct class for A grade', async () => {
      healthScoreCard.score = 95;
      healthScoreCard.grade = 'A';
      await new Promise(resolve => setTimeout(resolve, 0));

      const card = healthScoreCard.shadowRoot.querySelector('.health-card');
      expect(card.classList.contains('grade-a')).toBe(true);
    });

    it('should apply correct class for B grade', async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'B';
      await new Promise(resolve => setTimeout(resolve, 0));

      const card = healthScoreCard.shadowRoot.querySelector('.health-card');
      expect(card.classList.contains('grade-b')).toBe(true);
    });

    it('should apply correct class for F grade', async () => {
      healthScoreCard.score = 45;
      healthScoreCard.grade = 'F';
      await new Promise(resolve => setTimeout(resolve, 0));

      const card = healthScoreCard.shadowRoot.querySelector('.health-card');
      expect(card.classList.contains('grade-f')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'A';
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should have ARIA role', () => {
      const card = healthScoreCard.shadowRoot.querySelector('.health-card');
      expect(card.getAttribute('role')).toBe('region');
    });

    it('should have ARIA label with score', () => {
      const card = healthScoreCard.shadowRoot.querySelector('.health-card');
      expect(card.getAttribute('aria-label')).toContain('85');
    });

    it('should have semantic heading for title', () => {
      const titleElement = healthScoreCard.shadowRoot.querySelector('h2.card-title');
      expect(titleElement).toBeTruthy();
    });

    it('should have progress bar with ARIA attributes', () => {
      const progressBar = healthScoreCard.shadowRoot.querySelector('.progress-bar');
      expect(progressBar.getAttribute('role')).toBe('progressbar');
      expect(progressBar.getAttribute('aria-valuenow')).toBe('85');
      expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
      expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no score is set', () => {
      const card = healthScoreCard.shadowRoot.querySelector('.health-card');
      expect(card).toBeNull();
    });

    it('should show message when no category breakdown provided', async () => {
      healthScoreCard.score = 85;
      healthScoreCard.grade = 'A';
      healthScoreCard.categoryBreakdown = null;
      await new Promise(resolve => setTimeout(resolve, 0));

      const categories = healthScoreCard.shadowRoot.querySelectorAll('.category-item');
      expect(categories.length).toBe(0);
    });
  });
});
