import { config } from '@repo/nitpick/config';
import { logEntry } from '@repo/nitpick/rules/log-entry';
import { richCommit } from '@repo/nitpick/rules/rich-commit';

export default config({
  rules: [richCommit, logEntry],
});
