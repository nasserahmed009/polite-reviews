(function () {
  const STORAGE_API_KEY = 'politeReviewsApiKey';
  const STORAGE_API_BASE_URL = 'politeReviewsApiBaseUrl';
  const STORAGE_ALLOWED_DOMAINS = 'politeReviewsAllowedDomains';
  const DEFAULT_DOMAIN = 'github.com';
  const DEFAULT_API_BASE_URL = 'https://api.openai.com/v1';

  const apiKeyEl = document.getElementById('apiKey');
  const apiBaseUrlEl = document.getElementById('apiBaseUrl');
  const saveBtn = document.getElementById('save');
  const statusEl = document.getElementById('status');
  const customDomainsListEl = document.getElementById('customDomainsList');
  const newDomainEl = document.getElementById('newDomain');
  const addDomainBtn = document.getElementById('addDomain');
  const domainStatusEl = document.getElementById('domainStatus');

  function showStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + (isError ? 'error' : 'success');
  }

  function showDomainStatus(message, isError) {
    domainStatusEl.textContent = message || '';
    domainStatusEl.className = 'status ' + (isError ? 'error' : 'success');
  }

  function normalizeDomain(input) {
    let s = (input || '').trim().toLowerCase();
    s = s.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    return s.trim();
  }

  function renderCustomDomains(customDomains) {
    customDomainsListEl.innerHTML = '';
    (customDomains || []).forEach(function (domain) {
      const row = document.createElement('div');
      row.className = 'domain-row';
      row.setAttribute('role', 'listitem');
      const name = document.createElement('span');
      name.className = 'domain-name';
      name.textContent = domain;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'secondary';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        removeDomain(domain);
      });
      row.appendChild(name);
      row.appendChild(removeBtn);
      customDomainsListEl.appendChild(row);
    });
  }

  function removeDomain(domain) {
    chrome.storage.local.get([STORAGE_ALLOWED_DOMAINS], function (result) {
      const list = result[STORAGE_ALLOWED_DOMAINS] || [];
      const next = list.filter(function (d) { return d !== domain; });
      chrome.storage.local.set({ [STORAGE_ALLOWED_DOMAINS]: next }, function () {
        if (chrome.runtime.lastError) {
          showDomainStatus('Failed to remove domain.', true);
        } else {
          showDomainStatus('');
          renderCustomDomains(next);
        }
      });
    });
  }

  function addDomain() {
    const raw = newDomainEl.value || '';
    const domain = normalizeDomain(raw);
    if (!domain) {
      showDomainStatus('Enter a domain (e.g. git.mycompany.com).', true);
      return;
    }
    if (domain === DEFAULT_DOMAIN) {
      showDomainStatus('github.com is always enabled and cannot be added again.', true);
      return;
    }
    chrome.storage.local.get([STORAGE_ALLOWED_DOMAINS], function (result) {
      const list = result[STORAGE_ALLOWED_DOMAINS] || [];
      if (list.indexOf(domain) !== -1) {
        showDomainStatus('This domain is already in the list.', true);
        return;
      }
      const next = list.concat(domain);
      chrome.storage.local.set({ [STORAGE_ALLOWED_DOMAINS]: next }, function () {
        if (chrome.runtime.lastError) {
          showDomainStatus('Failed to add domain.', true);
        } else {
          newDomainEl.value = '';
          showDomainStatus('');
          renderCustomDomains(next);
        }
      });
    });
  }

  addDomainBtn.addEventListener('click', addDomain);
  newDomainEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDomain();
    }
  });

  chrome.storage.local.get([STORAGE_ALLOWED_DOMAINS], function (result) {
    renderCustomDomains(result[STORAGE_ALLOWED_DOMAINS] || []);
  });

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
