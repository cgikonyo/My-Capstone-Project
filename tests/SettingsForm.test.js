/**
 * SettingsForm Tests
 * Simple assertion-based tests for validation and persistence
 */

// Simple assertion library
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}: ${message}`);
  }
  console.log(`✓ ${message}`);
}

function assertIncludes(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(`Expected "${str}" to include "${substring}": ${message}`);
  }
  console.log(`✓ ${message}`);
}

// Import the component
import SettingsForm from '../lib/SettingsForm.js';

// Test suite
class SettingsFormTests {
  constructor() {
    this.container = null;
    this.form = null;
  }

  setup() {
    // Clear localStorage
    localStorage.clear();

    // Create test container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    // Create and mount form
    this.form = document.createElement('settings-form');
    this.container.appendChild(this.form);
  }

  teardown() {
    if (this.container) {
      this.container.remove();
    }
    localStorage.clear();
  }

  getInput(name) {
    return this.form.querySelector(`[name="${name}"]`);
  }

  getErrorMessage(name) {
    return this.form.querySelector(`#${name}-error`);
  }

  getField(name) {
    return this.form.querySelector(`[name="${name}"]`);
  }

  // Test: Username validation - too short
  testUsernameValidationTooShort() {
    this.setup();
    const usernameInput = this.getInput('username');
    usernameInput.value = 'ab';
    usernameInput.dispatchEvent(new Event('blur'));

    const errorEl = this.getErrorMessage('username');
    assert(
      errorEl.style.display !== 'none' && errorEl.textContent.length > 0,
      'Username too short shows error'
    );
    assertEqual(
      usernameInput.getAttribute('aria-invalid'),
      'true',
      'Username input marked invalid'
    );

    this.teardown();
  }

  // Test: Username validation - too long
  testUsernameValidationTooLong() {
    this.setup();
    const usernameInput = this.getInput('username');
    usernameInput.value = 'a'.repeat(31);
    usernameInput.dispatchEvent(new Event('blur'));

    const errorEl = this.getErrorMessage('username');
    assert(
      errorEl.style.display !== 'none' && errorEl.textContent.length > 0,
      'Username too long shows error'
    );

    this.teardown();
  }

  // Test: Username validation - invalid characters
  testUsernameValidationInvalidChars() {
    this.setup();
    const usernameInput = this.getInput('username');
    usernameInput.value = 'user@name!';
    usernameInput.dispatchEvent(new Event('blur'));

    const errorEl = this.getErrorMessage('username');
    assert(
      errorEl.style.display !== 'none' && errorEl.textContent.length > 0,
      'Username with invalid chars shows error'
    );

    this.teardown();
  }

  // Test: Username validation - valid
  testUsernameValidationValid() {
    this.setup();
    const usernameInput = this.getInput('username');
    usernameInput.value = 'validUser123';
    usernameInput.dispatchEvent(new Event('blur'));

    const errorEl = this.getErrorMessage('username');
    assert(
      errorEl.style.display === 'none',
      'Valid username shows no error'
    );
    assertEqual(
      usernameInput.getAttribute('aria-invalid'),
      'false',
      'Valid username marked valid'
    );

    this.teardown();
  }

  // Test: Email validation - invalid format
  testEmailValidationInvalid() {
    this.setup();
    const emailInput = this.getInput('email');
    emailInput.value = 'invalid-email';
    emailInput.dispatchEvent(new Event('blur'));

    const errorEl = this.getErrorMessage('email');
    assert(
      errorEl.style.display !== 'none' && errorEl.textContent.length > 0,
      'Invalid email shows error'
    );

    this.teardown();
  }

  // Test: Email validation - valid
  testEmailValidationValid() {
    this.setup();
    const emailInput = this.getInput('email');
    emailInput.value = 'user@example.com';
    emailInput.dispatchEvent(new Event('blur'));

    const errorEl = this.getErrorMessage('email');
    assert(
      errorEl.style.display === 'none',
      'Valid email shows no error'
    );

    this.teardown();
  }

  // Test: Form does not submit when invalid
  testFormDoesNotSubmitWhenInvalid() {
    this.setup();
    const form = this.form.querySelector('.settings-form-root');
    const usernameInput = this.getInput('username');

    // Set invalid username
    usernameInput.value = 'ab';

    let submitCalled = false;
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(...args) {
      submitCalled = true;
      return originalSetItem.apply(this, args);
    };

    form.dispatchEvent(new Event('submit'));

    assert(
      !submitCalled,
      'Form does not persist to localStorage when invalid'
    );

    localStorage.setItem = originalSetItem;
    this.teardown();
  }

  // Test: Form state persists to localStorage
  testFormStatePersistence() {
    this.setup();

    // Set form values
    const usernameInput = this.getInput('username');
    const emailInput = this.getInput('email');
    const themeSelect = this.getInput('theme');

    usernameInput.value = 'testUser';
    emailInput.value = 'test@example.com';
    themeSelect.value = 'dark';

    // Submit form
    const form = this.form.querySelector('.settings-form-root');
    form.dispatchEvent(new Event('submit'));

    // Check localStorage
    const saved = JSON.parse(localStorage.getItem('settings-form-state'));
    assertEqual(saved.username, 'testUser', 'Username persisted');
    assertEqual(saved.email, 'test@example.com', 'Email persisted');
    assertEqual(saved.theme, 'dark', 'Theme persisted');

    this.teardown();
  }

  // Test: Form state loads from localStorage
  testFormStateLoadsFromStorage() {
    const testData = {
      username: 'savedUser',
      email: 'saved@example.com',
      theme: 'dark',
      notificationsEnabled: false
    };

    localStorage.setItem('settings-form-state', JSON.stringify(testData));

    this.setup();

    // Verify loaded values
    assertEqual(
      this.getInput('username').value,
      'savedUser',
      'Username loaded from storage'
    );
    assertEqual(
      this.getInput('email').value,
      'saved@example.com',
      'Email loaded from storage'
    );
    assertEqual(
      this.getInput('theme').value,
      'dark',
      'Theme loaded from storage'
    );

    this.teardown();
  }

  // Test: Submit button disabled during submission
  testSubmitButtonDisabledDuringSubmission() {
    this.setup();

    const submitBtn = this.form.querySelector('#submit-btn');
    const form = this.form.querySelector('.settings-form-root');

    // Set valid data
    this.getInput('username').value = 'validUser';
    this.getInput('email').value = 'test@example.com';

    // Verify button is enabled before submit
    assert(!submitBtn.disabled, 'Submit button initially enabled');

    // We can't easily test the disabled state during async operations in this test,
    // but we can verify the button state afterward
    form.dispatchEvent(new Event('submit'));

    // After submission, button should be re-enabled
    assert(!submitBtn.disabled, 'Submit button re-enabled after submission');

    this.teardown();
  }

  // Run all tests
  runAll() {
    console.log('\n=== SettingsForm Test Suite ===\n');

    const tests = [
      this.testUsernameValidationTooShort,
      this.testUsernameValidationTooLong,
      this.testUsernameValidationInvalidChars,
      this.testUsernameValidationValid,
      this.testEmailValidationInvalid,
      this.testEmailValidationValid,
      this.testFormDoesNotSubmitWhenInvalid,
      this.testFormStatePersistence,
      this.testFormStateLoadsFromStorage,
      this.testSubmitButtonDisabledDuringSubmission,
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
      try {
        test.call(this);
        passed++;
      } catch (e) {
        console.error(`✗ ${e.message}`);
        failed++;
      }
    });

    console.log(
      `\n=== Results: ${passed} passed, ${failed} failed ===\n`
    );

    return failed === 0;
  }
}

// Run tests if in Node.js or browser
if (typeof document !== 'undefined') {
  // Browser environment - tests would run when imported
  const suite = new SettingsFormTests();
  suite.runAll();
}

export default SettingsFormTests;
