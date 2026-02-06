(function () {
  const STORAGE_API_KEY = 'politeReviewsApiKey';
  const STORAGE_API_BASE_URL = 'politeReviewsApiBaseUrl';
  const DEFAULT_API_BASE_URL = 'https://api.openai.com/v1';

  const apiKeyEl = document.getElementById('apiKey');
  const apiBaseUrlEl = document.getElementById('apiBaseUrl');
  const saveBtn = document.getElementById('save');
  const statusEl = document.getElementById('status');

  function showStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + (isError ? 'error' : 'success');
  }

  saveBtn.addEventListener('click', function () {
    const apiKey = (apiKeyEl.value || '').trim();
    let baseUrl = (apiBaseUrlEl.value || '').trim();
    if (!baseUrl) baseUrl = DEFAULT_API_BASE_URL;
    if (!baseUrl.endsWith('/')) baseUrl = baseUrl.replace(/\/+$/, '');

    if (!apiKey) {
      showStatus('Please enter an API key.', true);
      return;
    }

    chrome.storage.local.set(
      {
        [STORAGE_API_KEY]: apiKey,
        [STORAGE_API_BASE_URL]: baseUrl,
      },
      function () {
        if (chrome.runtime.lastError) {
          showStatus('Failed to save: ' + chrome.runtime.lastError.message, true);
        } else {
          showStatus('Settings saved.');
        }
      }
    );
  });

  chrome.storage.local.get([STORAGE_API_KEY, STORAGE_API_BASE_URL], function (stored) {
    if (stored[STORAGE_API_KEY]) apiKeyEl.value = stored[STORAGE_API_KEY];
    if (stored[STORAGE_API_BASE_URL]) apiBaseUrlEl.value = stored[STORAGE_API_BASE_URL];
    else apiBaseUrlEl.placeholder = DEFAULT_API_BASE_URL;
  });
})();
