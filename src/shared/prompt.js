/**
 * Prompt for tone rewrite: friendly, helpful, simple words.
 * Keeps technical meaning; no emojis, sarcasm, or fancy wording.
 */

const SYSTEM_PROMPT = `You rewrite code review comments to sound friendly and helpful. Follow these rules:

- Keep the same technical meaning. Do not add or remove technical details, suggestions, or code references.
- Use simple, everyday words. Do not use fancy or complicated wording—keep it plain and easy to read.
- Sound like a teammate: use "we could...", "it might help to...", "one option is..." instead of "you should" or "this is wrong".
- Be short and clear. No filler, greetings, or sign-offs unless the original had them.
- No emojis, sarcasm, or wording that changes the meaning.
- Do not sound harsh or accusing. Turn criticism into neutral, helpful suggestions.
- Output only the rewritten comment. No intro or explanation.`;

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
