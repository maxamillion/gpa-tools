/**
 * Unit tests for scoring algorithms
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect } from 'vitest';
import {
  scoreCommitFrequency,
  scoreReleaseCadence,
  scoreLastActivity,
  scoreContributorCount,
  scoreNewContributors,
  scorePRMergeRate,
  scoreOpenIssuesRatio,
  scoreIssueResponseTime,
  scoreStaleIssuesPercentage,
  scoreAverageTimeToClose,
  scoreREADMEQuality,
  scoreBusFactor,
  scoreToGrade,
} from '../../src/utils/scoring.js';

describe('Scoring Utilities', () => {
  describe('scoreCommitFrequency', () => {
    it('should score ≥20 commits/week as Excellent (95)', () => {
      const result = scoreCommitFrequency(20);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 10-20 commits/week as Good (85)', () => {
      const result = scoreCommitFrequency(15);
      expect(result.score).toBe(85);
      expect(result.grade).toBe('Good');
    });

    it('should score 5-10 commits/week as Good (70)', () => {
      const result = scoreCommitFrequency(7);
      expect(result.score).toBe(70);
      expect(result.grade).toBe('Good');
    });

    it('should score 1-5 commits/week as Fair (50)', () => {
      const result = scoreCommitFrequency(3);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score <1 commit/week as Poor (25)', () => {
      const result = scoreCommitFrequency(0.5);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreReleaseCadence', () => {
    it('should score null as Poor (0)', () => {
      const result = scoreReleaseCadence(null);
      expect(result.score).toBe(0);
      expect(result.grade).toBe('Poor');
    });

    it('should score ≤30 days as Excellent (95)', () => {
      const result = scoreReleaseCadence(25);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 30-90 days as Good (80)', () => {
      const result = scoreReleaseCadence(60);
      expect(result.score).toBe(80);
      expect(result.grade).toBe('Good');
    });

    it('should score 90-180 days as Fair (60)', () => {
      const result = scoreReleaseCadence(120);
      expect(result.score).toBe(60);
      expect(result.grade).toBe('Fair');
    });

    it('should score >180 days as Poor (30)', () => {
      const result = scoreReleaseCadence(200);
      expect(result.score).toBe(30);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreLastActivity', () => {
    it('should score ≤7 days as Excellent (95)', () => {
      const result = scoreLastActivity(5);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 7-30 days as Good (80)', () => {
      const result = scoreLastActivity(15);
      expect(result.score).toBe(80);
      expect(result.grade).toBe('Good');
    });

    it('should score 30-90 days as Fair (55)', () => {
      const result = scoreLastActivity(60);
      expect(result.score).toBe(55);
      expect(result.grade).toBe('Fair');
    });

    it('should score >90 days as Poor (25)', () => {
      const result = scoreLastActivity(120);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreContributorCount', () => {
    it('should score ≥50 contributors as Excellent (95)', () => {
      const result = scoreContributorCount(100);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 10-50 contributors as Good (80)', () => {
      const result = scoreContributorCount(25);
      expect(result.score).toBe(80);
      expect(result.grade).toBe('Good');
    });

    it('should score 3-10 contributors as Fair (60)', () => {
      const result = scoreContributorCount(5);
      expect(result.score).toBe(60);
      expect(result.grade).toBe('Fair');
    });

    it('should score <3 contributors as Poor (30)', () => {
      const result = scoreContributorCount(2);
      expect(result.score).toBe(30);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreNewContributors', () => {
    it('should score ≥5 new contributors as Excellent (95)', () => {
      const result = scoreNewContributors(7);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 2-5 new contributors as Good (75)', () => {
      const result = scoreNewContributors(3);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 1 new contributor as Fair (55)', () => {
      const result = scoreNewContributors(1);
      expect(result.score).toBe(55);
      expect(result.grade).toBe('Fair');
    });

    it('should score 0 new contributors as Poor (25)', () => {
      const result = scoreNewContributors(0);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scorePRMergeRate', () => {
    it('should score null as Poor (0)', () => {
      const result = scorePRMergeRate(null);
      expect(result.score).toBe(0);
      expect(result.grade).toBe('Poor');
    });

    it('should score ≥70% as Excellent (95)', () => {
      const result = scorePRMergeRate(85);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 50-70% as Good (75)', () => {
      const result = scorePRMergeRate(60);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 30-50% as Fair (50)', () => {
      const result = scorePRMergeRate(40);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score <30% as Poor (25)', () => {
      const result = scorePRMergeRate(20);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreOpenIssuesRatio', () => {
    it('should score null as Fair (50)', () => {
      const result = scoreOpenIssuesRatio(null);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score <20% as Excellent (95)', () => {
      const result = scoreOpenIssuesRatio(15);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 20-40% as Good (75)', () => {
      const result = scoreOpenIssuesRatio(30);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 40-60% as Fair (50)', () => {
      const result = scoreOpenIssuesRatio(50);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score ≥60% as Poor (25)', () => {
      const result = scoreOpenIssuesRatio(70);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreIssueResponseTime', () => {
    it('should score null as Fair (50)', () => {
      const result = scoreIssueResponseTime(null);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score <24 hours as Excellent (95)', () => {
      const result = scoreIssueResponseTime(12);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 24-72 hours as Good (75)', () => {
      const result = scoreIssueResponseTime(48);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 72-168 hours (1 week) as Fair (50)', () => {
      const result = scoreIssueResponseTime(100);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score >168 hours as Poor (25)', () => {
      const result = scoreIssueResponseTime(200);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreStaleIssuesPercentage', () => {
    it('should score null as Fair (50)', () => {
      const result = scoreStaleIssuesPercentage(null);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score <10% as Excellent (95)', () => {
      const result = scoreStaleIssuesPercentage(5);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 10-25% as Good (75)', () => {
      const result = scoreStaleIssuesPercentage(20);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 25-50% as Fair (50)', () => {
      const result = scoreStaleIssuesPercentage(40);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score ≥50% as Poor (25)', () => {
      const result = scoreStaleIssuesPercentage(60);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreAverageTimeToClose', () => {
    it('should score null as Fair (50)', () => {
      const result = scoreAverageTimeToClose(null);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score <7 days as Excellent (95)', () => {
      const result = scoreAverageTimeToClose(5);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 7-30 days as Good (75)', () => {
      const result = scoreAverageTimeToClose(20);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 30-90 days as Fair (50)', () => {
      const result = scoreAverageTimeToClose(60);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score >90 days as Poor (25)', () => {
      const result = scoreAverageTimeToClose(120);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreREADMEQuality', () => {
    it('should score 5/5 as Excellent (95)', () => {
      const result = scoreREADMEQuality(5);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 4/5 as Good (80)', () => {
      const result = scoreREADMEQuality(4);
      expect(result.score).toBe(80);
      expect(result.grade).toBe('Good');
    });

    it('should score 3/5 as Fair (60)', () => {
      const result = scoreREADMEQuality(3);
      expect(result.score).toBe(60);
      expect(result.grade).toBe('Fair');
    });

    it('should score <3/5 as Poor (30)', () => {
      const result = scoreREADMEQuality(2);
      expect(result.score).toBe(30);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreBusFactor', () => {
    it('should score ≥5 as Excellent (95)', () => {
      const result = scoreBusFactor(7);
      expect(result.score).toBe(95);
      expect(result.grade).toBe('Excellent');
    });

    it('should score 3-5 as Good (75)', () => {
      const result = scoreBusFactor(4);
      expect(result.score).toBe(75);
      expect(result.grade).toBe('Good');
    });

    it('should score 2 as Fair (50)', () => {
      const result = scoreBusFactor(2);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Fair');
    });

    it('should score 1 as Poor (25)', () => {
      const result = scoreBusFactor(1);
      expect(result.score).toBe(25);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('scoreToGrade', () => {
    it('should convert score to letter grades', () => {
      expect(scoreToGrade(97)).toBe('A+');
      expect(scoreToGrade(95)).toBe('A');
      expect(scoreToGrade(85)).toBe('B');
      expect(scoreToGrade(75)).toBe('C');
      expect(scoreToGrade(65)).toBe('D');
      expect(scoreToGrade(50)).toBe('F');
    });
  });
});
