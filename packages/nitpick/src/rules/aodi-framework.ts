import { fileURLToPath } from 'node:url';

export const aodiFramework = fileURLToPath(
  new URL('aodi-framework.md', import.meta.url),
);
