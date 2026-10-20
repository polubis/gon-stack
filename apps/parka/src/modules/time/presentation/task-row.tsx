import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { TONE_DOT_CLASS, type Task } from '../configuration/constraints';
import { stagger } from './stagger';

type Props = Task & {
  /** Highlights the row of the current time. */
  now?: boolean;
  /** Entrance step; omit when a parent already animates the row. */
  step?: number;
};

/** Static task line: status icon, title, optional time and "now" highlight. */
export const TaskRow = ({ title, tone, done, slot, now, step }: Props) => (
  <li
    aria-current={now ? 'time' : undefined}
    style={step === undefined ? undefined : stagger(step)}
    className={cn(
      'flex items-center gap-3 rounded-xl border p-3',
      step !== undefined && 'animate-item-in motion-reduce:animate-none',
      now ? 'border-brand bg-brand-softer' : 'border-line',
    )}
  >
    {done ? (
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-brand"
        aria-hidden="true"
      />
    ) : (
      <Circle className="h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />
    )}
    <p
      className={cn(
        'min-w-0 flex-1 text-sm font-medium',
        done && 'text-ink-soft line-through',
      )}
    >
      <span className="sr-only">{done ? 'Zrobione: ' : 'Do zrobienia: '}</span>
      {title}
    </p>
    {slot.kind === 'timed' ? (
      <time className="shrink-0 text-xs tabular-nums text-ink-soft">
        {slot.at}
      </time>
    ) : null}
    <span
      className={cn('h-2.5 w-2.5 shrink-0 rounded-full', TONE_DOT_CLASS[tone])}
      aria-hidden="true"
    />
  </li>
);
