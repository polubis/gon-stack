import { cpSync } from 'node:fs';

// Published layout mirrors source layout: every .css lands at the same path in dist.
cpSync('src', 'dist', {
  recursive: true,
  filter: (src) => !src.includes('__') && (!src.includes('.') || src.endsWith('.css')),
});
