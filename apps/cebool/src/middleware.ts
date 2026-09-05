import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.siteDomain = context.site?.toString().replace(/\/$/, '') ?? '';

  return next();
});
