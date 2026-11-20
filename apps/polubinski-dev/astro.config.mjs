// @ts-check
import { createAstroConfig } from '@repo/astro-config';
import { ports } from '@repo/ecosystem-resources/ports';

export default createAstroConfig({
  site: 'https://polubinski.dev',
  port: ports.dev['polubinski-dev'],
});
