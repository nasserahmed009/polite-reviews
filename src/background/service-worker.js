/**
 * Service worker: handles REWRITE messages, reads storage, calls AI API.
 */

import { buildRewriteMessages } from '../shared/prompt.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REWRITE') {
    handleRewrite(message.text)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message || 'Unknown error' }));
    return true;
  }
  sendResponse({ success: false, error: 'Unknown message type' });
  return false;
});

async function handleRewrite(text) {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'No text provided' };
  }
  const stored = await chrome.storage.local.get(['politeReviewsApiKey', 'politeReviewsApiBaseUrl']);
  const apiKey = stored.politeReviewsApiKey;
  const baseUrl = (stored.politeReviewsApiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');

  if (!apiKey) {
    return { success: false, error: 'API key not set. Open extension options to add your key.' };
  }

  const messages = buildRewriteMessages(text);
  const url = `${baseUrl}/chat/completions`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);


  console.log('SENDING REQUEST');
  console.log('url', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.25,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('res', res);
    if (!res.ok) {

      const errBody = await res.text();
      let errMsg = `API error ${res.status}`;
      try {
        const j = JSON.parse(errBody);
        if (j.error && j.error.message) errMsg = j.error.message;
      } catch (_) {}
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof content !== 'string') {
      return { success: false, error: 'Invalid API response' };
    }
    return { success: true, text: content.trim() };
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      return { success: false, error: 'Request timed out' };
    }
    return { success: false, error: e.message || 'Network error' };
  }
}
