/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PARKA_SUPABASE_URL: string;
  readonly PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY: string;
  readonly PARKA_AUTH_CALLBACK_URL: string;
  readonly PARKA_AUTH_CONFIRM_URL: string;
  readonly PARKA_SUPABASE_GOOGLE_CLIENT_SECRET: string;
  readonly PARKA_SUPABASE_GOOGLE_CLIENT_ID: string;
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
