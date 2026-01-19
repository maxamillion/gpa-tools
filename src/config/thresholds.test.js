/**
 * Thresholds Tests
 */

import { describe, it, expect } from 'vitest';
import { getGrade, getScoreLevel, METRIC_THRESHOLDS, GRADE_THRESHOLDS } from './thresholds.js';

describe('thresholds', () => {
  describe('getGrade', () => {
    it('should return A+ for 95+', () => {
      expect(getGrade(95).grade).toBe('A+');
      expect(getGrade(100).grade).toBe('A+');
    });

    it('should return A for 90-94', () => {
      expect(getGrade(90).grade).toBe('A');
      expect(getGrade(94).grade).toBe('A');
    });

    it('should return F for below 40', () => {
      expect(getGrade(39).grade).toBe('F');
      expect(getGrade(0).grade).toBe('F');
    });

    it('should return correct color class', () => {
      expect(getGrade(95).color).toBe('grade-a');
      expect(getGrade(75).color).toBe('grade-b');
      expect(getGrade(60).color).toBe('grade-c');
      expect(getGrade(45).color).toBe('grade-d');
      expect(getGrade(20).color).toBe('grade-f');
    });
  });

  describe('getScoreLevel', () => {
    it('should return excellent for 80+', () => {
      expect(getScoreLevel(80).label).toBe('Excellent');
      expect(getScoreLevel(100).label).toBe('Excellent');
    });

    it('should return good for 60-79', () => {
      expect(getScoreLevel(60).label).toBe('Good');
      expect(getScoreLevel(79).label).toBe('Good');
    });

    it('should return fair for 40-59', () => {
      expect(getScoreLevel(40).label).toBe('Fair');
      expect(getScoreLevel(59).label).toBe('Fair');
    });

    it('should return poor for 20-39', () => {
      expect(getScoreLevel(20).label).toBe('Poor');
      expect(getScoreLevel(39).label).toBe('Poor');
    });

    it('should return critical for below 20', () => {
      expect(getScoreLevel(0).label).toBe('Critical');
      expect(getScoreLevel(19).label).toBe('Critical');
    });

    it('should return correct CSS class', () => {
      expect(getScoreLevel(85).class).toBe('score-excellent');
      expect(getScoreLevel(65).class).toBe('score-good');
      expect(getScoreLevel(45).class).toBe('score-fair');
      expect(getScoreLevel(25).class).toBe('score-poor');
      expect(getScoreLevel(5).class).toBe('score-critical');
    });
  });

  describe('METRIC_THRESHOLDS', () => {
    it('should have 25 metric definitions', () => {
      expect(Object.keys(METRIC_THRESHOLDS)).toHaveLength(25);
    });

    it('should have valid threshold structures', () => {
      for (const config of Object.values(METRIC_THRESHOLDS)) {
        if (config.type === 'boolean') {
          expect(config.passScore).toBeDefined();
          expect(config.failScore).toBeDefined();
        } else if (config.type === 'badge' || config.type === 'affiliation') {
          expect(config.levels).toBeDefined();
        } else {
          expect(config.thresholds).toBeDefined();
          expect(config.scores).toBeDefined();
          expect(config.direction).toMatch(/^(higher|lower)-is-better$/);
        }
      }
    });
  });

  describe('GRADE_THRESHOLDS', () => {
    it('should have all letter grades', () => {
      const grades = Object.keys(GRADE_THRESHOLDS);
      expect(grades).toContain('A+');
      expect(grades).toContain('A');
      expect(grades).toContain('B');
      expect(grades).toContain('C');
      expect(grades).toContain('D');
      expect(grades).toContain('F');
    });

    it('should have descending min values', () => {
      const grades = Object.entries(GRADE_THRESHOLDS);
      for (let i = 1; i < grades.length; i++) {
        expect(grades[i - 1][1].min).toBeGreaterThan(grades[i][1].min);
      }
    });
  });
});
