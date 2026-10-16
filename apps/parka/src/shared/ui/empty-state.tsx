import type { ComponentProps, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

type Props = ComponentProps<'div'> & {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Primary action, e.g. the button that creates the first item. */
  action?: ReactNode;
  /** `card` sits inside a tile under its own `h2`, so it is smaller and titled `h3`. */
  variant?: 'page' | 'card';
};

/**
 * No-data pattern: `icon : title : description : primary-action`. When filters
 * are applied the description names them, e.g. `No results for "phrase"`.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'page',
  className,
  ...rest
}: Props) => {
  const card = variant === 'card';
  const Title = card ? 'h3' : 'h2';
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong px-4 text-center',
        card ? 'py-4' : 'py-8',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full bg-brand-soft text-brand',
          card ? 'h-10 w-10' : 'h-12 w-12',
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <Title
        className={cn('font-semibold text-ink', card ? 'text-sm' : 'text-base')}
      >
        {title}
      </Title>
      <p className={cn('max-w-sm text-ink-soft', card ? 'text-xs' : 'text-sm')}>
        {description}
      </p>
      {action}
    </div>
  );
};
