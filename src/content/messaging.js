/**
 * Content script messaging: send REWRITE to background, handle response.
 * Used by injector click handler (wired in content.js).
 */

const MSG_REWRITE = 'REWRITE';

/**
 * Send comment text to background for rewrite. Returns a promise that resolves to
 * { success: true, text } or { success: false, error }.
 * @param {string} text
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
function requestRewrite(text) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: MSG_REWRITE, text }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message || 'Extension error' });
        return;
      }
      if (response && response.success === true) {
        resolve({ success: true, text: response.text });
      } else {
        resolve({ success: false, error: (response && response.error) || 'Unknown error' });
      }
    });
  });
}

window.politeReviewsMessaging = { requestRewrite };
