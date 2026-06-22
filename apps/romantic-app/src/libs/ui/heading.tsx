import { createElement, type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const levelClass: Record<Level, string> = {
  1: 't1',
  2: 't2',
  3: 't3',
  4: 't4',
  5: 't5',
  6: 't6',
};

export type HeadingProps = ComponentProps<'h2'> & {
  variant?: 'primary' | 'secondary';
  as?: `h${Level}`;
  level?: Level;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Heading = ({
  variant: _variant,
  as,
  level = 2,
  className,
  ...props
}: HeadingProps) => {
  const tag = as ?? (`h${level}` as `h${Level}`);
  return createElement(tag, {
    className: cn(levelClass[level], className),
    ...props,
  });
};
