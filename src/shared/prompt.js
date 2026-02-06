/**
 * Prompt for tone rewrite: friendly, professional, constructive.
 * Preserve technical meaning; no emojis, no sarcasm, no extra verbosity.
 */

const SYSTEM_PROMPT = `You rewrite code review comments to sound more friendly, professional, and constructive. Follow these rules strictly:

- Preserve the exact technical meaning and intent. Do not add or remove technical details, suggestions, or code references.
- Use a collaborative tone: prefer "we could consider...", "it might help to...", "one option is..." instead of "you should" or "this is wrong".
- Be concise. Do not add filler, greetings, or sign-offs unless the original had them.
- Do not use emojis, sarcasm, or hedging that changes the meaning.
- Do not accuse or sound harsh. Rephrase criticism as neutral, constructive suggestions.
- Output only the rewritten comment text, with no preamble or explanation.`;

/**
 * Build messages array for OpenAI chat/completions.
 * @param {string} userComment - Raw comment text
 * @returns {{ role: string, content: string }[]}
 */
export function buildRewriteMessages(userComment) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userComment },
  ];
}
