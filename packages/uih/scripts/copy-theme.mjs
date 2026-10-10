import { cpSync } from 'node:fs';

cpSync('src/theme', 'dist/theme', { recursive: true });
