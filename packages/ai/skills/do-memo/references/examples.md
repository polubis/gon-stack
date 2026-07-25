# do-memo examples

Topic: HTTP caching (scenario). Same memo, 3 formats.

### Markdown

```markdown
---
version: 1
name: HTTP caching
cdate: 2026-07-25
mdate: 2026-07-25
tags: [http, caching, web]
---

## Front

**Concept:** Caching stores a server response copy so the browser reuses it on later visits. Server skips resending until cache expires or invalidates.

## Use case

Use for rarely-changing assets — logos, fonts, static pages. Cuts load time and server work at scale.

## Back

**Example:** News site sets `Cache-Control: max-age=3600` on logo. First visitor downloads; next hour others load from browser cache — no server request.

**Takeaway:** Cache what stays same; skip re-fetch unchanged bytes.
```

### MDX

```mdx
<Memo version={1} name="HTTP caching" cdate="2026-07-25" mdate="2026-07-25" tags={["http", "caching", "web"]}>
  <Front>

**Concept:** Caching stores a server response copy so the browser reuses it on later visits. Server skips resending until cache expires or invalidates.

  </Front>

## Use case

Use for rarely-changing assets — logos, fonts, static pages. Cuts load time and server work at scale.

  <Back>

**Example:** News site sets `Cache-Control: max-age=3600` on logo. First visitor downloads; next hour others load from browser cache — no server request.

**Takeaway:** Cache what stays same; skip re-fetch unchanged bytes.

  </Back>
</Memo>
```

### HTML

```html
<article
  class="memo"
  data-version="1"
  data-name="HTTP caching"
  data-cdate="2026-07-25"
  data-mdate="2026-07-25"
  data-tags="http,caching,web"
>
  <section class="front">
    <p>
      <strong>Concept:</strong> Caching stores a server response copy so the
      browser reuses it on later visits. Server skips resending until cache
      expires or invalidates.
    </p>
  </section>
  <section class="use-case">
    <h2>Use case</h2>
    <p>
      Use for rarely-changing assets — logos, fonts, static pages. Cuts load
      time and server work at scale.
    </p>
  </section>
  <section class="back">
    <p>
      <strong>Example:</strong> News site sets
      <code>Cache-Control: max-age=3600</code> on logo. First visitor downloads;
      next hour others load from browser cache — no server request.
    </p>
    <p>
      <strong>Takeaway:</strong> Cache what stays same; skip re-fetch unchanged
      bytes.
    </p>
  </section>
</article>
```

---

Topic: `useMemo` (code back). Same memo, 3 formats.

### Markdown — Back only

````markdown
## Back

**Example:**

```tsx
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.price - b.price),
  [items],
);
```

Sorting reruns only when `items` changes — not every parent re-render.

**Takeaway:** Memoize expensive derived values; skip work when inputs unchanged.
````

### MDX — Back only

````mdx
  <Back>

**Example:**

```tsx
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.price - b.price),
  [items],
);
```

Sorting reruns only when `items` changes — not every parent re-render.

**Takeaway:** Memoize expensive derived values; skip work when inputs unchanged.

  </Back>
````

### HTML — Back only

```html
<section class="back">
  <p><strong>Example:</strong></p>
  <pre><code class="language-tsx">const sortedItems = useMemo(
  () => items.slice().sort((a, b) =&gt; a.price - b.price),
  [items],
);</code></pre>
  <p>
    Sorting reruns only when <code>items</code> changes — not every parent
    re-render.
  </p>
  <p>
    <strong>Takeaway:</strong> Memoize expensive derived values; skip work when
    inputs unchanged.
  </p>
</section>
```

---

## Too complex — split ask

**User:** "Memo about full-stack authentication"

**Agent (no memo yet):**

> Topic too big. Split first:
>
> 1. Session cookies — why browsers send them
> 2. Password hashing — why plain text unsafe
> 3. OAuth login flow
> 4. JWT access vs refresh tokens
>
> Which one (or send split)?
