/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PARKA_SUPABASE_URL: string;
  readonly PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY: string;
  readonly PARKA_SUPABASE_GOOGLE_CLIENT_SECRET: string;
  readonly PARKA_SUPABASE_GOOGLE_CLIENT_ID: string;
  readonly PARKA_AI_API_KEY: string;
  readonly PARKA_AI_BASE_URL: string;
  readonly PARKA_AI_MODEL: string;
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
