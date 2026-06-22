import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ColorPickerProps = ComponentProps<'input'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const ColorPicker = ({
  variant: _variant,
  className,
  ...props
}: ColorPickerProps) => {
  return (
    <input
      type="color"
      className={cn(
        'size-10 cursor-pointer',
        'rounded-(--input-radius)',
        'border border-(--color-picker-border) bg-(--color-picker-bg)',
        'p-0.5',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus:border-(--input-focus-border) focus:ring-2 focus:ring-(--color-picker-focus)',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};
