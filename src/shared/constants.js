/**
 * Shared constants for Polite Reviews extension.
 * Used by content script and service worker (via import in SW; content uses copy or we use a build step).
 * For MVP we duplicate storage keys in injector/messaging and background to avoid bundling.
 */

// Message types for chrome.runtime.sendMessage
export const MSG_REWRITE = 'REWRITE';

// Chrome storage keys
export const STORAGE_API_KEY = 'politeReviewsApiKey';
export const STORAGE_API_BASE_URL = 'politeReviewsApiBaseUrl';
export const STORAGE_ALLOWED_DOMAINS = 'politeReviewsAllowedDomains';

// Default allowed domain (always on, cannot be removed)
export const DEFAULT_DOMAIN = 'github.com';

// Default API base (OpenAI)
export const DEFAULT_API_BASE_URL = 'https://api.openai.com/v1';

// DOM markers for our injected button (idempotent check)
export const DATA_ATTR_INJECT = 'data-polite-reviews';
export const DATA_ATTR_VALUE = 'inject';
export const CLASS_POLITE_BTN = 'polite-reviews-btn Button Button--secondary';

// Button label and loading text
export const BTN_LABEL = 'Polite comment';
export const BTN_LOADING = 'Polishing…';

// Comment submit button text patterns (case-insensitive)
export const COMMENT_BUTTON_TEXTS = [
  'comment',
  'add single comment',
  'reply',
  'submit review',
  'add comment',
  'review',
];
