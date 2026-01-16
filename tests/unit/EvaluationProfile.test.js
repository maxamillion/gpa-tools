/**
 * EvaluationProfile Model Tests
 * Tests complete evaluation configuration and results
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvaluationProfile } from '../../src/models/EvaluationProfile.js';
import { Repository } from '../../src/models/Repository.js';
import { Metric } from '../../src/models/Metric.js';
import { CustomCriterion } from '../../src/models/CustomCriterion.js';

describe('EvaluationProfile Model', () => {
  let mockRepository;
  let mockMetrics;
  let mockHealthScore;

  beforeEach(() => {
    mockRepository = new Repository({
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
      url: 'https://github.com/facebook/react',
    });

    mockMetrics = [
      new Metric({
        id: 'commit-frequency',
        name: 'Commit Frequency',
        category: 'activity',
        value: 45.5,
        score: 85,
        grade: 'B',
        explanation: 'Test metric',
        whyItMatters: 'Important for testing',
        threshold: {},
        dataSource: 'GitHub API',
        calculatedAt: new Date(),
        confidence: 'high',
      }),
    ];

    mockHealthScore = {
      overallScore: 85,
      overallGrade: 'B',
      categoryScores: {
        activity: 90,
        community: 85,
        maintenance: 80,
        documentation: 88,
        security: 82,
      },
      calculatedAt: new Date(),
    };
  });

  describe('Constructor and Validation', () => {
    it('should create a valid evaluation profile', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      expect(profile.id).toBe('test-eval');
      expect(profile.repository).toBe(mockRepository);
      expect(profile.baselineMetrics).toEqual(mockMetrics);
    });

    it('should throw error if required fields are missing', () => {
      expect(() => {
        new EvaluationProfile({
          id: 'test',
        });
      }).toThrow();
    });

    it('should allow custom criteria to be optional', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      expect(profile.customCriteria).toEqual([]);
    });

    it('should accept custom criteria', () => {
      const customCriterion = new CustomCriterion({
        id: 'test-criterion',
        name: 'Test',
        description: 'Test criterion',
        type: 'technology',
        evaluationType: 'manual',
        createdAt: new Date(),
      });

      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        customCriteria: [customCriterion],
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      expect(profile.customCriteria).toHaveLength(1);
      expect(profile.customCriteria[0]).toBe(customCriterion);
    });

    it('should validate createdAt is before or equal to evaluatedAt', () => {
      const createdAt = new Date('2026-01-15T12:00:00Z');
      const evaluatedAt = new Date('2026-01-15T11:00:00Z');

      expect(() => {
        new EvaluationProfile({
          id: 'test-eval',
          repository: mockRepository,
          baselineMetrics: mockMetrics,
          healthScore: mockHealthScore,
          createdAt,
          evaluatedAt,
        });
      }).toThrow('createdAt must be before or equal to evaluatedAt');
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache key', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      expect(profile.cacheKey).toBe('repo:facebook/react:eval:v1');
    });

    it('should include custom criteria in cache key if present', () => {
      const customCriterion = new CustomCriterion({
        id: 'test-criterion',
        name: 'Test',
        description: 'Test criterion',
        type: 'technology',
        evaluationType: 'manual',
        createdAt: new Date(),
      });

      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        customCriteria: [customCriterion],
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      expect(profile.cacheKey).toContain('custom:1');
    });
  });

  describe('Shareable URL Generation', () => {
    it('should generate shareable URL with repository', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      const url = profile.generateShareableUrl('https://example.com/gpa-tools');

      expect(url).toContain('https://example.com/gpa-tools');
      expect(url).toContain('repo=facebook');
      expect(url).toContain('react');
    });

    it('should include custom criteria in shareable URL', () => {
      const customCriterion = CustomCriterion.create({
        name: 'Uses TypeScript',
        description: 'Project uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'language === TypeScript',
      });

      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        customCriteria: [customCriterion],
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      const url = profile.generateShareableUrl('https://example.com/gpa-tools');

      expect(url).toContain('criteria=');
    });

    it('should encode custom criteria as base64', () => {
      const customCriterion = CustomCriterion.create({
        name: 'Uses TypeScript',
        description: 'Project uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'language === TypeScript',
      });

      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        customCriteria: [customCriterion],
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      const url = profile.generateShareableUrl('https://example.com/gpa-tools');
      const params = new URLSearchParams(url.split('?')[1]);
      const encoded = params.get('criteria');

      expect(encoded).toBeTruthy();

      // Decode and verify it's valid JSON
      const decoded = JSON.parse(atob(encoded));
      expect(decoded).toBeInstanceOf(Array);
      expect(decoded[0].name).toBe('Uses TypeScript');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date('2026-01-15T10:00:00Z'),
        evaluatedAt: new Date('2026-01-15T10:30:00Z'),
      });

      const json = profile.toJSON();

      expect(json.id).toBe('test-eval');
      expect(json.repository).toBeDefined();
      expect(json.baselineMetrics).toBeInstanceOf(Array);
      expect(json.healthScore).toBeDefined();
      expect(json.createdAt).toBeDefined();
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'test-eval',
        repository: {
          owner: 'facebook',
          name: 'react',
          fullName: 'facebook/react',
          url: 'https://github.com/facebook/react',
        },
        baselineMetrics: [],
        customCriteria: [],
        healthScore: {
          overallScore: 85,
          overallGrade: 'B',
          categoryScores: {
            activity: 90,
            community: 85,
            maintenance: 80,
            documentation: 88,
            security: 82,
          },
          calculatedAt: '2026-01-15T10:30:00Z',
        },
        createdAt: '2026-01-15T10:00:00Z',
        evaluatedAt: '2026-01-15T10:30:00Z',
      };

      const profile = EvaluationProfile.fromJSON(json);

      expect(profile.id).toBe('test-eval');
      expect(profile.repository).toBeInstanceOf(Repository);
      expect(profile.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('localStorage Persistence', () => {
    it('should serialize for localStorage', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      const serialized = profile.serialize();

      expect(typeof serialized).toBe('string');

      const parsed = JSON.parse(serialized);
      expect(parsed.id).toBe('test-eval');
    });

    it('should deserialize from localStorage', () => {
      const profile = new EvaluationProfile({
        id: 'test-eval',
        repository: mockRepository,
        baselineMetrics: mockMetrics,
        healthScore: mockHealthScore,
        createdAt: new Date(),
        evaluatedAt: new Date(),
      });

      const serialized = profile.serialize();
      const deserialized = EvaluationProfile.deserialize(serialized);

      expect(deserialized.id).toBe('test-eval');
      expect(deserialized.repository.name).toBe('react');
    });
  });
});
