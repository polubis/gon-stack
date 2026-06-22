import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type RadioButtonProps = ComponentProps<'input'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const RadioButton = ({
  variant: _variant,
  className,
  ...props
}: RadioButtonProps) => {
  return (
    <input
      type="radio"
      className={cn(
        'size-4 cursor-pointer',
        'appearance-none rounded-full',
        'border-2 border-(--checkbox-border) bg-(--checkbox-bg)',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--checkbox-focus) focus-visible:ring-offset-0',
        'checked:border-(--checkbox-checked-border) checked:bg-(--checkbox-checked-bg)',
        'checked:[background-image:radial-gradient(circle,white_35%,transparent_35%)]',
        'disabled:cursor-not-allowed',
        'disabled:border-(--checkbox-disabled-border) disabled:bg-(--checkbox-disabled-bg)',
        className,
      )}
      {...props}
    />
  );
};
