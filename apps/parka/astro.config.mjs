// @ts-check
import process from 'node:process';
import { createAstroConfig } from '@repo/astro-config';
import pkg from './package.json' with { type: 'json' };

/** `package.json` version + commit, so every deploy yields a new version. */
const APP_VERSION = `${pkg.version}+${process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev'}`;

const config = createAstroConfig({
  site: 'https://parka.com',
});

export default {
  ...config,
  vite: {
    ...config.vite,
    define: {
      'import.meta.env.PUBLIC_PARKA_APP_VERSION': JSON.stringify(APP_VERSION),
    },
  },
};
