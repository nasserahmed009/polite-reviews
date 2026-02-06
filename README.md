# Polite GitHub Review Comments

A Chrome extension that rewrites GitHub pull request review comments into a friendly, professional, and constructive tone using AI—without changing technical meaning.

## What it does

- Adds a **"Polite comment"** button next to GitHub’s comment submit buttons on PR pages.
- When you click it, the text in the comment box is sent to an AI API, rewritten for tone, and the textarea is updated with the result.
- You then submit the comment as usual with GitHub’s **Comment** button.

No automated code review, no GitHub API usage, no posting comments for you. You provide your own AI API key (e.g. OpenAI or compatible).

## Setup

1. **Install the extension**
   - Open Chrome and go to `chrome://extensions/`.
   - Enable **Developer mode**, click **Load unpacked**, and select this folder.

2. **Set your API key**
   - Click the extension’s **Details** → **Extension options** (or right‑click the icon → Options).
   - Enter your API key (e.g. OpenAI `sk-...`).
   - Optionally set a custom **API base URL** (default: `https://api.openai.com/v1`) for proxies or compatible APIs. If you use another host, add it to `host_permissions` in `manifest.json` for the extension to be able to call it.
   - Click **Save**.

3. **Use on a PR**
   - Open a pull request on github.com.
   - Write a comment in the PR conversation or in an inline review.
   - Click **Polite comment** to rewrite the text; then click GitHub’s **Comment** (or **Add single comment**, etc.) to post.

## Permissions

- **github.com**: Injects the button and reads/writes only the comment textarea you use.
- **storage**: Stores your API key and optional base URL locally (no sync).
- **api.openai.com** (or your base URL): Used only for the rewrite request from the extension’s background script.

No tracking or analytics.

## Project structure

```
polite-reviews/
├── manifest.json
├── src/
│   ├── content/          # GitHub UI: observer, button injection, messaging
│   ├── background/       # Service worker: storage, AI API calls
│   ├── options/          # Options page for API key and base URL
│   └── shared/           # Prompt and constants
├── icons/
└── README.md
```

## Icons

Placeholder icons are included. For a proper listing or store publish, replace `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png` with your own assets.

## Requirements

- Chrome (Manifest V3).
- An OpenAI API key (or compatible endpoint). The extension uses the chat completions API (e.g. `gpt-4o-mini`).

## Behavior

- **PR only**: The button is injected only on URLs that look like a PR (e.g. `/pull/123`).
- **Comment boxes**: Only textareas that are in a form or dialog with a button whose text looks like “Comment”, “Add single comment”, “Reply”, “Submit review”, or “Add comment” get the button.
- **Idempotent**: At most one “Polite comment” button per comment form; duplicates are avoided.
- **Errors**: If the API fails or the key is missing, an error message is shown and your original text is left unchanged.

## License

MIT.
