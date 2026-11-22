import type { ReactNode } from 'react';
import { parseQuiz, Quiz } from './quiz';

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'code'; text: string; lang: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'rule' }
  | { type: 'paragraph'; text: string };

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const FENCE = /^```\s*([\w+-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

const safeHref = (raw: string): string | undefined => {
  try {
    const url = new URL(raw);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

const startsBlock = (line: string, next: string | undefined): boolean =>
  FENCE.test(line) ||
  HEADING.test(line) ||
  line.startsWith('>') ||
  BULLET.test(line) ||
  NUMBERED.test(line) ||
  /^\s*([-*_])(\s*\1){2,}\s*$/.test(line) ||
  (line.includes('|') && next !== undefined && TABLE_RULE.test(next));

const parse = (source: string): Block[] => {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === '') {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i]!))
        code.push(lines[i++]!);
      i++;
      blocks.push({ type: 'code', text: code.join('\n'), lang: fence[1]! });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: Math.min(heading[1]!.length, 3) as 1 | 2 | 3,
        text: heading[2]!.replace(/\s+#+\s*$/, ''),
      });
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'rule' });
      i++;
      continue;
    }
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('>'))
        quote.push(lines[i++]!.replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: quote.join('\n') });
      continue;
    }
    const list = BULLET.test(line)
      ? BULLET
      : NUMBERED.test(line)
        ? NUMBERED
        : null;
    if (list) {
      const items: string[] = [];
      while (i < lines.length && list.test(lines[i]!))
        items.push(list.exec(lines[i++]!)![1]!);
      blocks.push({ type: 'list', ordered: list === NUMBERED, items });
      continue;
    }
    if (line.includes('|') && lines[i + 1] && TABLE_RULE.test(lines[i + 1]!)) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i]!.includes('|'))
        rows.push(cells(lines[i++]!));
      blocks.push({ type: 'table', head, rows });
      continue;
    }
    const text: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      (text.length === 0 || !startsBlock(lines[i]!, lines[i + 1]))
    )
      text.push(lines[i++]!);
    blocks.push({ type: 'paragraph', text: text.join('\n') });
  }
  return blocks;
};

const INLINE =
  /`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|\[([^\]]+)\]\(([^)\s]+)\)/;

const inline = (text: string, key = ''): ReactNode[] => {
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest) {
    const m = INLINE.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const k = `${key}${n++}`;
    if (m[1] !== undefined)
      out.push(
        <code
          key={k}
          className="rounded-md bg-track px-1.5 py-0.5 font-mono text-[0.9em]"
        >
          {m[1]}
        </code>,
      );
    else if (m[2] !== undefined || m[3] !== undefined)
      out.push(
        <strong key={k} className="font-semibold">
          {inline(m[2] ?? m[3]!, k)}
        </strong>,
      );
    else if (m[4] !== undefined || m[5] !== undefined)
      out.push(<em key={k}>{inline(m[4] ?? m[5]!, k)}</em>);
    else if (safeHref(m[7]!) !== undefined)
      out.push(
        <a
          key={k}
          href={safeHref(m[7]!)}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-brand underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {inline(m[6]!, k)}
        </a>,
      );
    else out.push(m[6]);
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
};

const HEADING_CLASS = {
  1: 'text-2xl font-bold',
  2: 'text-xl font-semibold',
  3: 'text-lg font-semibold',
} as const;

const lineBreaks = (text: string, key: string): ReactNode[] =>
  text
    .split('\n')
    .flatMap((line, at) => [
      ...(at > 0 ? [<br key={`${key}br${at}`} />] : []),
      ...inline(line, `${key}l${at}`),
    ]);

const render = (block: Block, key: number): ReactNode => {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4';
      return (
        <Tag key={key} className={HEADING_CLASS[block.level]}>
          {inline(block.text)}
        </Tag>
      );
    }
    case 'code': {
      const quiz = block.lang === 'quiz' ? parseQuiz(block.text) : null;
      if (quiz) return <Quiz key={key} items={quiz} />;
      return (
        <pre
          key={key}
          tabIndex={0}
          className="overflow-x-auto rounded-2xl bg-track p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <code data-lang={block.lang || undefined}>{block.text}</code>
        </pre>
      );
    }
    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-brand pl-3 text-ink-soft"
        >
          {lineBreaks(block.text, `q${key}`)}
        </blockquote>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={key}
          className={`flex flex-col gap-1 pl-6 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {block.items.map((item, at) => (
            <li key={at}>{inline(item, `i${key}-${at}`)}</li>
          ))}
        </Tag>
      );
    }
    case 'table':
      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {block.head.map((cell, at) => (
                  <th
                    key={at}
                    scope="col"
                    className="border-b border-line-strong px-2 py-1 font-semibold"
                  >
                    {inline(cell, `h${key}-${at}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, at) => (
                    <td key={at} className="border-b border-line px-2 py-1">
                      {inline(cell, `c${key}-${r}-${at}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'rule':
      return <hr key={key} className="border-line" />;
    case 'paragraph':
      return <p key={key}>{lineBreaks(block.text, `p${key}`)}</p>;
  }
};

/**
 * Safe Markdown: parsed into React elements, never HTML. Raw tags show as
 * text, only `http(s)` and `mailto` links are kept (opened with `noopener`).
 * Supports headings, lists, bold/italic, inline code, fenced code,
 * blockquotes, tables, rules and links.
 */
export const Markdown = ({ source }: { source: string }) => (
  <div className="flex flex-col gap-3 break-words text-base leading-relaxed text-ink">
    {parse(source).map(render)}
  </div>
);
