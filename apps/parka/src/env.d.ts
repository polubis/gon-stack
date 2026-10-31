/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PARKA_SUPABASE_URL: string;
  readonly PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY: string;
  readonly PARKA_SUPABASE_GOOGLE_CLIENT_SECRET: string;
  readonly PARKA_SUPABASE_GOOGLE_CLIENT_ID: string;
  readonly PARKA_AI_API_KEY: string;
  /** Base64url VAPID public key; safe for the client. */
  readonly PUBLIC_PARKA_VAPID_PUBLIC_KEY: string;
  readonly PARKA_VAPID_PRIVATE_KEY: string;
  /** `mailto:` contact for push services. */
  readonly PARKA_VAPID_SUBJECT: string;
  /** `package.json` version + commit; injected at build, see `astro.config.mjs`. */
  readonly PUBLIC_PARKA_APP_VERSION: string;
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

declare module 'cloudflare:workers' {
  /** Bindings declared in `wrangler.jsonc`. */
  export const env: { IMAGES: unknown };
}
