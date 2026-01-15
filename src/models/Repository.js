/**
 * Repository Model
 * Represents a GitHub repository with validation
 *
 * Per data-model.md:
 * - Validates owner/name pattern
 * - Validates GitHub URL format
 * - Ensures non-negative stars/forks
 * - Ensures createdAt < updatedAt
 * - Provides computed properties (fullName, age)
 */

export class Repository {
  // eslint-disable-next-line complexity -- Comprehensive input validation is appropriate for model constructor
  constructor({
    owner,
    name,
    url,
    description = null,
    language = null,
    stars,
    forks,
    createdAt,
    updatedAt,
    license = null,
    isArchived,
    isPrivate,
  }) {
    // Validate owner name pattern
    const namePattern = /^[a-zA-Z0-9-_.]+$/;
    if (!owner || !namePattern.test(owner)) {
      throw new Error('Invalid owner name');
    }

    // Validate repository name pattern
    if (!name || !namePattern.test(name)) {
      throw new Error('Invalid repository name');
    }

    // Validate GitHub URL
    if (!url || !url.startsWith('https://github.com/')) {
      throw new Error('Invalid GitHub URL');
    }

    // Validate non-negative integers
    if (stars < 0 || forks < 0) {
      throw new Error('Stars and forks must be non-negative');
    }

    // Validate date ordering
    const createdDate = new Date(createdAt);
    const updatedDate = new Date(updatedAt);
    if (createdDate > updatedDate) {
      throw new Error('Created date must be before updated date');
    }

    // Assign properties
    this.owner = owner;
    this.name = name;
    this.url = url;
    this.description = description;
    this.language = language;
    this.stars = stars;
    this.forks = forks;
    this.createdAt = createdDate;
    this.updatedAt = updatedDate;
    this.license = license;
    this.isArchived = isArchived;
    this.isPrivate = isPrivate;
  }

  /**
   * Computed property: owner/name
   */
  get fullName() {
    return `${this.owner}/${this.name}`;
  }

  /**
   * Computed property: days since creation
   */
  get age() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
