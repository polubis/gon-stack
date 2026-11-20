// @ts-check
import { createAstroConfig } from '@repo/astro-config';
import { ports } from '@repo/ecosystem-resources/ports';

export default createAstroConfig({
  site: 'https://talent-orbit.com',
  port: ports.dev['talent-orbit'],
});
