/**
 * CustomCriteriaForm Web Component
 *
 * Allows users to add, edit, and delete custom evaluation criteria.
 * Displays list of criteria with results and confidence levels.
 *
 * Events:
 * - criterion-added: { criterion }
 * - criterion-deleted: { criterionId }
 * - criterion-updated: { criterion }
 *
 * @class CustomCriteriaForm
 * @extends HTMLElement
 */
export class CustomCriteriaForm extends HTMLElement {
  constructor() {
    super();
    this._criteria = [];
    this._editingId = null;
    this._showForm = false;
  }

  connectedCallback() {
    this.setAttribute('role', 'region');
    this.setAttribute('aria-label', 'Custom evaluation criteria');
    this.render();
    this.attachEventListeners();
  }

  set criteria(value) {
    this._criteria = value || [];
    if (this.isConnected) {
      this.render();
      this.attachEventListeners();
    }
  }

  get criteria() {
    return this._criteria;
  }

  render() {
    this.innerHTML = `
      <div class="custom-criteria-container">
        <div class="criteria-header">
          <h2>Custom Evaluation Criteria</h2>
          <p class="criteria-description">
            Add custom criteria to evaluate projects based on your specific requirements.
          </p>
        </div>

        ${this._renderCriteriaList()}
        ${this._renderForm()}

        ${!this._showForm ? `
          <button
            class="add-criterion-button"
            aria-label="Add new custom criterion"
            type="button"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2"/>
            </svg>
            Add Custom Criterion
          </button>
        ` : ''}
      </div>
    `;
  }

