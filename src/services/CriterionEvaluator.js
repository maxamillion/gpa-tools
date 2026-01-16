/**
 * CriterionEvaluator - Automatic evaluation logic for custom criteria
 *
 * Evaluates user-defined criteria automatically based on repository data.
 * Supports technology detection, file presence checks, and dependency analysis.
 *
 * @class CriterionEvaluator
 */
export class CriterionEvaluator {
  /**
   * Evaluate a custom criterion against repository data
   *
   * @param {Object} criterion - The custom criterion to evaluate
   * @param {Object} repoData - Repository data (language, dependencies, files)
   * @returns {Promise<Object>} Evaluation result with confidence and evidence
   */
  async evaluate(criterion, repoData) {
    if (!criterion || !repoData) {
      return {
        result: 'fail',
        resultValue: false,
        confidence: 'manual-review-needed',
        supportingEvidence: 'Unable to evaluate: missing criterion or repository data',
        evaluatedAt: new Date().toISOString()
      };
    }

    // Manual evaluation criteria require user input
    if (criterion.evaluationType === 'manual') {
      return {
        result: 'manual-review-needed',
        resultValue: null,
        confidence: 'manual-review-needed',
        supportingEvidence: 'This criterion requires manual evaluation',
        evaluatedAt: new Date().toISOString()
      };
    }

    // Automatic evaluation based on criterion type
    try {
      let evaluationResult;

      switch (criterion.type) {
        case 'technology':
          evaluationResult = await this.evaluateTechnology(criterion, repoData);
          break;
        case 'capability':
          evaluationResult = await this.evaluateCapability(criterion, repoData);
          break;
        case 'theme':
          evaluationResult = await this.evaluateTheme(criterion, repoData);
          break;
        case 'inclusion':
          evaluationResult = await this.evaluateInclusion(criterion, repoData);
          break;
        case 'exclusion':
          evaluationResult = await this.evaluateExclusion(criterion, repoData);
          break;
        default:
          evaluationResult = {
            result: 'manual-review-needed',
            resultValue: null,
            confidence: 'manual-review-needed',
            supportingEvidence: `Unknown criterion type: ${criterion.type}`
          };
      }

      return {
        ...evaluationResult,
        evaluatedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        result: 'fail',
        resultValue: false,
        confidence: 'manual-review-needed',
        supportingEvidence: `Evaluation error: ${error.message}`,
        evaluatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Evaluate technology-based criteria (e.g., "Uses TypeScript")
   */
  async evaluateTechnology(criterion, repoData) {
    const logic = criterion.evaluationLogic.toLowerCase();

    // Check for TypeScript
    if (logic.includes('typescript')) {
      const hasTypeScriptLanguage = repoData.language === 'TypeScript';
      const hasTypeScriptDep = this.hasDependency(repoData, 'typescript');

      if (hasTypeScriptLanguage) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: 'Primary language is TypeScript'
        };
      } else if (hasTypeScriptDep) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: 'TypeScript found in dependencies'
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: 'TypeScript not found in language or dependencies'
        };
      }
    }

