---
version: 1.0.0
name: Creating Astro app in Turborepo
cdate: 07.06.2026
mdate: 15.06.2026
tags: react,astro,turborepo,setup
---

# Astro + Cloudflare + React + TypeScript + Tailwind

Create project:

```bash
npm create cloudflare@latest astro-edge-app -- --framework=astro
```

Add React:

```bash
npx astro add react
```

Add Tailwind:

```bash
npx astro add tailwind
```

Install & run:

```bash
npm install
npm run dev
```

Access: `http://localhost:4321`

---

## Config

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [react(), tailwind()],
});
```

---

## Layout

Create `src/layouts/Layout.astro`:

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body class="bg-zinc-950 text-zinc-100 min-h-screen">
    <main class="max-w-4xl mx-auto p-8">
      <slot />
    </main>
  </body>
</html>
```

---

## SSR Page

`src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
const time = new Date().toISOString();
---

<Layout title="SSR Home">
  <h1 class="text-5xl font-bold mb-6">Astro SSR</h1>
  <pre class="mt-4 p-4 bg-zinc-900 rounded-xl">{time}</pre>
</Layout>
```

---

## SSG Page

Create `src/pages/about.astro`:

```astro
---
export const prerender = true;
import Layout from '../layouts/Layout.astro';
---

<Layout title="SSG Page">
  <h1 class="text-5xl font-bold mb-6">SSG Page</h1>
  <p class="text-zinc-400">Statically generated at build time.</p>
</Layout>
```

---

## React Component

Create `src/components/Counter.tsx`:

```tsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="mt-8">
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-600 rounded-xl"
      >
        Count: {count}
      </button>
    </div>
  );
}
```

Use in `src/pages/index.astro`:

```astro
<Counter client:load />
```

---

## API Endpoint

Create `src/pages/api/hello.ts`:

```ts
export async function GET() {
  return Response.json({
    ok: true,
    runtime: 'Cloudflare Workers',
    time: new Date().toISOString(),
  });
}
```

Access: `/api/hello`

---

## Deploy

Login:

```bash
npm install -g wrangler
wrangler login
```

Deploy:

```bash
npm run deploy
```

Returns URL: `https://your-app.workers.dev`

---

## Key Rules

SSR page (dynamic):

```astro
export const prerender = false;
```

or omit export.

SSG page (static):

```astro
export const prerender = true;
```
