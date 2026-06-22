import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type FooterProps = ComponentProps<'footer'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Footer = ({ className, ...props }: FooterProps) => {
  return <footer className={cn('flex items-center', className)} {...props} />;
};
