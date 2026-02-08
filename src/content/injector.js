/**
 * Injects "Polite comment" button next to GitHub comment submit buttons.
 * Idempotent: skips if our button already exists in the same form/container.
 */

const DATA_ATTR_INJECT = 'data-polite-reviews';
const DATA_ATTR_VALUE = 'inject';
const CLASS_POLITE_BTN = 'polite-reviews-btn';
const BTN_LABEL = 'Polite comment';
const COMMENT_BUTTON_TEXTS = [
  'submit review',
  'start a review',
  'add review comment',
];

/** Tab labels we must not treat as submit buttons (e.g. "Preview" contains "review"). */
const TAB_LIKE_TEXTS = ['preview', 'write', 'edit', 'preview changes'];

/**
 * Normalize button text for comparison (trim, lowercase).
 */
function normalizeButtonText(text) {
  return (text || '').trim().toLowerCase();
}

/**
 * Check if a button is a GitHub comment submit button by its visible text.
 * Excludes tab-style buttons (e.g. "Preview", "Write") so we inject next to the real actions.
 */
function isCommentSubmitButton(btn) {
  if (!btn || (btn.tagName !== 'BUTTON' && btn.tagName !== 'INPUT')) return false;
  const text = normalizeButtonText(btn.textContent || btn.value || '');
  if(!text) return false;

  if (TAB_LIKE_TEXTS.some((tab) => text === tab || text.startsWith(tab + ' '))) return false;
  return COMMENT_BUTTON_TEXTS.some((pattern) => text.includes(pattern));
}

/**
 * Find the container that has both the textarea and a comment submit button.
 * Returns { container, submitButton } or null.
 */
function findCommentFormContext(textarea) {
  let node = textarea.parentElement;
  const maxDepth = 20;
  let depth = 0;
  while (node && depth < maxDepth) {
    const buttons = node.querySelectorAll ? node.querySelectorAll('button, input[type="submit"]') : [];
    for (const btn of buttons) {
      if (isCommentSubmitButton(btn)) {
        return { container: node, submitButton: btn };
      }
    }
    if (node.getAttribute && node.getAttribute('role') === 'dialog') {
      const buttons = node.querySelectorAll('button, input[type="submit"]');
      for (const btn of buttons) {
        if (isCommentSubmitButton(btn)) return { container: node, submitButton: btn };
      }
    }
    node = node.parentElement;
    depth++;
  }
  return null;
}

/**
 * Return true if this textarea is already associated with our injected button.
 */
function alreadyHasPoliteButton(container) {
  if (!container || !container.querySelector) return false;
  const existing = container.querySelector(`[${DATA_ATTR_INJECT}="${DATA_ATTR_VALUE}"]`);
  return !!existing;
}

/**
 * Optional: only run on PR pages (URL contains /pull/). Can relax later.
 */
function isPRPage() {
  return /\/pull\/\d+/.test(window.location.pathname);
}

/**
 * Create our button element. Caller attaches click handler and inserts into DOM.
 */
function createPoliteButton(textareaRef) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = CLASS_POLITE_BTN;
  btn.setAttribute(DATA_ATTR_INJECT, DATA_ATTR_VALUE);
  btn.textContent = BTN_LABEL;
  return btn;
}

/**
 * Try to inject one "Polite comment" button for the given textarea.
 * Idempotent. Returns true if injection happened, false if skipped.
 * @param {HTMLTextAreaElement} textarea
 * @param {function(HTMLTextAreaElement, HTMLButtonElement): void} onButtonClick - called with (textarea, button) when user clicks
 */
function tryInjectButton(textarea, onButtonClick) {
  if (!textarea || textarea.tagName !== 'TEXTAREA') return false;
  if (!isPRPage()) return false;

  const ctx = findCommentFormContext(textarea);
  if (!ctx) return false;
  const { container, submitButton } = ctx;
  if (alreadyHasPoliteButton(container)) return false;

  const btn = createPoliteButton(textarea);
  btn.addEventListener('click', () => {
    onButtonClick(textarea, btn);
  });

  // Insert next to the submit button: same parent, after the submit button (or at end of button group)
  const parent = submitButton.parentElement?.parentElement;
  if (parent) {
    parent.insertBefore(btn, submitButton.parentElement);
    return true;
  }
  container.appendChild(btn);
  return true;
}

/**
 * Scan a node and its descendants for textareas; for each, try to inject.
 * Used by MutationObserver callback when new nodes are added.
 */
function processNodeForTextareas(node, onButtonClick) {
  const textareas = [];
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName === 'TEXTAREA') textareas.push(node);
    if (node.querySelector) {
      const list = node.querySelectorAll('textarea');
      textareas.push(...list);
    }
  }
  let injected = 0;
  for (const ta of textareas) {
    if (tryInjectButton(ta, onButtonClick)) injected++;
  }
  return injected;
}

// Expose for content.js (content scripts run as classic scripts)
window.politeReviewsInjector = {
  tryInjectButton,
  processNodeForTextareas,
  BTN_LABEL,
  CLASS_POLITE_BTN,
};

