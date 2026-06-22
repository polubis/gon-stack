import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ProgressBarProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
  value?: number;
  max?: number;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const ProgressBar = ({
  variant = 'primary',
  value = 0,
  max = 100,
  className,
  ...props
}: ProgressBarProps) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        'border border-(--progress-track-border) bg-(--progress-track-bg)',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full',
          'transition-[width] duration-300 ease-out',
          'bg-linear-to-r',
          variant === 'primary' && [
            'from-(--progress-primary-from) to-(--progress-primary-to)',
            'shadow-lg shadow-(color:--progress-primary-glow)',
          ],
          variant === 'secondary' && [
            'from-(--progress-secondary-from) to-(--progress-secondary-to)',
            'shadow-lg shadow-(color:--progress-secondary-glow)',
          ],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
