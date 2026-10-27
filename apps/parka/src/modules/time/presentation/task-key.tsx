import type { ComponentProps } from 'react';
import { cn } from '@repo/react-kit/cn';
import { Skeleton } from '@/shared/ui/skeleton';

type Props = Omit<ComponentProps<'span'>, 'children'> & {
  /** Unique readable key of a task; a placeholder of the same size shows until the server set it. */
  taskKey: string | null;
};

/** Same box for the placeholder and the key, so the line does not jump when the key arrives. */
const BOX = 'inline-block h-4 min-w-12 shrink-0';

/** Jira-like task key (`ABC-7`), muted and monospaced. */
export const TaskKey = ({ taskKey, className, ...rest }: Props) =>
  taskKey === null ? (
    <span
      aria-hidden="true"
      className={cn(BOX, 'align-middle', className)}
      {...rest}
    >
      <Skeleton className="h-full w-full" />
    </span>
  ) : (
    <span
      aria-label={`Identyfikator zadania: ${taskKey}`}
      className={cn(
        BOX,
        'font-mono text-xs leading-4 tabular-nums text-ink-soft',
        className,
      )}
      {...rest}
    >
      {taskKey}
    </span>
  );