  _renderCriteriaList() {
    if (this._criteria.length === 0 && !this._showForm) {
      return `
        <div class="no-criteria-message" role="status">
          <p>No custom criteria yet. Click the button below to add your first criterion.</p>
        </div>
      `;
    }

    if (this._criteria.length === 0) {
      return '<ul class="criteria-list" role="list"></ul>';
    }

    const criteriaHTML = this._criteria.map(criterion => `
      <li class="criterion-item" data-criterion-id="${criterion.id}">
        <div class="criterion-content">
          <div class="criterion-header">
            <h3 class="criterion-name">${this.escapeHtml(criterion.name)}</h3>
            <span class="criterion-type badge">${this.escapeHtml(criterion.type)}</span>
          </div>

          <p class="criterion-description">${this.escapeHtml(criterion.description)}</p>

          ${criterion.result ? `
            <div class="criterion-result">
              <span class="result-badge result-${criterion.result}" role="status">
                ${this._formatResult(criterion.result)}
              </span>
              <span class="confidence-badge" aria-label="Confidence: ${criterion.confidence}">
                ${this._formatConfidence(criterion.confidence)}
              </span>
              ${criterion.supportingEvidence ? `
                <p class="supporting-evidence">
                  <strong>Evidence:</strong> ${this.escapeHtml(criterion.supportingEvidence)}
                </p>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <div class="criterion-actions">
          <button
            class="edit-criterion-button"
            data-criterion-id="${criterion.id}"
            aria-label="Edit ${criterion.name}"
            type="button"
          >
            Edit
          </button>
          <button
            class="delete-criterion-button"
            data-criterion-id="${criterion.id}"
            aria-label="Delete ${criterion.name}"
            type="button"
          >
            Delete
          </button>
        </div>
      </li>
    `).join('');

    return `
      <ul class="criteria-list" role="list">
        ${criteriaHTML}
      </ul>
    `;
  }

  _renderForm() {
    if (!this._showForm) return '';

    const editing = this._editingId
      ? this._criteria.find(c => c.id === this._editingId)
      : null;

    return `
      <form class="criterion-form" aria-labelledby="form-heading">
        <h3 id="form-heading">${editing ? 'Edit' : 'Add'} Custom Criterion</h3>

        <div class="form-group">
          <label for="criterion-name">
            Name <span class="required" aria-label="required">*</span>
          </label>
          <input
            type="text"
            id="criterion-name"
            name="name"
            value="${editing ? this.escapeHtml(editing.name) : ''}"
            placeholder="e.g., Uses TypeScript"
            required
            aria-required="true"
          />
        </div>

        <div class="form-group">
          <label for="criterion-description">
            Description <span class="required" aria-label="required">*</span>
          </label>
          <textarea
            id="criterion-description"
            name="description"
            rows="3"
            placeholder="Describe what this criterion evaluates"
            required
            aria-required="true"
          >${editing ? this.escapeHtml(editing.description) : ''}</textarea>
        </div>

        <div class="form-group">
          <label for="criterion-type">
            Type <span class="required" aria-label="required">*</span>
          </label>
          <select
            id="criterion-type"
            name="type"
            required
            aria-required="true"
          >
            <option value="">-- Select Type --</option>
            <option value="technology" ${editing?.type === 'technology' ? 'selected' : ''}>
              Technology (e.g., programming language, framework)
            </option>
            <option value="capability" ${editing?.type === 'capability' ? 'selected' : ''}>
              Capability (e.g., has Docker, CI/CD)
            </option>
            <option value="theme" ${editing?.type === 'theme' ? 'selected' : ''}>
              Theme (e.g., testing, linting, documentation)
            </option>
            <option value="inclusion" ${editing?.type === 'inclusion' ? 'selected' : ''}>
              Inclusion (must have)
            </option>
            <option value="exclusion" ${editing?.type === 'exclusion' ? 'selected' : ''}>
              Exclusion (must not have)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="criterion-evaluation-type">
            Evaluation Method
          </label>
          <select
            id="criterion-evaluation-type"
            name="evaluationType"
          >
            <option value="automatic" ${editing?.evaluationType === 'automatic' ? 'selected' : ''}>
              Automatic (try to evaluate automatically)
            </option>
            <option value="manual" ${editing?.evaluationType === 'manual' ? 'selected' : ''}>
              Manual (I will evaluate this myself)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="criterion-logic">
            Evaluation Logic (optional)
          </label>
          <input
            type="text"
            id="criterion-logic"
            name="evaluationLogic"
            value="${editing?.evaluationLogic ? this.escapeHtml(editing.evaluationLogic) : ''}"
            placeholder="e.g., check for typescript in dependencies"
          />
          <span class="form-hint">
            Describe how to automatically evaluate this criterion (used for automatic evaluation)
          </span>
        </div>

        <div class="error-message" role="alert" aria-live="polite" hidden></div>

        <div class="form-actions">
          <button type="submit" class="submit-button">
            ${editing ? 'Update' : 'Add'} Criterion
          </button>
          <button type="button" class="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    `;
  }

  attachEventListeners() {
    // Add criterion button
    const addButton = this.querySelector('.add-criterion-button');
    addButton?.addEventListener('click', () => this._showAddForm());

    // Form submission
    const form = this.querySelector('.criterion-form');
    form?.addEventListener('submit', (e) => this._handleSubmit(e));

    // Cancel button
    const cancelButton = this.querySelector('.cancel-button');
    cancelButton?.addEventListener('click', () => this._hideForm());

    // Edit buttons
    const editButtons = this.querySelectorAll('.edit-criterion-button');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.criterionId;
        this._showEditForm(id);
      });
    });

    // Delete buttons
    const deleteButtons = this.querySelectorAll('.delete-criterion-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.criterionId;
        this._deleteCriterion(id);
      });
    });

    // Keyboard support for add button
    addButton?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._showAddForm();
      }
    });
  }

  _showAddForm() {
    this._editingId = null;
    this._showForm = true;
    this.render();
    this.attachEventListeners();

    // Focus first input
    setTimeout(() => {
      this.querySelector('#criterion-name')?.focus();
    }, 10);
  }

  _showEditForm(id) {
    this._editingId = id;
    this._showForm = true;
    this.render();
    this.attachEventListeners();

    // Focus first input
    setTimeout(() => {
      this.querySelector('#criterion-name')?.focus();
    }, 10);
  }

  _hideForm() {
    this._showForm = false;
    this._editingId = null;
    this.render();
    this.attachEventListeners();
  }

  _handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name')?.trim();
    const description = formData.get('description')?.trim();
    const type = formData.get('type');
    const evaluationType = formData.get('evaluationType') || 'automatic';
    const evaluationLogic = formData.get('evaluationLogic')?.trim();

    // Validation
    if (!name || !description || !type) {
      this._showError('All required fields must be filled out');
      return;
    }

    const criterion = {
      id: this._editingId || `criterion-${Date.now()}`,
      name,
      description,
      type,
      evaluationType,
      evaluationLogic: evaluationLogic || '',
      createdAt: this._editingId
        ? this._criteria.find(c => c.id === this._editingId)?.createdAt
        : new Date().toISOString()
    };

    // Dispatch event
    const eventType = this._editingId ? 'criterion-updated' : 'criterion-added';
    this.dispatchEvent(new CustomEvent(eventType, {
      bubbles: true,
      detail: { criterion }
    }));

    this._hideForm();
  }

  _deleteCriterion(id) {
    if (!confirm('Are you sure you want to delete this criterion?')) {
      return;
    }

    this.dispatchEvent(new CustomEvent('criterion-deleted', {
      bubbles: true,
      detail: { criterionId: id }
    }));
  }

  _showError(message) {
    const errorEl = this.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  _formatResult(result) {
    const labels = {
      'pass': 'Pass',
      'fail': 'Fail',
      'score': 'Score',
      'manual-review-needed': 'Manual Review Needed'
    };
    return labels[result] || result;
  }

  _formatConfidence(confidence) {
    const labels = {
      'definite': 'Definite',
      'likely': 'Likely',
      'manual-review-needed': 'Manual Review Needed'
    };
    return labels[confidence] || confidence;
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Register component
customElements.define('custom-criteria-form', CustomCriteriaForm);
