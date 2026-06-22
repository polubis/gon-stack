import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type LabelProps = ComponentProps<'label'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Label = ({
  variant: _variant,
  className,
  ...props
}: LabelProps) => {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        'text-sm font-medium',
        'text-(--input-text)',
        'cursor-pointer',
        'select-none',
        className,
      )}
      {...props}
    />
  );
};
