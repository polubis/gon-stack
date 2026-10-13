import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

type Props = ComponentProps<'div'> & {
  icon: LucideIcon;
  title: string;
  description: string;
};

/**
 * No-data pattern: icon, title and description. When filters are applied the
 * description names them, e.g. `No results for "phrase"`.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  className,
  ...rest
}: Props) => (
  <div
    role="status"
    className={cn(
      'flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center',
      className,
    )}
    {...rest}
  >
    <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    <p className="max-w-sm text-sm text-ink-soft">{description}</p>
  </div>
);
