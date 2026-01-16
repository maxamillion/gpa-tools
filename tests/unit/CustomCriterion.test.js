/**
 * CustomCriterion Model Tests
 * Tests custom evaluation criteria validation and evaluation logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CustomCriterion } from '../../src/models/CustomCriterion.js';

describe('CustomCriterion Model', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid custom criterion with required fields', () => {
      const criterion = new CustomCriterion({
        id: 'criterion-001',
        name: 'Uses TypeScript',
        description: 'Project uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'check typescript in dependencies',
        createdAt: new Date('2026-01-15'),
      });

      expect(criterion.id).toBe('criterion-001');
      expect(criterion.name).toBe('Uses TypeScript');
      expect(criterion.type).toBe('technology');
      expect(criterion.evaluationType).toBe('automatic');
    });

    it('should throw error if required fields are missing', () => {
      expect(() => {
        new CustomCriterion({
          name: 'Test Criterion',
        });
      }).toThrow();
    });

    it('should validate criterion types', () => {
      expect(() => {
        new CustomCriterion({
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'invalid-type',
          evaluationType: 'automatic',
          createdAt: new Date(),
        });
      }).toThrow('type must be one of');
    });

    it('should validate evaluation types', () => {
      expect(() => {
        new CustomCriterion({
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'technology',
          evaluationType: 'invalid-eval',
          createdAt: new Date(),
        });
      }).toThrow('evaluationType must be one of');
    });

    it('should require evaluationLogic for automatic evaluation', () => {
      expect(() => {
        new CustomCriterion({
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'technology',
          evaluationType: 'automatic',
          createdAt: new Date(),
        });
      }).toThrow('evaluationLogic is required');
    });

    it('should allow manual evaluation without evaluationLogic', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'technology',
        evaluationType: 'manual',
        createdAt: new Date(),
      });

      expect(criterion.evaluationLogic).toBeUndefined();
    });
  });

  describe('Result Validation', () => {
    it('should validate result values', () => {
      expect(() => {
        new CustomCriterion({
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'technology',
          evaluationType: 'manual',
          createdAt: new Date(),
          result: 'invalid-result',
        });
      }).toThrow('result must be one of');
    });

    it('should validate confidence levels', () => {
      expect(() => {
        new CustomCriterion({
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'technology',
          evaluationType: 'manual',
          createdAt: new Date(),
          confidence: 'invalid-confidence',
        });
      }).toThrow('confidence must be one of');
    });

    it('should require evaluatedAt when result is present', () => {
      expect(() => {
        new CustomCriterion({
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'technology',
          evaluationType: 'manual',
          createdAt: new Date(),
          result: 'pass',
        });
      }).toThrow('evaluatedAt is required when result is present');
    });

    it('should allow all result types', () => {
      const passResult = new CustomCriterion({
        id: 'test1',
        name: 'Test',
        description: 'Test',
        type: 'technology',
        evaluationType: 'manual',
        createdAt: new Date(),
        result: 'pass',
        evaluatedAt: new Date(),
      });

      const failResult = new CustomCriterion({
        id: 'test2',
        name: 'Test',
        description: 'Test',
        type: 'technology',
        evaluationType: 'manual',
        createdAt: new Date(),
        result: 'fail',
        evaluatedAt: new Date(),
      });

      const scoreResult = new CustomCriterion({
        id: 'test3',
        name: 'Test',
        description: 'Test',
        type: 'technology',
        evaluationType: 'manual',
        createdAt: new Date(),
        result: 'score',
        resultValue: 75,
        evaluatedAt: new Date(),
      });

      expect(passResult.result).toBe('pass');
      expect(failResult.result).toBe('fail');
      expect(scoreResult.result).toBe('score');
      expect(scoreResult.resultValue).toBe(75);
    });
  });

  describe('Evaluation Methods', () => {
    let repositoryData;

    beforeEach(() => {
      repositoryData = {
        language: 'TypeScript',
        topics: ['javascript', 'typescript', 'testing'],
        has_wiki: true,
        license: { spdx_id: 'MIT' },
      };
    });

    it('should evaluate technology criteria based on language', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Uses TypeScript',
        description: 'Project uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'language === TypeScript',
        createdAt: new Date(),
      });

      const result = criterion.evaluate(repositoryData);

      expect(result.result).toBe('pass');
      expect(result.resultValue).toBe(true);
      expect(result.confidence).toBe('definite');
      expect(result.supportingEvidence).toContain('TypeScript');
    });

    it('should evaluate technology criteria based on topics', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Has Testing',
        description: 'Project has testing topic',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'topics includes testing',
        createdAt: new Date(),
      });

      const result = criterion.evaluate(repositoryData);

      expect(result.result).toBe('pass');
      expect(result.resultValue).toBe(true);
    });

    it('should evaluate inclusion criteria', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Has Wiki',
        description: 'Project has wiki enabled',
        type: 'inclusion',
        evaluationType: 'automatic',
        evaluationLogic: 'has_wiki === true',
        createdAt: new Date(),
      });

      const result = criterion.evaluate(repositoryData);

      expect(result.result).toBe('pass');
      expect(result.resultValue).toBe(true);
    });

    it('should evaluate capability criteria', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Has License',
        description: 'Project has open source license',
        type: 'capability',
        evaluationType: 'automatic',
        evaluationLogic: 'license exists',
        createdAt: new Date(),
      });

      const result = criterion.evaluate(repositoryData);

      expect(result.result).toBe('pass');
      expect(result.resultValue).toBe(true);
      expect(result.supportingEvidence).toContain('MIT');
    });

    it('should fail when criteria not met', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Uses Python',
        description: 'Project uses Python',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'language === Python',
        createdAt: new Date(),
      });

      const result = criterion.evaluate(repositoryData);

      expect(result.result).toBe('fail');
      expect(result.resultValue).toBe(false);
    });

    it('should return manual review needed for manual criteria', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Code Quality',
        description: 'Project has good code quality',
        type: 'capability',
        evaluationType: 'manual',
        createdAt: new Date(),
      });

      const result = criterion.evaluate(repositoryData);

      expect(result.confidence).toBe('manual-review-needed');
      expect(result.supportingEvidence).toContain('Manual review required');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const criterion = new CustomCriterion({
        id: 'test',
        name: 'Test',
        description: 'Test Description',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'test logic',
        createdAt: new Date('2026-01-15'),
        result: 'pass',
        resultValue: true,
        confidence: 'definite',
        supportingEvidence: 'Test evidence',
        evaluatedAt: new Date('2026-01-15'),
      });

      const json = criterion.toJSON();

      expect(json.id).toBe('test');
      expect(json.name).toBe('Test');
      expect(json.result).toBe('pass');
      expect(json.createdAt).toBeDefined();
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'test',
        name: 'Test',
        description: 'Test Description',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'test logic',
        createdAt: '2026-01-15T00:00:00Z',
      };

      const criterion = CustomCriterion.fromJSON(json);

      expect(criterion.id).toBe('test');
      expect(criterion.name).toBe('Test');
      expect(criterion.createdAt).toBeInstanceOf(Date);
    });
  });
});
