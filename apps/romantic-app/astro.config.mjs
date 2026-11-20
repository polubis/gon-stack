// @ts-check
import { createAstroConfig } from '@repo/astro-config';
import { ports } from '@repo/ecosystem-resources/ports';

export default createAstroConfig({
  site: 'https://snowy-silence-df05.workers.dev',
  port: ports.dev['romantic-app'],
});
