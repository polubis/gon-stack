import type { APIRoute } from 'astro';

/** Emitted as a static file at build time: one new version per deploy. */
export const prerender = true;

export const GET: APIRoute = () =>
  Response.json({ version: import.meta.env.PUBLIC_PARKA_APP_VERSION });
