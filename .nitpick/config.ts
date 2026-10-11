import { config } from '@repo/nitpick/config';
import { createDecisionEntry } from '@repo/nitpick/rules/decision-entry';
import { richCommit } from '@repo/nitpick/rules/rich-commit';

export default config({
  rules: [
    richCommit,
    createDecisionEntry({
      scopes: [/^(repo|claude|nitpick)$/, /^(parka|uih)(\/[a-z][a-z0-9-]*)?$/],
    }),
  ],
});
