# Course authoring guide (Parka knowledge module)

Read this before you create any course. Then build lessons with `create_knowledge_lesson`.

## Mapping

| Parka | Course meaning |
| --- | --- |
| category | a course |
| catalog | a course or a module of it |
| topic | a lesson |
| reel | a step of a lesson (Markdown, 1 to 8000 characters) |

A topic without `studyDay` lands in the backlog. Set a study day, or leave it empty on purpose and say so to the user.

## Lesson skeleton

1. Course glossary lives in lesson 0.1. Later lessons link to it, they do not redefine.
2. Intro with a problem: what hurts without this knowledge.
3. Build a real thing, step by step, one reel per step.
4. Break it on purpose, then fix it. Show the error text.
5. ASCII diagram, about 50 characters wide at most, inside a code block.
6. Exam traps, each as: situation / why / what you do.
7. Quiz: few questions in one reel as a `quiz` block (see Quiz block). Answers are marked in the block, no separate answers reel.
8. Summary.

## Quiz block

A fenced block with the language `quiz` becomes interactive in the reel. Questions are separated by a line with `---`. Each has `type:` and `question:`.

- `type: text`: open answer. Add `answer:`, alternatives split by `|`. Case and extra spaces are ignored.
- `type: single`: one correct option. Options are `- [x] correct` and `- [ ] wrong`, exactly one `[x]`.
- `type: multiple`: several correct options, at least one `[x]`. Every correct one must be picked.
- At least two options for `single` and `multiple`.

An invalid block (missing `question:`, no correct option, two correct in `single`) shows as plain code, so check the shape before saving. Answers are never stored. Plain text only inside the block, no Markdown formatting.

```quiz
type: text
question: What does RLS stand for?
answer: Row Level Security
---
type: single
question: Which clause filters rows in a policy?
- [x] using
- [ ] returning
---
type: multiple
question: Which are Postgres roles used by Supabase?
- [x] anon
- [x] authenticated
- [ ] guest
```

## Beginner perspective

Explain every term at its first use, in one plain sentence. Never assume prior knowledge that the glossary does not give.

## Technical rules

- Add reels in order. The order of the `reels` array is the order in the app.
- After you move a reel (`update_knowledge_reel` position), check the order with `get_knowledge_topic`.
- Tags: call `list_knowledge_tags` first and reuse names. No duplicates (case is ignored). Missing tags are created by `create_knowledge_lesson`.
- Delete nothing without an explicit request. Deleting a catalog deletes all its content.
- Mark facts you did not verify, in the text (for example "unverified").
- One reel stays under 8000 characters. A lesson has at most 30 reels per call: split longer lessons.

## Style

Write in the voice of the reference below. Take the voice, not the structure: the structure of a lesson comes from the skeleton above.

- Provocative title.
- Open with a myth or a question.
- A paragraph that states the goal.
- Humor with rationed emoticons: `(¬_¬ )` and `(⌐■_■)`. Not in every paragraph.
- Headings that carry a narrative.
- **Bold** for key terms, and "A teraz najważniejsze:" style emphasis (in the course language).
- Analogies from everyday life.
- Address the reader directly. Short sentences.
- End with a "Summing up" section and a question to the reader.

### Voice reference (do not copy)

> # Od chaosu do dominacji w sieci
>
> Przyjrzyjmy się językowi JavaScript. Często słyszy się, że jest *chaotyczny*, *nieprzewidywalny* i pełen dziwactw. Z drugiej strony, jest dosłownie wszędzie i napędza niemal całą interaktywną sieć. Jak to możliwe, że technologia z taką reputacją osiągnęła taką dominację? Czy to tylko kwestia bycia "w dobrym miejscu o dobrym czasie"?
>
> Rzeczywistość, jak zwykle, jest **znacznie bardziej skomplikowana**... (¬_¬ )
>
> Zanim zaczniemy wnikać w technikalia i składnię, kluczowe jest zrozumienie otaczającego go kontekstu. To on daje pojęcie o tym, jak specyficzną technologią jest JavaScript i pozwala spojrzeć na jego zawiłości z odpowiedniej perspektywy.
>
> Celem tego artykułu jest szybkie i bezbolesne wyjaśnienie fundamentalnych kwestii: skąd wziął się ten pozorny chaos, jak język jest dzisiaj rozwijany w uporządkowany sposób, dlaczego jest tak elastyczny i ostatecznie – czemu jest absolutnie kluczową technologią, którą warto znać.
>
> ## Geneza w 10 Dni i Dziedzictwo Chaosu
>
> Pierwsze skojarzenie z chaosem w JS? Pewnie `[] == ![]` daje `true`. Skąd się biorą takie rzeczy? Aby to zrozumieć, musimy cofnąć się do 1995 roku. **Brendan Eich**, pracując dla **Netscape**, dostał zadanie: stworzyć "prosty język skryptowy" do przeglądarki. Miał na to... **10 dni**.
>
> W tak krótkim czasie nie da się zaprojektować idealnego języka. Wiele decyzji podejmowano w pośpiechu, a niektóre "dziwactwa" i niespójności (jak dwa sposoby porównywania wartości `==` vs `===` czy istnienie zarówno `null` jak i `undefined`) stały się częścią języka.
>
> **A teraz najważniejsze:** z powodu **wstecznej kompatybilności** – świętej zasady internetu, która mówi "nie psuj starych stron" – te wczesne decyzje zostały z nami na zawsze.
>
> ## Język Wielu Paradygmatów – Szwajcarski Scyzoryk Programisty
>
> Często mówi się, że JavaScript jest językiem **wieloparadygmatowym**. To mądre słowo oznacza po prostu, że nie zmusza Cię do jednego, sztywnego stylu kodowania. To jak posiadanie szwajcarskiego scyzoryka zamiast jednego noża.
>
> *Ehh, tak, wiem, że React to biblioteka, a nie framework... ale wiecie, o co chodzi ;)*
>
> ## Podsumowując – Kontekst Jest Kluczem
>
> Często popełnianym błędem przy nauce programowania jest skakanie prosto w składnię i technikalia języka, z pominięciem jego *duszy*. Kiedy rozumiemy, że język powstał w 10 dni, jego dziwactwa przestają być tylko irytującymi błędami, a stają się historyczną ciekawostką, z którą nauczyliśmy się żyć.
>
> A teraz pytanie do Ciebie: która z "dziwnych" części JavaScriptu najbardziej Cię kiedyś zaskoczyła? Daj znać w komentarzach! (⌐■_■)

### Technical reel example (this style)

```markdown
## Why does `[] == ![]` say true? (¬_¬ )

Looks like a bug. It is not. JavaScript tried to be *helpful*.

**Here is the key point:** `==` converts types before it compares.
Think of a waiter who "fixes" your order before the kitchen sees it.

1. `![]` is `false` (an array is truthy, `!` flips it)
2. `[] == false` makes both sides numbers
3. `0 == 0` is `true`

Fix: use `===`. No waiter, no surprises. (⌐■_■)
```

## Language notes

The language note for your language follows below, appended by the server.
