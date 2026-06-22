import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type FieldsetProps = ComponentProps<'fieldset'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Fieldset = ({ className, ...props }: FieldsetProps) => {
  return <fieldset className={cn('flex flex-col', className)} {...props} />;
};
