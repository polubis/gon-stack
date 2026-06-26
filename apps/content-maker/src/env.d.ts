declare module '*.md?raw' {
  const content: string;
  export default content;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  // Cloudflare bindings are accessed via `import { env } from 'cloudflare:workers'`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Locals {}
}
