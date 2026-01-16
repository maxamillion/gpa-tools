/**
 * CustomCriterion Model
 * Represents a user-defined evaluation criterion
 * FR-009 to FR-015: Custom evaluation criteria support
 */

export class CustomCriterion {
  constructor({
    id,
    name,
    description,
    type,
    evaluationType,
    evaluationLogic,
    result,
    resultValue,
    confidence,
    supportingEvidence,
    createdAt,
    evaluatedAt,
  }) {
    // Required fields
    if (!id || !name || !description || !type || !evaluationType || !createdAt) {
      throw new Error(
        'CustomCriterion requires: id, name, description, type, evaluationType, createdAt'
      );
    }

    // Validate type
    const validTypes = ['technology', 'theme', 'capability', 'inclusion', 'exclusion'];
    if (!validTypes.includes(type)) {
      throw new Error(`type must be one of: ${validTypes.join(', ')}`);
    }

    // Validate evaluationType
    const validEvaluationTypes = ['automatic', 'manual'];
    if (!validEvaluationTypes.includes(evaluationType)) {
      throw new Error(`evaluationType must be one of: ${validEvaluationTypes.join(', ')}`);
    }

    // Validate evaluationLogic requirement
    if (evaluationType === 'automatic' && !evaluationLogic) {
      throw new Error('evaluationLogic is required for automatic evaluation');
    }

    // Validate result
    if (result) {
      const validResults = ['pass', 'fail', 'score'];
      if (!validResults.includes(result)) {
        throw new Error(`result must be one of: ${validResults.join(', ')}`);
      }
    }

    // Validate confidence
    if (confidence) {
      const validConfidenceLevels = ['definite', 'likely', 'manual-review-needed'];
      if (!validConfidenceLevels.includes(confidence)) {
        throw new Error(`confidence must be one of: ${validConfidenceLevels.join(', ')}`);
      }
    }

    // Validate evaluatedAt requirement
    if (result && !evaluatedAt) {
      throw new Error('evaluatedAt is required when result is present');
    }

    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.evaluationType = evaluationType;
    this.evaluationLogic = evaluationLogic;
    this.result = result;
    this.resultValue = resultValue;
    this.confidence = confidence;
    this.supportingEvidence = supportingEvidence;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.evaluatedAt = evaluatedAt
      ? evaluatedAt instanceof Date
        ? evaluatedAt
        : new Date(evaluatedAt)
      : undefined;
  }

  /**
   * Evaluate this criterion against repository data
   * FR-013: Automatic evaluation of technology/file-based criteria
   * FR-015: Confidence levels and supporting evidence
   */
  evaluate(repositoryData, filesData = {}) {
    // Manual evaluation returns placeholder
    if (this.evaluationType === 'manual') {
      return {
        id: this.id,
        result: undefined,
        resultValue: undefined,
        confidence: 'manual-review-needed',
        supportingEvidence: 'Manual review required for this criterion',
        evaluatedAt: new Date(),
      };
    }

    // Automatic evaluation based on evaluation logic
    const logic = this.evaluationLogic.toLowerCase();
    const originalLogic = this.evaluationLogic; // Preserve original case
    let passed = false;
    let evidence = [];

    // Evaluate based on repository language
    if (logic.includes('language')) {
      const targetLang = this.extractTargetValue(originalLogic, 'language');
      if (targetLang && repositoryData.language === targetLang) {
        passed = true;
        evidence.push(`Primary language is ${targetLang}`);
      } else if (targetLang) {
        evidence.push(
          `Primary language is ${repositoryData.language}, expected ${targetLang}`
        );
      } else {
        evidence.push('Could not extract target language from evaluation logic');
      }
    }

    // Evaluate based on topics
    if (logic.includes('topics')) {
      const targetTopic = this.extractTargetValue(originalLogic, 'topics');
      if (
        targetTopic &&
        repositoryData.topics &&
        repositoryData.topics.some((t) => t.toLowerCase() === targetTopic.toLowerCase())
      ) {
        passed = true;
        evidence.push(`Found topic: ${targetTopic}`);
      } else if (targetTopic) {
        evidence.push(`Topic ${targetTopic} not found in repository topics`);
      }
    }

    // Evaluate based on wiki presence
    if (logic.includes('has_wiki')) {
      if (repositoryData.has_wiki === true) {
        passed = true;
        evidence.push('Repository has wiki enabled');
      } else {
        evidence.push('Repository does not have wiki enabled');
      }
    }

    // Evaluate based on license
    if (logic.includes('license')) {
      if (repositoryData.license && repositoryData.license.spdx_id) {
        passed = true;
        evidence.push(`License: ${repositoryData.license.spdx_id}`);
      } else {
        evidence.push('No license found');
      }
    }

    // Evaluate based on dependencies (from package.json)
    if (logic.includes('dependencies') || logic.includes('devdependencies')) {
      const targetDep = this.extractTargetValue(originalLogic, 'dependencies');
      if (targetDep && filesData.packageJson) {
        const deps = filesData.packageJson.dependencies || {};
        const devDeps = filesData.packageJson.devDependencies || {};
        if (deps[targetDep] || devDeps[targetDep]) {
          passed = true;
          evidence.push(`Found ${targetDep} in dependencies`);
        } else {
          evidence.push(`${targetDep} not found in dependencies`);
        }
      } else if (targetDep) {
        evidence.push('No package.json available for dependency check');
      }
    }

    // Evaluate based on file existence
    if (logic.includes('file exists')) {
      const targetFile = this.extractTargetValue(originalLogic, 'file');
      if (targetFile && filesData[targetFile]) {
        passed = true;
        evidence.push(`Found file: ${targetFile}`);
      } else if (targetFile) {
        evidence.push(`File ${targetFile} not found`);
      }
    }

    return {
      id: this.id,
      result: passed ? 'pass' : 'fail',
      resultValue: passed,
      confidence: passed ? 'definite' : 'likely',
      supportingEvidence: evidence.join('; '),
      evaluatedAt: new Date(),
    };
  }

  /**
   * Extract target value from evaluation logic string
   * Helper for parsing simple evaluation rules
   */
  extractTargetValue(logic, keyword) {
    // Simple pattern matching for common formats:
    // "language === TypeScript"
    // "topics includes testing"
    // "dependencies includes typescript"
    // Also handles words after keyword without operator

    const patterns = [
      new RegExp(`${keyword}\\s*===\\s*([\\w-]+)`, 'i'),
      new RegExp(`${keyword}\\s+includes?\\s+([\\w-]+)`, 'i'),
      new RegExp(`${keyword}\\s+contains?\\s+([\\w-]+)`, 'i'),
      new RegExp(`${keyword}\\s+([\\w-]+)`, 'i'), // Fallback: keyword followed by word
    ];

    for (const pattern of patterns) {
      const match = logic.match(pattern);
      if (match && match[1] && match[1] !== 'exists' && match[1] !== 'true') {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      evaluationType: this.evaluationType,
      evaluationLogic: this.evaluationLogic,
      result: this.result,
      resultValue: this.resultValue,
      confidence: this.confidence,
      supportingEvidence: this.supportingEvidence,
      createdAt: this.createdAt.toISOString(),
      evaluatedAt: this.evaluatedAt ? this.evaluatedAt.toISOString() : undefined,
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json) {
    return new CustomCriterion({
      ...json,
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
      evaluatedAt: json.evaluatedAt ? new Date(json.evaluatedAt) : undefined,
    });
  }

  /**
   * Create a new criterion with generated ID
   */
  static create(data) {
    const id = `criterion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new CustomCriterion({
      id,
      createdAt: new Date(),
      ...data,
    });
  }
}
