/**
 * SettingsForm - Accessible Web Component for user settings
 * Implements validation, persistence, and accessibility features
 */

class SettingsForm extends HTMLElement {
  constructor() {
    super();
    this.errors = {};
    this.isSubmitting = false;
    this.STORAGE_KEY = 'settings-form-state';
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.loadSavedState();
  }

  render() {
    this.innerHTML = `
      <form class="settings-form-root" novalidate>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            minlength="3"
            maxlength="30"
            required
            aria-invalid="false"
            aria-describedby="username-error"
          />
          <div
            id="username-error"
            class="error-message"
            role="alert"
            style="display: none; color: red; font-size: 0.875rem; margin-top: 0.25rem;"
          ></div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            aria-invalid="false"
            aria-describedby="email-error"
          />
          <div
            id="email-error"
            class="error-message"
            role="alert"
            style="display: none; color: red; font-size: 0.875rem; margin-top: 0.25rem;"
          ></div>
        </div>

        <div class="form-group">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" aria-invalid="false">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div class="form-group">
          <label for="notificationsEnabled">
            <input
              type="checkbox"
              id="notificationsEnabled"
              name="notificationsEnabled"
              checked
              aria-invalid="false"
            />
            Enable notifications
          </label>
        </div>

        <button type="submit" id="submit-btn">Save Settings</button>
      </form>
    `;

    // Add basic styles
    const style = document.createElement('style');
    style.textContent = `
      .settings-form-root {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 400px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      label {
        font-weight: 600;
        font-size: 0.875rem;
      }
      input[type="text"],
      input[type="email"],
      select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      input[type="text"]:focus,
      input[type="email"]:focus,
      select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }
      input[aria-invalid="true"],
      input[aria-invalid="true"]:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
      }
      button {
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
      }
      button:hover:not(:disabled) {
        background-color: #0056b3;
      }
      button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }
    `;
    this.appendChild(style);
  }

  attachEventListeners() {
    const form = this.querySelector('.settings-form-root');
    const inputs = form.querySelectorAll('input, select');

    // Validate on blur
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
    });

    // Submit handler
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const fieldName = field.name;
    const value = field.type === 'checkbox' ? field.checked : field.value;
    let error = '';

    if (fieldName === 'username') {
      if (!value) {
        error = 'Username is required';
      } else if (value.length < 3) {
        error = 'Username must be 3-30 alphanumeric characters';
      } else if (value.length > 30) {
        error = 'Username must be 3-30 alphanumeric characters';
      } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
        error = 'Username must be 3-30 alphanumeric characters';
      }
    } else if (fieldName === 'email') {
      if (!value) {
        error = 'Email is required';
      } else if (!this.isValidEmail(value)) {
        error = 'Please enter a valid email address';
      }
    }

    this.setFieldError(fieldName, error);
  }

  isValidEmail(email) {
    // RFC 5322 simplified regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  setFieldError(fieldName, error) {
    const input = this.querySelector(`[name="${fieldName}"]`);
    const errorEl = this.querySelector(`#${fieldName}-error`);

    if (error) {
      this.errors[fieldName] = error;
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    } else {
      delete this.errors[fieldName];
      input.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  validateAllFields() {
    const form = this.querySelector('.settings-form-root');
    const inputs = form.querySelectorAll('input, select');
    this.errors = {};

    inputs.forEach(input => {
      this.validateField(input);
    });

    return Object.keys(this.errors).length === 0;
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    if (!this.validateAllFields()) {
      return;
    }

    this.isSubmitting = true;
    const submitBtn = this.querySelector('#submit-btn');
    submitBtn.disabled = true;

    const form = this.querySelector('.settings-form-root');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('[SettingsForm] Settings saved:', data);
      alert('Settings saved successfully!');
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[SettingsForm] localStorage quota exceeded');
        alert('Unable to save settings: storage quota exceeded. Please clear some data.');
      } else {
        console.error('[SettingsForm] Error saving settings:', e);
        alert('Error saving settings. Please try again.');
      }
    } finally {
      this.isSubmitting = false;
      submitBtn.disabled = false;
    }
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const form = this.querySelector('.settings-form-root');

        Object.entries(data).forEach(([key, value]) => {
          const input = form.querySelector(`[name="${key}"]`);
          if (input) {
            if (input.type === 'checkbox') {
              input.checked = value;
            } else {
              input.value = value;
            }
          }
        });
      }
    } catch (e) {
      console.error('[SettingsForm] Error loading saved state:', e);
    }
  }
}

customElements.define('settings-form', SettingsForm);

export default SettingsForm;
