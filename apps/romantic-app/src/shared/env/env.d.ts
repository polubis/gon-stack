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
  // Cloudflare bindings are now accessed via `import { env } from 'cloudflare:workers'`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Locals {}
}
