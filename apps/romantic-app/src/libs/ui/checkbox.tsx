import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type CheckboxProps = ComponentProps<'input'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Checkbox = ({
  variant: _variant,
  className,
  ...props
}: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-4 cursor-pointer',
        'appearance-none rounded-sm',
        'border-2 border-(--checkbox-border) bg-(--checkbox-bg)',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--checkbox-focus) focus-visible:ring-offset-0',
        'checked:border-(--checkbox-checked-border) checked:bg-(--checkbox-checked-bg)',
        "checked:[background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E\")] checked:[background-position:center] checked:[background-repeat:no-repeat]",
        'disabled:cursor-not-allowed',
        'disabled:border-(--checkbox-disabled-border) disabled:bg-(--checkbox-disabled-bg)',
        className,
      )}
      {...props}
    />
  );
};
