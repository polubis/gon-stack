import { config } from '@repo/nitpick/config';
import { richCommit } from '@repo/nitpick/rules/rich-commit';

export default config({
  rules: [richCommit],
});
