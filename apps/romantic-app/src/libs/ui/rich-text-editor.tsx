import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type RichTextEditorProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const RichTextEditor = ({
  className,
  ...props
}: RichTextEditorProps) => {
  return <div className={cn('flex flex-col', className)} {...props} />;
};
