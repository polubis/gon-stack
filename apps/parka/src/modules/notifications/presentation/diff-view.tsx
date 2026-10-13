import type { ComponentProps } from 'react';
import { diffRows } from '../domain/diff';
import type { Notification } from '../domain/models';
import { InlineDiff } from './inline-diff';

type Props = ComponentProps<'div'> & { notification: Notification };

/** The payload of one notification as labelled before/after rows. */
export const DiffView = ({ notification, ...rest }: Props) => {
  const rows = diffRows(notification);
  if (rows.length === 0) return null;

  return (
    <div role="group" className="mt-2 rounded-xl bg-surface p-3" {...rest}>
      <dl className="flex flex-col gap-1 text-xs">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
          >
            <dt className="shrink-0 text-ink-soft sm:w-28">{row.label}</dt>
            <dd className="min-w-0 flex-1">
              <InlineDiff before={row.before} after={row.after} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
