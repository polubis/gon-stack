// @ts-check
import { createAstroConfig } from '@repo/astro-config';
import { ports } from '@repo/ecosystem-resources/ports';

export default createAstroConfig({
  site: 'https://content-maker.workers.dev',
  port: ports.dev['content-maker'],
});
