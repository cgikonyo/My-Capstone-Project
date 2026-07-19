# Project Conventions & AI Assistant Guidelines

This file documents conventions learned from the AI-assisted development drill (WORKFLOW.md). Read this before suggesting features or refactors.

## Stack

- Runtime: Node.js LTS (v22+)
- Module system: ES6 modules
- Architecture: Web Components + vanilla JS (no frameworks)
- Testing: Simple assertion library (no external test runner required)
- Styling: Inline CSS or separate stylesheets (no CSS-in-JS)

## Code Style & Structure

### Rule 1: All forms must use Web Components with lifecycle management

**Applies to:** Any form component, input group, or interactive element

**Pattern:**
```js
class MyForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.loadState();
  }

  render() {
    // Use innerHTML or createElement
  }

  attachEventListeners() {
    // Attach event listeners to elements
  }
}

customElements.define('my-form', MyForm);
export default MyForm;
```

**Why:** Web Components provide:
- Encapsulation and reusability
- Built-in lifecycle hooks (connectedCallback, disconnectedCallback)
- Can be used multiple times on the same page
- Easy to test and mock

**Fail condition:** If a form is exported as a DOM element directly (not a class), revise to Web Component.

---

### Rule 2: Input validation must be tested and accessible with aria-* attributes

**Applies to:** Any input field with validation rules

**Required accessibility:**
- `<label for="id">` paired with `<input id="id">`
- `aria-invalid="true/false"` updated when field state changes
- `aria-describedby="error-id"` pointing to error message element
- `role="alert"` on error message divs
- Error display/hide synced with validation state

**Required validation:**
- On `blur` event (user leaves field)
- On form `submit` event (before submission)
- Custom validation regex (don't rely on native HTML5 validation alone)
- Clear error messages shown inline

**Testing:**
- Unit test for each validation rule
- Test that form doesn't submit when any field invalid
- Test that errors are cleared when field becomes valid
- Run tests before committing

**Fail condition:** If form has inputs without labels, or no aria-invalid/aria-describedby, or no error messages displayed, revise.

---

### Rule 3: State persistence requires localStorage with error handling

**Applies to:** Any form that should remember user input across page reloads

**Pattern:**
```js
loadSavedState() {
  try {
    const saved = localStorage.getItem('my-storage-key');
    if (saved) {
      const data = JSON.parse(saved);
      // Restore form state from data
    }
  } catch (e) {
    console.error('Error loading state:', e);
    // Continue without state
  }
}

handleSubmit(e) {
  e.preventDefault();
  if (!this.validateAllFields()) return;

  try {
    localStorage.setItem('my-storage-key', JSON.stringify(data));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please clear some data.');
    } else {
      alert('Error saving settings. Please try again.');
    }
  }
}
```

**Required error handling:**
- Wrap localStorage access in try-catch
- Handle QuotaExceededError separately (show user-friendly message)
- Handle JSON.parse errors (corrupted data)
- Always continue gracefully if localStorage fails

**Fail condition:** If localStorage calls are not wrapped in try-catch, or quota errors are not handled, revise.

---

### Rule 4: Form submission must prevent double-submit and handle async operations

**Applies to:** Any form with submit handler

**Pattern:**
```js
handleSubmit(e) {
  e.preventDefault();

  if (this.isSubmitting) return; // Guard against double-click

  if (!this.validateAllFields()) return;

  this.isSubmitting = true;
  const submitBtn = this.querySelector('#submit-btn');
  submitBtn.disabled = true;

  try {
    // Async operation here
    await this.saveToServer();
  } finally {
    this.isSubmitting = false;
    submitBtn.disabled = false;
  }
}
```

**Required:**
- Check `this.isSubmitting` flag before processing
- Disable submit button during submission
- Set button back to enabled in finally block
- Never assume single submit attempt

**Fail condition:** If button is not disabled, or isSubmitting flag is not used, or finally block is missing, revise.

---

### Rule 5: Styling must follow this priority: flexbox > grid > absolute positioning

**Applies to:** Any layout

**Pattern:**
```js
// ✅ DO: Use flexbox for single-axis layouts
const style = `
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }
`;

// ✅ OK: Use grid for 2D layouts
const style = `
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

// ❌ AVOID: Absolute positioning unless unavoidable
const style = `
  .absolute {
    position: absolute; /* Only if layout absolutely requires it */
  }
`;
```

**Why:**
- Flexbox is responsive and maintainable
- Grid is predictable for complex layouts
- Absolute positioning breaks at different screen sizes

**Fail condition:** If layout uses floats, or absolute positioning for primary layout, revise.

---

### Rule 6: All features must include unit tests before merge

**Applies to:** All code

**Test structure:**
```js
// tests/MyFeature.test.js
class MyFeatureTests {
  setup() {
    // Initialize component
  }

  teardown() {
    // Clean up
  }

  testSomething() {
    // Single, focused test
    assert(condition, 'should...');
  }

  runAll() {
    const tests = [this.testSomething, ...];
    tests.forEach(test => {
      try {
        test.call(this);
      } catch (e) {
        console.error(`✗ ${e.message}`);
      }
    });
  }
}
```

**Required:**
- Test file in `tests/` directory
- One test per feature/rule
- Simple assert() function (no external framework)
- Setup/teardown for test isolation
- Run before committing

**Fail condition:** If code doesn't include tests, or tests are not run before commit, revise.

---

### Rule 7: All prompts to AI should include file paths, validation rules, and example behavior

**Applies to:** AI assistance

**Good prompt:**
> Build at `lib/MyForm.js` with:
> - Field `email` (required, valid format)
> - Validation on blur + submit
> - Show errors below each field with aria-invalid
> - Persist to localStorage
> - Write tests and run them

**Bad prompt:**
> Build a form

**Why:** Precise prompts lead to code that doesn't need revisions. See WORKFLOW.md for the comparison.

---

### Rule 8: Async operations must use try-finally to prevent hanging state

**Applies to:** Any async operation (API calls, localStorage, setTimeout)

**Pattern:**
```js
try {
  this.isLoading = true;
  const result = await this.fetchData();
} catch (e) {
  console.error('Error:', e);
  this.error = e.message;
} finally {
  this.isLoading = false; // ALWAYS runs
}
```

**Why:** `finally` ensures state cleanup even if error is thrown.

**Fail condition:** If state flags aren't reset in finally block, revise.

---

## Git & Commits

- Use Conventional Commits (feat:, fix:, refactor:, test:, docs:)
- One logical change per commit
- Reference these rules in commit messages when applicable
  - Example: `feat: add form validation (Rule 2: aria-* + testing)`
- Don't commit without running tests first

---

## Review Checklist

Before asking for review or marking done:

- [ ] Code follows all 8 rules above
- [ ] Tests written and all passing
- [ ] Accessibility verified (labels, aria-*, keyboard nav)
- [ ] localStorage errors handled (Rule 3)
- [ ] Double-submit prevention (Rule 4)
- [ ] Flexbox used for layout (Rule 5)
- [ ] Commit message follows Conventional Commits
- [ ] Ran `git diff` to verify only intended changes

---

## References

- **WORKFLOW.md** — Drill comparing vague vs precise AI prompting
- **Conventional Commits** — https://www.conventionalcommits.org/
- **WCAG 2.1 AA** — Web Content Accessibility Guidelines
- **localStorage API** — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Web Components** — https://developer.mozilla.org/en-US/docs/Web/Web_Components/

Last updated after drill: 2026-07-19
