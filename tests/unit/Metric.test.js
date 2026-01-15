/**
 * Unit tests for Metric model
 * Following TDD: Write tests FIRST, see them FAIL, then implement
 */

import { describe, it, expect } from 'vitest';
import { Metric } from '../../src/models/Metric.js';

describe('Metric Model', () => {
  describe('constructor', () => {
    it('should create a valid metric with all required fields', () => {
      const metric = new Metric({
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'activity',
        value: 15.3,
        score: 75,
        grade: 'Good',
        explanation: 'Average commits per week',
        whyItMatters: 'Indicates active development',
        threshold: { good: { min: 5 } },
        dataSource: 'GitHub API',
        calculatedAt: new Date('2026-01-15T10:30:00Z'),
        confidence: 'high',
      });

      expect(metric.id).toBe('commit-frequency');
      expect(metric.name).toBe('Commit Frequency');
      expect(metric.category).toBe('activity');
      expect(metric.value).toBe(15.3);
      expect(metric.score).toBe(75);
      expect(metric.grade).toBe('Good');
      expect(metric.confidence).toBe('high');
    });

    it('should accept boolean values', () => {
      const metric = new Metric({
        id: 'has-wiki',
        name: 'Wiki Presence',
        category: 'documentation',
        value: true,
        score: 100,
        grade: 'Pass',
        explanation: 'Has wiki enabled',
        whyItMatters: 'Documentation availability',
        threshold: {},
        dataSource: 'GitHub API',
        calculatedAt: new Date(),
        confidence: 'high',
      });

      expect(metric.value).toBe(true);
      expect(metric.grade).toBe('Pass');
    });

    it('should throw error for score below 0', () => {
      expect(() => {
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: -1,
          grade: 'Poor',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
      }).toThrow('Score must be between 0 and 100');
    });

    it('should throw error for score above 100', () => {
      expect(() => {
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 101,
          grade: 'Excellent',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
      }).toThrow('Score must be between 0 and 100');
    });

    it('should throw error for invalid grade', () => {
      expect(() => {
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 50,
          grade: 'Invalid',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
      }).toThrow('Invalid grade');
    });

    it('should accept letter grades (A+, A, B, C, D, F)', () => {
      const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];
      grades.forEach((grade) => {
        const metric = new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 50,
          grade,
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
        expect(metric.grade).toBe(grade);
      });
    });

    it('should accept quality grades (Excellent, Good, Fair, Poor)', () => {
      const grades = ['Excellent', 'Good', 'Fair', 'Poor'];
      grades.forEach((grade) => {
        const metric = new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 50,
          grade,
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
        expect(metric.grade).toBe(grade);
      });
    });

    it('should accept pass/fail grades', () => {
      const grades = ['Pass', 'Fail'];
      grades.forEach((grade) => {
        const metric = new Metric({
          id: 'test',
          name: 'Test',
          category: 'documentation',
          value: grade === 'Pass',
          score: grade === 'Pass' ? 100 : 0,
          grade,
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
        expect(metric.grade).toBe(grade);
      });
    });

    it('should throw error for invalid category', () => {
      expect(() => {
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'invalid',
          value: 0,
          score: 50,
          grade: 'Fair',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
      }).toThrow('Invalid category');
    });

    it('should accept valid categories', () => {
      const categories = ['activity', 'community', 'maintenance', 'documentation', 'security'];
      categories.forEach((category) => {
        const metric = new Metric({
          id: 'test',
          name: 'Test',
          category,
          value: 0,
          score: 50,
          grade: 'Fair',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
        });
        expect(metric.category).toBe(category);
      });
    });

    it('should throw error for invalid confidence level', () => {
      expect(() => {
        new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 50,
          grade: 'Fair',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'invalid',
        });
      }).toThrow('Invalid confidence level');
    });

    it('should accept valid confidence levels', () => {
      const confidenceLevels = ['high', 'medium', 'low'];
      confidenceLevels.forEach((confidence) => {
        const metric = new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 50,
          grade: 'Fair',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence,
        });
        expect(metric.confidence).toBe(confidence);
      });
    });

    it('should accept optional trend', () => {
      const trends = ['improving', 'stable', 'declining'];
      trends.forEach((trend) => {
        const metric = new Metric({
          id: 'test',
          name: 'Test',
          category: 'activity',
          value: 0,
          score: 50,
          grade: 'Fair',
          explanation: 'Test',
          whyItMatters: 'Test',
          threshold: {},
          dataSource: 'Test',
          calculatedAt: new Date(),
          confidence: 'high',
          trend,
        });
        expect(metric.trend).toBe(trend);
      });
    });
  });
});
