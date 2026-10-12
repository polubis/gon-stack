import { config } from '@repo/nitpick/config';
import { createDecisionEntry } from '@repo/nitpick/rules/decision-entry';
import { richCommit } from '@repo/nitpick/rules/rich-commit';

export default config({
  settings: {
    mcp: {
      playwright: { command: 'npx', args: ['@playwright/mcp@latest'] },
      a11y: { command: 'npx', args: ['-y', 'a11y-mcp'] },
    },
    permissions: { allow: ['mcp__playwright__*', 'mcp__a11y__*'] },
    attribution: { commit: '', pr: '' },
  },
  rules: [
    richCommit,
    createDecisionEntry({
      scopes: [/^(repo|claude|nitpick)$/, /^(parka|uih)(\/[a-z][a-z0-9-]*)?$/],
    }),
  ],
});
