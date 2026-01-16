import { describe, it, expect } from 'vitest';
import { CriterionEvaluator } from '../../../src/services/CriterionEvaluator.js';

describe('CriterionEvaluator', () => {
  let evaluator;

  beforeEach(() => {
    evaluator = new CriterionEvaluator();
  });

  describe('Technology Detection', () => {
    it('should detect TypeScript from primary language', async () => {
      const criterion = {
        id: 'has-typescript',
        name: 'Uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'check language === TypeScript OR typescript in dependencies'
      };

      const repoData = {
        language: 'TypeScript',
        dependencies: {}
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'pass',
        resultValue: true,
        confidence: 'definite',
        supportingEvidence: expect.stringContaining('Primary language is TypeScript')
      });
    });

    it('should detect TypeScript from dependencies', async () => {
      const criterion = {
        id: 'has-typescript',
        name: 'Uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'check language === TypeScript OR typescript in dependencies'
      };

      const repoData = {
        language: 'JavaScript',
        dependencies: {
          typescript: '^5.0.0'
        }
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'pass',
        resultValue: true,
        confidence: 'definite',
        supportingEvidence: expect.stringContaining('TypeScript found in dependencies')
      });
    });

    it('should fail when TypeScript not present', async () => {
      const criterion = {
        id: 'has-typescript',
        name: 'Uses TypeScript',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'check language === TypeScript OR typescript in dependencies'
      };

      const repoData = {
        language: 'JavaScript',
        dependencies: {}
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'fail',
        resultValue: false,
        confidence: 'definite',
        supportingEvidence: 'TypeScript not found in language or dependencies'
      });
    });
  });

  describe('File-Based Criteria', () => {
    it('should detect presence of specific files', async () => {
      const criterion = {
        id: 'has-docker',
        name: 'Has Dockerfile',
        type: 'capability',
        evaluationType: 'automatic',
        evaluationLogic: 'check for Dockerfile or docker-compose.yml'
      };

      const repoData = {
        files: ['Dockerfile', 'src/index.js', 'README.md']
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'pass',
        resultValue: true,
        confidence: 'definite',
        supportingEvidence: expect.stringContaining('Found: Dockerfile')
      });
    });

    it('should handle missing files', async () => {
      const criterion = {
        id: 'has-docker',
        name: 'Has Dockerfile',
        type: 'capability',
        evaluationType: 'automatic',
        evaluationLogic: 'check for Dockerfile or docker-compose.yml'
      };

      const repoData = {
        files: ['src/index.js', 'README.md']
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'fail',
        resultValue: false,
        confidence: 'definite',
        supportingEvidence: 'Dockerfile or docker-compose.yml not found'
      });
    });
  });

  describe('Theme Criteria', () => {
    it('should detect testing frameworks from dependencies', async () => {
      const criterion = {
        id: 'has-testing',
        name: 'Has Testing Framework',
        type: 'theme',
        evaluationType: 'automatic',
        evaluationLogic: 'check for jest, vitest, mocha, or playwright in dependencies'
      };

      const repoData = {
        dependencies: {
          vitest: '^1.0.0',
          playwright: '^1.40.0'
        }
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'pass',
        resultValue: true,
        confidence: 'definite',
        supportingEvidence: expect.stringContaining('Found testing frameworks: vitest, playwright')
      });
    });
  });

  describe('Manual Evaluation', () => {
    it('should require manual review for manual criteria', async () => {
      const criterion = {
        id: 'good-docs',
        name: 'Has Good Documentation',
        type: 'capability',
        evaluationType: 'manual'
      };

      const repoData = {};

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'manual-review-needed',
        confidence: 'manual-review-needed',
        supportingEvidence: 'This criterion requires manual evaluation'
      });
    });
  });

  describe('Inclusion/Exclusion Criteria', () => {
    it('should handle inclusion criteria (must have)', async () => {
      const criterion = {
        id: 'requires-license',
        name: 'Must Have License',
        type: 'inclusion',
        evaluationType: 'automatic',
        evaluationLogic: 'check for license field'
      };

      const repoData = {
        license: 'MIT'
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'pass',
        resultValue: true,
        confidence: 'definite'
      });
    });

    it('should handle exclusion criteria (must not have)', async () => {
      const criterion = {
        id: 'no-copyleft',
        name: 'No Copyleft License',
        type: 'exclusion',
        evaluationType: 'automatic',
        evaluationLogic: 'check license not GPL or AGPL'
      };

      const repoData = {
        license: 'MIT'
      };

      const result = await evaluator.evaluate(criterion, repoData);

      expect(result).toMatchObject({
        result: 'pass',
        resultValue: true,
        confidence: 'definite'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing repository data gracefully', async () => {
      const criterion = {
        id: 'test',
        name: 'Test',
        type: 'technology',
        evaluationType: 'automatic',
        evaluationLogic: 'check something'
      };

      const result = await evaluator.evaluate(criterion, null);

      expect(result).toMatchObject({
        result: 'fail',
        confidence: 'manual-review-needed',
        supportingEvidence: expect.stringContaining('Unable to evaluate')
      });
    });
  });
});
