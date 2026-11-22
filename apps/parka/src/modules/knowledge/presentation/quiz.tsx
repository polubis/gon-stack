import { CircleCheck, CircleX, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';

type Option = { text: string; correct: boolean };

export type QuizItem =
  | { type: 'text'; question: string; answers: string[] }
  | { type: 'single' | 'multiple'; question: string; options: Option[] };

const OPTION = /^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/;
const FIELD = /^\s*(type|question|answer)\s*:\s*(.*)$/i;

const normalize = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const parseItem = (lines: string[]): QuizItem | null => {
  let type = '';
  let question = '';
  let answer = '';
  const options: Option[] = [];
  for (const line of lines) {
    const option = OPTION.exec(line);
    if (option) {
      options.push({
        text: option[2]!.trim(),
        correct: option[1]!.toLowerCase() === 'x',
      });
      continue;
    }
    const field = FIELD.exec(line);
    if (!field) continue;
    const value = field[2]!.trim();
    const name = field[1]!.toLowerCase();
    if (name === 'type') type = value.toLowerCase();
    else if (name === 'question') question = value;
    else answer = value;
  }
  if (!question) return null;
  if (type === 'text') {
    const answers = answer
      .split('|')
      .map(normalize)
      .filter((a) => a !== '');
    return answers.length > 0 ? { type, question, answers } : null;
  }
  if (type !== 'single' && type !== 'multiple') return null;
  const correct = options.filter((o) => o.correct).length;
  if (options.length < 2 || correct === 0) return null;
  if (type === 'single' && correct !== 1) return null;
  return { type, question, options };
};

/**
 * Quiz source: items separated by a `---` line. Each item has `type:`
 * (`text` | `single` | `multiple`) and `question:`. `text` adds `answer:`
 * (alternatives split by `|`), the others list `- [x] ok` / `- [ ] no`.
 * Returns `null` when any item is invalid.
 */
export const parseQuiz = (source: string): QuizItem[] | null => {
  const items: QuizItem[] = [];
  let current: string[] = [];
  const flush = (): boolean => {
    const item = parseItem(current);
    current = [];
    if (!item) return false;
    items.push(item);
    return true;
  };
  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*-{3,}\s*$/.test(line)) {
      if (!flush()) return null;
    } else current.push(line);
  }
  return flush() ? items : null;
};

const isCorrect = (item: QuizItem, answer: string | number[]): boolean => {
  if (item.type === 'text')
    return (
      typeof answer === 'string' && item.answers.includes(normalize(answer))
    );
  if (typeof answer === 'string') return false;
  const expected = item.options.flatMap((o, at) => (o.correct ? [at] : []));
  return (
    expected.length === answer.length &&
    expected.every((at) => answer.includes(at))
  );
};

const QuizQuestion = ({ item, number }: { item: QuizItem; number: number }) => {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const answer = item.type === 'text' ? text : picked;
  const empty = item.type === 'text' ? text.trim() === '' : picked.length === 0;

  const change = (next: () => void) => {
    next();
    setResult(null);
  };
  const toggle = (at: number) =>
    change(() =>
      setPicked((prev) =>
        item.type === 'single'
          ? [at]
          : prev.includes(at)
            ? prev.filter((p) => p !== at)
            : [...prev, at],
      ),
    );

  return (
    <fieldset className="flex flex-col gap-2 rounded-2xl border border-line p-3">
      <legend className="px-1 font-semibold">
        {number}. {item.question}
      </legend>
      {item.type === 'text' ? (
        <div className="relative">
          <input
            ref={input}
            type="text"
            value={text}
            aria-label={`Odpowiedź ${number}`}
            onChange={(e) => change(() => setText(e.target.value))}
            className="w-full rounded-xl border border-line bg-card px-3 py-2 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          {text !== '' && (
            <button
              type="button"
              aria-label="Wyczyść odpowiedź"
              onClick={() => {
                change(() => setText(''));
                input.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
      ) : (
        item.options.map((option, at) => (
          <label
            key={at}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 hover:bg-hover-soft"
          >
            <input
              type={item.type === 'single' ? 'radio' : 'checkbox'}
              name={`${id}-q`}
              checked={picked.includes(at)}
              onChange={() => toggle(at)}
              className="size-4 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <span>{option.text}</span>
          </label>
        ))
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={empty}
          onClick={() => setResult(isCorrect(item, answer))}
          className="rounded-full bg-brand px-4 py-1.5 text-on-brand disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Sprawdź
        </button>
        <p role="status" className="flex items-center gap-1 text-sm">
          {result === true && (
            <>
              <CircleCheck aria-hidden className="size-4 text-brand" />
              <span className="text-brand-dark">Poprawna odpowiedź</span>
            </>
          )}
          {result === false && (
            <>
              <CircleX aria-hidden className="size-4 text-danger" />
              <span className="text-danger">Niepoprawna odpowiedź</span>
            </>
          )}
        </p>
      </div>
    </fieldset>
  );
};

/** Interactive quiz. Answers live in component state only, never stored. */
export const Quiz = ({ items }: { items: QuizItem[] }) => (
  <div className="flex flex-col gap-3">
    {items.map((item, at) => (
      <QuizQuestion key={at} item={item} number={at + 1} />
    ))}
  </div>
);
