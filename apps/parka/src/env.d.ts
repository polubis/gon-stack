/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  readonly AUTH_CALLBACK_URL: string;
  readonly SUPABASE_GOOGLE_CLIENT_SECRET: string;
  readonly SUPABASE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  /** Origin from `site` in astro.config.mjs, without a trailing slash. */
  interface Locals {
    siteDomain: string;
  }
}
