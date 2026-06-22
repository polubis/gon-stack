import { type ComponentProps, forwardRef } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type BadgeProps = ComponentProps<'span'> & {
  /**
   * Visual variant that determines the badge's color scheme and styling.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'rounded-full',
          'transition-colors duration-100',
          // Typography
          'text-[0.6875rem] font-medium uppercase tracking-[0.11em]',
          // Padding
          'px-2.5 py-1',
          // Primary variant
          variant === 'primary' && [
            'text-(--badge-primary-text)',
            'border border-(--badge-primary-border) bg-(--badge-primary-bg)',
          ],
          // Secondary variant
          variant === 'secondary' && [
            'text-(--badge-secondary-text)',
            'border border-(--badge-secondary-border) bg-(--badge-secondary-bg)',
          ],
          // Allow caller overrides
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';
