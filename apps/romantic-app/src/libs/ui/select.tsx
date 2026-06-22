import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SelectProps = ComponentProps<'select'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Select = ({
  variant: _variant,
  className,
  ...props
}: SelectProps) => {
  return (
    <select
      className={cn(
        'w-full px-3 py-2.5',
        'rounded-(--input-radius)',
        'border border-(--input-border) bg-(--input-bg)',
        'text-sm text-(--input-text)',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'appearance-none',
        'focus-visible:border-(--input-focus-border) focus-visible:shadow-(--input-focus-shadow)',
        'disabled:cursor-not-allowed',
        'disabled:border-(--input-disabled-border) disabled:bg-(--input-disabled-bg) disabled:text-(--input-disabled-text)',
        className,
      )}
      {...props}
    />
  );
};
