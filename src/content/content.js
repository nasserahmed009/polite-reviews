/**
 * Content script entry: observe DOM for comment textareas, inject "Polite comment" button.
 * Uses MutationObserver and delegates to injector; wires button click to messaging + textarea update.
 * Only runs on allowed domains (github.com + user-added); exits immediately otherwise.
 */

const DEFAULT_DOMAIN = 'github.com';
const STORAGE_ALLOWED_DOMAINS = 'politeReviewsAllowedDomains';

function isHostAllowed(hostname, allowedDomains) {
  const normalized = (hostname || '').toLowerCase().trim();
  if (!normalized) return false;
  return allowedDomains.some(
    (d) => normalized === d || normalized.endsWith('.' + d)
  );
}

function getAllowedDomains() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_ALLOWED_DOMAINS], (result) => {
      const custom = result[STORAGE_ALLOWED_DOMAINS] || [];
      resolve([DEFAULT_DOMAIN, ...custom]);
    });
  });
}

(async function () {
  const allowed = await getAllowedDomains();
  const hostname = (location.hostname || '').toLowerCase().trim();
  if (!isHostAllowed(hostname, allowed)) {
    return;
  }

  const BTN_LOADING = 'Polishing…';

  function handlePoliteClick(textarea, button) {
    const originalText = textarea.value;
    if (!originalText.trim()) {
      return;
    }
    setButtonLoading(button, true);
    window.politeReviewsMessaging
      .requestRewrite(originalText)
      .then((result) => {
        if (result.success && result.text != null) {
          const politeText = result.text;
          
          textarea.value = politeText;
          textarea.textContent = politeText;
        } else {
          showError(button, result.error || 'Could not rewrite.');
        }
      })
      .finally(() => {
        setButtonLoading(button, false);
      });
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? BTN_LOADING : window.politeReviewsInjector.BTN_LABEL;
    button.classList.toggle('polite-reviews-loading', loading);
  }

  function showError(button, message) {
    const msgEl = document.createElement('span');
    msgEl.className = 'polite-reviews-error';
    msgEl.textContent = message;
    msgEl.setAttribute('role', 'alert');
    const parent = button.parentElement;
    if (parent) {
      parent.insertBefore(msgEl, button.nextSibling);
      setTimeout(() => msgEl.remove(), 5000);
    }
  }

  function onMutate(mutations) {
    

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        window.politeReviewsInjector.processNodeForTextareas(node, handlePoliteClick);
      }
    }
  }

  function run() {
    if (!document.body) {
      setTimeout(run, 50);
      return;
    }
    const observer = new MutationObserver(onMutate);
    observer.observe(document.body, { childList: true, subtree: true });
    // Initial pass for already-rendered comment boxes
    window.politeReviewsInjector.processNodeForTextareas(document.body, handlePoliteClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
