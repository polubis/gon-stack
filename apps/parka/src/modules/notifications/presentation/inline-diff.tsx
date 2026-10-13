import { cn } from '@repo/react-kit/cn';
import { diffText } from '../domain/diff';
import type { DiffSegment } from '../domain/models';

const segmentsOf = (
  before: string | null,
  after: string | null,
): DiffSegment[] => {
  if (before !== null && after !== null) return diffText(before, after);
  if (after !== null) return [{ kind: 'added', text: after }];
  if (before !== null) return [{ kind: 'removed', text: before }];
  return [];
};

/**
 * Git-like inline diff of one value: removed text struck through, added text
 * highlighted. The strike/underline plus a screen-reader cue keep it readable
 * without relying on color alone.
 */
export const InlineDiff = ({
  before,
  after,
}: {
  before: string | null;
  after: string | null;
}) => (
  <span className="wrap-anywhere">
    {segmentsOf(before, after).map((segment, i) => {
      switch (segment.kind) {
        case 'same':
          return <span key={i}>{segment.text}</span>;
        case 'removed':
          return (
            <del
              key={i}
              className={cn(
                'rounded-sm bg-danger-soft px-0.5 text-danger line-through',
              )}
            >
              <span className="sr-only">usunięto: </span>
              {segment.text}
            </del>
          );
        case 'added':
          return (
            <ins
              key={i}
              className="rounded-sm bg-brand-soft px-0.5 font-medium text-brand-dark underline"
            >
              <span className="sr-only">dodano: </span>
              {segment.text}
            </ins>
          );
        default: {
          const unreachable: never = segment.kind;
          return unreachable;
        }
      }
    })}
  </span>
);
