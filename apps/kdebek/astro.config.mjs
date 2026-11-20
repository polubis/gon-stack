// @ts-check
import { createAstroConfig } from '@repo/astro-config';
import { ports } from '@repo/ecosystem-resources/ports';

const config = createAstroConfig({
  site: 'https://masazysta-olsztyn.pl',
  port: ports.dev.kdebek,
});

export default {
  ...config,
  // Shiki emits inline styles, incompatible with CSP; no code blocks are used.
  markdown: { syntaxHighlight: false },
  security: {
    // Astro hashes every inline script/style it emits and renders them into a
    // `<meta http-equiv="content-security-policy">` per page. `_headers` carries
    // the remaining directives (it must not set script-src/style-src, and the
    // meta must not set default-src, which would also cap frame-src/img-src;
    // both policies apply together, so overlapping directives would intersect).
    csp: {
      scriptDirective: {
        resources: ["'self'", 'https://static.cloudflareinsights.com'],
      },
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
};
