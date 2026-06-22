import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type HeaderProps = ComponentProps<'header'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Header = ({ className, ...props }: HeaderProps) => {
  return <header className={cn('flex items-center', className)} {...props} />;
};
