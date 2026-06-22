import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-(--btn-radius) px-4 py-2.5',
        'text-sm font-semibold uppercase tracking-[0.14em]',
        'transition-all duration-160 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--btn-focus) focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed',
        variant === 'primary' && [
          'text-(--btn-primary-text)',
          'bg-linear-to-r from-(--btn-primary-from) to-(--btn-primary-to)',
          'shadow-lg shadow-(color:--btn-primary-glow)',
          'enabled:hover:saturate-[1.2]',
          'disabled:shadow-none',
          'disabled:from-(--btn-primary-disabled-from) disabled:to-(--btn-primary-disabled-to) disabled:text-(--btn-primary-disabled-text)',
        ],
        variant === 'secondary' && [
          'text-(--btn-secondary-text)',
          'border border-(--btn-secondary-border) bg-(--btn-secondary-bg)',
          'enabled:hover:bg-(--btn-secondary-bg-hover)',
          'disabled:border-(--btn-secondary-disabled-border) disabled:bg-(--btn-secondary-disabled-bg) disabled:text-(--btn-secondary-disabled-text)',
        ],
        className,
      )}
      {...props}
    />
  );
};