    // Check for other languages or frameworks
    if (logic.includes('language') || logic.includes('framework')) {
      const technologies = this.extractTechnologies(logic);
      const found = technologies.some(tech =>
        repoData.language?.toLowerCase().includes(tech.toLowerCase()) ||
        this.hasDependency(repoData, tech)
      );

      if (found) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: `Technology detected in language or dependencies`
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: `Technology not found`
        };
      }
    }

    // Default: require manual review for complex logic
    return {
      result: 'manual-review-needed',
      resultValue: null,
      confidence: 'manual-review-needed',
      supportingEvidence: 'Unable to automatically evaluate this technology criterion'
    };
  }

  /**
   * Evaluate capability-based criteria (e.g., "Has Docker support")
   */
  async evaluateCapability(criterion, repoData) {
    const logic = criterion.evaluationLogic.toLowerCase();

    // Check for Docker
    if (logic.includes('docker')) {
      const hasDockerfile = this.hasFile(repoData, 'Dockerfile') ||
        this.hasFile(repoData, 'dockerfile');
      const hasDockerCompose = this.hasFile(repoData, 'docker-compose.yml') ||
        this.hasFile(repoData, 'docker-compose.yaml');

      if (hasDockerfile || hasDockerCompose) {
        const files = [];
        if (hasDockerfile) files.push('Dockerfile');
        if (hasDockerCompose) files.push('docker-compose.yml');

        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: `Found: ${files.join(', ')}`
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: 'Dockerfile or docker-compose.yml not found'
        };
      }
    }

    // Check for CI/CD
    if (logic.includes('ci') || logic.includes('cicd')) {
      const hasCIConfig = this.hasFile(repoData, '.github/workflows') ||
        this.hasFile(repoData, '.gitlab-ci.yml') ||
        this.hasFile(repoData, '.circleci/config.yml') ||
        this.hasFile(repoData, 'Jenkinsfile');

      if (hasCIConfig) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: 'CI/CD configuration detected'
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: 'No CI/CD configuration found'
        };
      }
    }

    // Default: require manual review
    return {
      result: 'manual-review-needed',
      resultValue: null,
      confidence: 'manual-review-needed',
      supportingEvidence: 'Unable to automatically evaluate this capability criterion'
    };
  }

  /**
   * Evaluate theme-based criteria (e.g., "Has testing framework")
   */
  async evaluateTheme(criterion, repoData) {
    const logic = criterion.evaluationLogic.toLowerCase();

    // Check for testing frameworks
    if (logic.includes('test') || logic.includes('jest') || logic.includes('vitest') ||
      logic.includes('mocha') || logic.includes('playwright')) {
      const testFrameworks = ['jest', 'vitest', 'mocha', 'playwright', 'cypress', 'jasmine'];
      const found = testFrameworks.filter(framework => this.hasDependency(repoData, framework));

      if (found.length > 0) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: `Found testing frameworks: ${found.join(', ')}`
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: 'No testing framework found in dependencies'
        };
      }
    }

    // Check for linting/formatting tools
    if (logic.includes('lint') || logic.includes('format') || logic.includes('prettier') ||
      logic.includes('eslint')) {
      const linters = ['eslint', 'prettier', 'stylelint', 'tslint'];
      const found = linters.filter(linter => this.hasDependency(repoData, linter));

      if (found.length > 0) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: `Found linting/formatting tools: ${found.join(', ')}`
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: 'No linting/formatting tools found'
        };
      }
    }

    // Default: require manual review
    return {
      result: 'manual-review-needed',
      resultValue: null,
      confidence: 'manual-review-needed',
      supportingEvidence: 'Unable to automatically evaluate this theme criterion'
    };
  }

  /**
   * Evaluate inclusion criteria (must have)
   */
  async evaluateInclusion(criterion, repoData) {
    const logic = criterion.evaluationLogic.toLowerCase();

    // Check for license
    if (logic.includes('license')) {
      const hasLicense = repoData.license && repoData.license !== null;

      if (hasLicense) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: `License found: ${repoData.license}`
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: 'No license found'
        };
      }
    }

    // Default: require manual review
    return {
      result: 'manual-review-needed',
      resultValue: null,
      confidence: 'manual-review-needed',
      supportingEvidence: 'Unable to automatically evaluate this inclusion criterion'
    };
  }

  /**
   * Evaluate exclusion criteria (must not have)
   */
  async evaluateExclusion(criterion, repoData) {
    const logic = criterion.evaluationLogic.toLowerCase();

    // Check for copyleft licenses
    if (logic.includes('copyleft') || logic.includes('gpl') || logic.includes('agpl')) {
      const license = repoData.license?.toLowerCase() || '';
      const isCopyleft = license.includes('gpl') || license.includes('agpl');

      if (!isCopyleft) {
        return {
          result: 'pass',
          resultValue: true,
          confidence: 'definite',
          supportingEvidence: `License is not copyleft: ${repoData.license || 'No license'}`
        };
      } else {
        return {
          result: 'fail',
          resultValue: false,
          confidence: 'definite',
          supportingEvidence: `Copyleft license detected: ${repoData.license}`
        };
      }
    }

    // Default: require manual review
    return {
      result: 'manual-review-needed',
      resultValue: null,
      confidence: 'manual-review-needed',
      supportingEvidence: 'Unable to automatically evaluate this exclusion criterion'
    };
  }

  /**
   * Helper: Check if repository has a specific dependency
   */
  hasDependency(repoData, depName) {
    if (!repoData.dependencies) return false;

    const deps = repoData.dependencies;
    const devDeps = repoData.devDependencies || {};
    const allDeps = { ...deps, ...devDeps };

    return Object.keys(allDeps).some(key =>
      key.toLowerCase().includes(depName.toLowerCase())
    );
  }

  /**
   * Helper: Check if repository has a specific file
   */
  hasFile(repoData, fileName) {
    if (!repoData.files || !Array.isArray(repoData.files)) return false;

    return repoData.files.some(file =>
      file.toLowerCase().includes(fileName.toLowerCase())
    );
  }

  /**
   * Helper: Extract technology names from evaluation logic
   */
  extractTechnologies(logic) {
    // Simple extraction - can be enhanced with NLP
    const commonTechs = [
      'react', 'vue', 'angular', 'svelte',
      'node', 'deno', 'bun',
      'python', 'ruby', 'go', 'rust', 'java', 'kotlin',
      'typescript', 'javascript'
    ];

    return commonTechs.filter(tech => logic.includes(tech));
  }
}
