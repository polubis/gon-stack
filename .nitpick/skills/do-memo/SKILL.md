---
version: 1
name: do-memo
cdate: 2026-07-25
mdate: 2026-07-25
tags: [memo, flashcard, learning]
description: >
  Learning memos: concept → use case → example. Output markdown | mdx | html.
  Back = scenario OR code snippet. Trigger: memo, flashcard, /do-memo. Too broad → split first.
---

## ROLE

Memo writer. One concept per memo. Concept → use case → example. Jargon defined inline.

## FORMAT

Output: **markdown** | **mdx** | **html**. User specify → use. Missing → ask once:

> Output format? **markdown** | **mdx** | **html**

Default if skip: **mdx**. Ext: `.md` | `.mdx` | `.html`.

## TOO BIG

Stop + split if: unrelated concepts, long prereq chain, one explanation misleads, mixes "what" + "build full system". Suggest 2–5 memos. Wait for pick.

## STEPS

1. Scope — one concept. Too big → split. Stop.
2. Format — ask if missing.
3. Back type — scenario or snippet. Pick before write.
4. Write — match format template. No placeholders.
5. Output — memo only. No commentary unless asked.

## BACK TYPE

| Type     | When                                 | Back                                                    |
| -------- | ------------------------------------ | ------------------------------------------------------- |
| Scenario | Concept/process, no syntax lesson    | 2–4 sentences prose. Inline `` `terms` `` OK. No fence. |
| Code     | API/CLI/config/SQL — syntax is point | Fence 3–15 lines + 1–2 sentence explain                 |

Never mix. Code-native → snippet. User asks code → snippet.

## META (all formats)

| Field             | Rule                                      |
| ----------------- | ----------------------------------------- |
| `version`         | `{1}`                                     |
| `name`            | Topic title                               |
| `cdate` / `mdate` | `YYYY-MM-DD`. Today unless user says else |
| `tags`            | 1–5 lowercase keywords                    |

## TEMPLATES — scenario back

### Markdown

```markdown
---
version: 1
name: { Topic }
cdate: { YYYY-MM-DD }
mdate: { YYYY-MM-DD }
tags: [{ tag1 }, { tag2 }]
---

## Front

**Concept:** {1–3 sentences}

## Use case

{2–4 sentences}

## Back

**Example:** {prose}

**Takeaway:** {one line}
```

### MDX

```mdx
<Memo
  version={1}
  name="{Topic}"
  cdate="{YYYY-MM-DD}"
  mdate="{YYYY-MM-DD}"
  tags={["{tag1}", "{tag2}"]}
>
  <Front>

**Concept:** {1–3 sentences}

  </Front>

## Use case

{2–4 sentences}

  <Back>

**Example:** {prose}

**Takeaway:** {one line}

  </Back>
</Memo>
```

### HTML

```html
<article
  class="memo"
  data-version="1"
  data-name="{Topic}"
  data-cdate="{YYYY-MM-DD}"
  data-mdate="{YYYY-MM-DD}"
  data-tags="{tag1},{tag2}"
>
  <section class="front">
    <p><strong>Concept:</strong> {1–3 sentences}</p>
  </section>
  <section class="use-case">
    <h2>Use case</h2>
    <p>{2–4 sentences}</p>
  </section>
  <section class="back">
    <p><strong>Example:</strong> {prose}</p>
    <p><strong>Takeaway:</strong> {one line}</p>
  </section>
</article>
```

## TEMPLATES — code back

### Markdown

````markdown
## Back

**Example:**

```{lang}
{snippet}
```

{1–2 sentences}

**Takeaway:** {one line}
````

### MDX

````mdx
  <Back>

**Example:**

```{lang}
{snippet}
```

{1–2 sentences}

**Takeaway:** {one line}

  </Back>
````

### HTML

```html
<section class="back">
  <p><strong>Example:</strong></p>
  <pre><code class="language-{lang}">{snippet}</code></pre>
  <p>{1–2 sentences}</p>
  <p><strong>Takeaway:</strong> {one line}</p>
</section>
```

## RULES

- **Front:** clear concept. MDX → inside `<Front>`. HTML → `.front`. Markdown → `## Front`
- **Use case:** when/who/why. Not feature list. Not same as Back example
- **Back:** show don't restate concept. Takeaway ≠ Concept
- **Batch:** one memo block each, blank line between, same format throughout
- **Style:** short sentences. Accurate > clever

## EXAMPLES

→ [references/examples.md](references/examples.md)
