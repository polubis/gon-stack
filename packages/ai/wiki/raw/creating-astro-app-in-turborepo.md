---
version: 1.0.0
name: Creating Astro app in Turborepo
cdate: 07.06.2026
mdate: 07.06.2026
tags: react,astro,turborepo,setup
---

# Astro + Cloudflare + React + TypeScript + Tailwind

Complete SSR + SSG + API + Deployment Setup

---

# 1. Create the Project

```bash
npm create cloudflare@latest astro-edge-app -- --framework=astro
```

Choose:

* TypeScript → `Strict`
* Git → `Yes`

---

# 2. Enter the Project

```bash
cd astro-edge-app
```

---

# 3. Add React

```bash
npx astro add react
```

---

# 4. Add Tailwind

```bash
npx astro add tailwind
```

This automatically:

* installs Tailwind,
* creates the configuration,
* integrates it with Vite.

---

# 5. Run Locally

```bash
npm install
npm run dev
```

Application URL:

```txt
http://localhost:4321
```

---

# 6. Enable Global SSR

Edit:

```txt
astro.config.mjs
```

Make sure it contains:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',

  adapter: cloudflare(),

  integrations: [
    react(),
    tailwind()
  ]
});
```

---

# 7. Add a Layout

Create:

```txt
src/layouts/Layout.astro
```

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

# 8. Create an SSR Page

Edit:

```txt
src/pages/index.astro
```

```astro
---
import Layout from '../layouts/Layout.astro';

const time = new Date().toISOString();
---

<Layout title="SSR Home">
  <h1 class="text-5xl font-bold mb-6">
    Astro SSR
  </h1>

  <p class="text-zinc-400">
    Rendered at:
  </p>

  <pre class="mt-4 p-4 bg-zinc-900 rounded-xl">
    {time}
  </pre>
</Layout>
```

This page is rendered dynamically at the edge.

---

# 9. Create an SSG Page

Create:

```txt
src/pages/about.astro
```

```astro
---
export const prerender = true;

import Layout from '../layouts/Layout.astro';
---

<Layout title="SSG Page">
  <h1 class="text-5xl font-bold mb-6">
    SSG Page
  </h1>

  <p class="text-zinc-400">
    This page is statically generated.
  </p>
</Layout>
```

This will be generated as static HTML at build time.

---

# 10. Add a React Component

Create:

```txt
src/components/Counter.tsx
```

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

---

# 11. Use a React Island

In `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Counter from '../components/Counter';

const time = new Date().toISOString();
---

<Layout title="SSR Home">
  <h1 class="text-5xl font-bold mb-6">
    Astro SSR
  </h1>

  <pre class="mt-4 p-4 bg-zinc-900 rounded-xl">
    {time}
  </pre>

  <Counter client:load />
</Layout>
```

`client:load`:

* hydrates React only for this component,
* leaves the rest of the page JavaScript-free.

---

# 12. Add an API Endpoint

Create:

```txt
src/pages/api/hello.ts
```

```ts
export async function GET() {
  return Response.json({
    ok: true,
    runtime: 'Cloudflare Workers',
    time: new Date().toISOString()
  });
}
```

Endpoint:

```txt
/api/hello
```

Runs as an edge function.

---

# 13. Log In to Cloudflare

Install Wrangler if needed:

```bash
npm install -g wrangler
```

Log in:

```bash
wrangler login
```

---

# 14. Deploy

```bash
npm run deploy
```

Cloudflare will return a URL such as:

```txt
https://your-app.workers.dev
```

---

# 15. What You Have After Deployment

## SSR

```txt
/
```

Dynamic edge rendering.

---

## SSG

```txt
/about
```

Static cached page.

---

## API

```txt
/ api/hello
```

Edge function.

---

## React Islands

Hydration only where needed.

---

# 16. Recommended Project Structure

```txt
src/
  components/
  layouts/
  pages/
    api/
  lib/
  styles/
```

---

# 17. Useful Additions Later

## Authentication

```bash
npm install better-auth
```

Or:

* Auth.js
* Clerk

---

## Database

Best options for edge deployments:

* Turso
* Neon
* Cloudflare D1

---

## ORM

```bash
npm install drizzle-orm
```

---

# 18. Very Important

In Astro:

## SSR Page

```astro
export const prerender = false;
```

or simply omit the export.

---

## SSG Page

```astro
export const prerender = true;
```

That's the entire SSR/SSG hybrid rendering mechanism in Astro.
